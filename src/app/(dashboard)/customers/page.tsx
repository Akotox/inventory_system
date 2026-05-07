import { Header } from "@/components/layout/header";
import { CustomersClient } from "@/components/customers/customers-client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      _count: { select: { sales: true } },
      sales: {
        select: { saleDate: true },
        orderBy: { saleDate: "desc" },
        take: 1,
      },
    },
    orderBy: { totalSpent: "desc" },
  });

  return (
    <div>
      <Header title="Customers" subtitle="Manage customer records" />
      <div className="p-6">
        <CustomersClient customers={serialize(customers)} />
      </div>
    </div>
  );
}
