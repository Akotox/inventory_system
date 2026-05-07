import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PODetailView } from "@/components/purchases/po-detail-view";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const po = await prisma.purchaseOrder.findUnique({ where: { id: params.id } });
  return { title: po ? `PO ${po.poNumber}` : "PO Not Found" };
}

export default async function PODetailPage({
  params,
}: {
  params: { id: string };
}) {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      poItems: { include: { product: true } },
    },
  });

  if (!po) notFound();

  return (
    <div>
      <Header
        title={`Purchase Order ${po.poNumber}`}
        subtitle={`${po.supplier.name} · ${po.status}`}
      />
      <div className="p-6">
        <PODetailView po={serialize(po)} />
      </div>
    </div>
  );
}
