import { prisma } from "@/lib/prisma";
import { POStatus } from "@prisma/client";
import { generatePONumber } from "@/lib/utils";

export interface CreatePOItemDTO {
  productId: string;
  quantityOrdered: number;
  unitCost: number;
}

export interface CreatePODTO {
  supplierId: string;
  items: CreatePOItemDTO[];
  notes?: string;
  expectedDate?: Date;
}

export interface ReceiveItemDTO {
  poItemId: string;
  productId: string;
  quantityReceived: number;
}

export class PurchaseService {
  /** Create purchase order */
  static async createPO(payload: CreatePODTO) {
    const lastPO = await prisma.purchaseOrder.findFirst({
      orderBy: { poNumber: "desc" },
    });
    const lastNum = lastPO
      ? parseInt(lastPO.poNumber.replace("PO-", ""), 10)
      : 0;
    const poNumber = generatePONumber(lastNum);

    const totalAmount = payload.items.reduce(
      (sum, item) => sum + item.quantityOrdered * item.unitCost,
      0
    );

    return prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: payload.supplierId,
        totalAmount,
        notes: payload.notes,
        expectedDate: payload.expectedDate,
        poItems: {
          create: payload.items.map((item) => ({
            productId: item.productId,
            quantityOrdered: item.quantityOrdered,
            unitCost: item.unitCost,
            lineTotal: item.quantityOrdered * item.unitCost,
          })),
        },
      },
      include: { poItems: true, supplier: true },
    });
  }

  /** Receive items and update inventory */
  static async receiveItems(
    poId: string,
    items: ReceiveItemDTO[],
    userId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id: poId },
        include: { poItems: true },
      });

      if (po.status === POStatus.CANCELLED) {
        throw new Error("Cannot receive items for a cancelled PO");
      }
      if (po.status === POStatus.RECEIVED) {
        throw new Error("PO is already fully received");
      }

      for (const item of items) {
        const poItem = await tx.pOItem.findUniqueOrThrow({
          where: { id: item.poItemId },
        });

        const newReceived = poItem.quantityReceived + item.quantityReceived;
        if (newReceived > poItem.quantityOrdered) {
          throw new Error("Cannot receive more than ordered quantity");
        }

        await tx.pOItem.update({
          where: { id: item.poItemId },
          data: { quantityReceived: newReceived },
        });

        // Update product stock
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });
        const before = product.stockQuantity;
        const after = before + item.quantityReceived;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: after },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "PURCHASE",
            quantity: item.quantityReceived,
            quantityBefore: before,
            quantityAfter: after,
            referenceId: poId,
            referenceType: "PURCHASE_ORDER",
            createdById: userId,
          },
        });
      }

      // Determine new PO status
      const updatedItems = await tx.pOItem.findMany({ where: { purchaseOrderId: poId } });
      const allReceived = updatedItems.every(
        (i) => i.quantityReceived >= i.quantityOrdered
      );
      const anyReceived = updatedItems.some((i) => i.quantityReceived > 0);

      const newStatus = allReceived
        ? POStatus.RECEIVED
        : anyReceived
        ? POStatus.PARTIAL
        : po.status;

      return tx.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: newStatus,
          receivedDate: allReceived ? new Date() : undefined,
        },
        include: { poItems: { include: { product: true } }, supplier: true },
      });
    });
  }

  /** Auto-generate POs for all low-stock products */
  static async generateReorderPOs(userId: string) {
    const lowStockProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { supplier: true },
    });

    const filtered = lowStockProducts.filter(
      (p) => p.stockQuantity <= p.reorderLevel && p.supplierId
    );

    // Group by supplier
    const bySupplier = new Map<string, typeof filtered>();
    for (const product of filtered) {
      if (!product.supplierId) continue;
      const existing = bySupplier.get(product.supplierId) ?? [];
      existing.push(product);
      bySupplier.set(product.supplierId, existing);
    }

    const pos = [];
    for (const [supplierId, products] of bySupplier) {
      const po = await PurchaseService.createPO({
        supplierId,
        items: products.map((p) => ({
          productId: p.id,
          quantityOrdered: p.reorderQuantity,
          unitCost: Number(p.costPrice),
        })),
        notes: "Auto-generated reorder PO",
      });
      pos.push(po);
    }

    return pos;
  }
}
