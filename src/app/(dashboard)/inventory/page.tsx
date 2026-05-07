import { Header } from "@/components/layout/header";
import { InventoryClient } from "@/components/inventory/inventory-client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const [movements, products, categories] = await Promise.all([
    prisma.inventoryMovement.findMany({
      include: {
        product: true,
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.product.findMany({
      include: { category: true, supplier: true },
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <Header title="Inventory" subtitle="Stock levels and movement history" />
      <div className="p-6">
        <InventoryClient
          movements={serialize(movements)}
          products={serialize(products)}
          categories={serialize(categories)}
        />
      </div>
    </div>
  );
}
