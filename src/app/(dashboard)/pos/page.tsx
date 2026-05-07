import { Header } from "@/components/layout/header";
import { POSClient } from "@/components/pos/pos-client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Point of Sale" };

export default async function POSPage() {
  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, stockQuantity: { gt: 0 } },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <Header title="Point of Sale" subtitle="Process new sales" />
      <div className="p-6">
        <POSClient products={serialize(products)} customers={serialize(customers)} />
      </div>
    </div>
  );
}
