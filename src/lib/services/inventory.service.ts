import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tx = any;

export class InventoryService {
  /** Deduct stock on sale and record movement */
  static async deductStock(
    productId: string,
    qty: number,
    saleId: string,
    userId: string
  ) {
    return prisma.$transaction(async (tx: Tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
      });

      const before = product.stockQuantity;
      const after = before - qty;

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: after },
      });

      return tx.inventoryMovement.create({
        data: {
          productId,
          type: "SALE",
          quantity: -qty,
          quantityBefore: before,
          quantityAfter: after,
          referenceId: saleId,
          referenceType: "SALE",
          createdById: userId,
        },
      });
    });
  }

  /** Add stock on purchase order receive */
  static async receiveStock(
    productId: string,
    qty: number,
    poId: string,
    userId: string
  ) {
    return prisma.$transaction(async (tx: Tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
      });

      const before = product.stockQuantity;
      const after = before + qty;

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: after },
      });

      return tx.inventoryMovement.create({
        data: {
          productId,
          type: "PURCHASE",
          quantity: qty,
          quantityBefore: before,
          quantityAfter: after,
          referenceId: poId,
          referenceType: "PURCHASE_ORDER",
          createdById: userId,
        },
      });
    });
  }

  /** Manual stock adjustment */
  static async adjustStock(
    productId: string,
    qty: number,
    reason: string,
    userId: string
  ) {
    return prisma.$transaction(async (tx: Tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
      });

      const before = product.stockQuantity;
      const after = before + qty;

      if (after < 0) throw new Error("Stock cannot go below zero");

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: after },
      });

      return tx.inventoryMovement.create({
        data: {
          productId,
          type: "ADJUSTMENT",
          quantity: qty,
          quantityBefore: before,
          quantityAfter: after,
          notes: reason,
          createdById: userId,
        },
      });
    });
  }

  /** Return stock from a voided sale */
  static async returnStock(
    productId: string,
    qty: number,
    saleId: string,
    userId: string
  ) {
    return prisma.$transaction(async (tx: Tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
      });

      const before = product.stockQuantity;
      const after = before + qty;

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: after },
      });

      return tx.inventoryMovement.create({
        data: {
          productId,
          type: "RETURN",
          quantity: qty,
          quantityBefore: before,
          quantityAfter: after,
          referenceId: saleId,
          referenceType: "SALE",
          notes: "Stock returned from voided sale",
          createdById: userId,
        },
      });
    });
  }

  /** Get all products at or below reorder level */
  static async getLowStockProducts() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, supplier: true },
    });
    return products.filter((p: { stockQuantity: number; reorderLevel: number }) => p.stockQuantity <= p.reorderLevel);
  }
}
