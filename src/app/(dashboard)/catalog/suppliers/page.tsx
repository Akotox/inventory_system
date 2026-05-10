import { Header } from "@/components/layout/header";
import { SuppliersClient } from "@/components/catalog/suppliers-client";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: { select: { products: true, purchaseOrders: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <Header title="Suppliers" subtitle="Manage your supplier contacts" />
      <div className="p-6">
        <SuppliersClient suppliers={suppliers} />
      </div>
    </div>
  );
}
