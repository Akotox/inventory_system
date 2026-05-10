import { prisma } from "@/lib/prisma";
import { SaleStatus, PaymentMethod } from "@prisma/client";
import { InventoryService } from "./inventory.service";
import { AccountingService } from "./accounting.service";
import { generateSaleNumber } from "@/lib/utils";

export interface CreateSaleItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateSaleDTO {
  customerId?: string | null;
  userId: string;
  items: CreateSaleItemDTO[];
  discount?: number;
  tax?: number;
  paymentMethod?: PaymentMethod;
  status?: SaleStatus;
  notes?: string;
}

export interface RefundItemDTO {
  productId: string;
  quantity: number;
}

export class SalesService {
  /** Create sale, deduct stock, record movements atomically */
  static async createSale(payload: CreateSaleDTO) {
    return prisma.$transaction(async (tx) => {
      // Generate sale number
      const lastSale = await tx.sale.findFirst({
        orderBy: { saleNumber: "desc" },
      });
      const lastNum = lastSale
        ? parseInt(lastSale.saleNumber.replace("S-", ""), 10)
        : 1000;
      const saleNumber = generateSaleNumber(lastNum);

      // Calculate totals
      let subtotal = 0;
      const lineItems = [];

      for (const item of payload.items) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });

        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemDiscount = item.discount ?? 0;
        const lineTotal = item.unitPrice * item.quantity - itemDiscount;
        subtotal += lineTotal;

        lineItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: itemDiscount,
          lineTotal,
        });
      }

      const discount = payload.discount ?? 0;
      const taxableAmount = subtotal - discount;
      const tax = payload.tax ?? taxableAmount * 0.1;
      const total = taxableAmount + tax;

      // Create sale
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: payload.customerId,
          userId: payload.userId,
          subtotal,
          discount,
          tax,
          total,
          paymentMethod: payload.paymentMethod ?? PaymentMethod.CASH,
          status: payload.status ?? SaleStatus.PAID,
          notes: payload.notes,
          saleItems: { create: lineItems },
        },
        include: { saleItems: true },
      });

      // Deduct stock for each item
      for (const item of payload.items) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });
        const before = product.stockQuantity;
        const after = before - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: after },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: -item.quantity,
            quantityBefore: before,
            quantityAfter: after,
            referenceId: sale.id,
            referenceType: "SALE",
            createdById: payload.userId,
          },
        });
      }

      // Update customer total spent
      if (payload.customerId) {
        await tx.customer.update({
          where: { id: payload.customerId },
          data: { totalSpent: { increment: total } },
        });
      }

      // ─── Financial Accounting Integration ───
      // 1. Ensure default accounts exist
      // Note: In a high-traffic system, you'd cache these or run once at startup
      const accounts = await AccountingService.getOrCreateDefaultAccounts();
      
      // 2. Record Income
      await AccountingService.recordTransaction(tx, {
        description: `Sale ${saleNumber}`,
        amount: Number(total),
        fromAccountName: "Sales Income",
        toAccountName: "Cash", // Default to Cash for now
        referenceId: sale.id,
        referenceType: "SALE",
        createdById: payload.userId,
      });

      return sale;
    });
  }

  /** Void sale and restore stock */
  static async voidSale(saleId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUniqueOrThrow({
        where: { id: saleId },
        include: { saleItems: true },
      });

      if (sale.status === SaleStatus.VOID) {
        throw new Error("Sale is already voided");
      }

      // Restore stock
      for (const item of sale.saleItems) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });
        const before = product.stockQuantity;
        const after = before + item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: after },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "RETURN",
            quantity: item.quantity,
            quantityBefore: before,
            quantityAfter: after,
            referenceId: saleId,
            referenceType: "SALE",
            notes: "Stock returned from voided sale",
            createdById: userId,
          },
        });
      }

      // Update customer total spent
      if (sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: { totalSpent: { decrement: Number(sale.total) } },
        });
      }

      return tx.sale.update({
        where: { id: saleId },
        data: { status: SaleStatus.VOID },
      });
    });
  }
}
