import { Header } from "@/components/layout/header";
import { PurchasesClient } from "@/components/purchases/purchases-client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Purchase Orders" };

export default async function PurchasesPage() {
  const [purchaseOrders, suppliers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        poItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <Header title="Purchase Orders" subtitle="Track supplier orders and receiving" />
      <div className="p-6">
        <PurchasesClient purchaseOrders={serialize(purchaseOrders)} suppliers={serialize(suppliers)} />
      </div>
    </div>
  );
}
