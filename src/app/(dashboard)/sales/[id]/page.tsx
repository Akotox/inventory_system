import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SaleDetailView } from "@/components/sales/sale-detail-view";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const sale = await prisma.sale.findUnique({ where: { id: params.id } });
  return { title: sale ? `Sale ${sale.saleNumber}` : "Sale Not Found" };
}

export default async function SaleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      user: true,
      saleItems: {
        include: { product: true },
      },
    },
  });

  if (!sale) notFound();

  return (
    <div>
      <Header
        title={`Sale ${sale.saleNumber}`}
        subtitle={`${sale.status} · ${new Date(sale.saleDate).toLocaleDateString()}`}
      />
      <div className="p-6">
        <SaleDetailView sale={serialize(sale)} />
      </div>
    </div>
  );
}
