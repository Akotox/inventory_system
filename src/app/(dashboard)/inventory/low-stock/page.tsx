import { Header } from "@/components/layout/header";
import { LowStockClient } from "@/components/inventory/low-stock-client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Low Stock" };

export default async function LowStockPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true, supplier: true },
    orderBy: { stockQuantity: "asc" },
  });

  const lowStock = products.filter((p) => p.stockQuantity <= p.reorderLevel);

  return (
    <div>
      <Header
        title="Low Stock Alerts"
        subtitle={`${lowStock.length} products need reordering`}
      />
      <div className="p-6">
        <LowStockClient products={serialize(lowStock)} />
      </div>
    </div>
  );
}
