import { Header } from "@/components/layout/header";
import { SalesClient } from "@/components/sales/sales-client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sales" };

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    include: {
      customer: true,
      user: true,
      saleItems: { include: { product: true } },
    },
    orderBy: { saleDate: "desc" },
    take: 500,
  });

  return (
    <div>
      <Header title="Sales" subtitle="View and manage all transactions" />
      <div className="p-6">
        <SalesClient sales={serialize(sales)} />
      </div>
    </div>
  );
}
