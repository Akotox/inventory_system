import { Header } from "@/components/layout/header";
import { NewPOForm } from "@/components/purchases/new-po-form";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Purchase Order" };

export default async function NewPOPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;

  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { supplier: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <Header title="New Purchase Order" subtitle="Create a supplier order" />
      <div className="p-6">
        <NewPOForm
          suppliers={serialize(suppliers)}
          products={serialize(products)}
          preselectedProductId={productId}
        />
      </div>
    </div>
  );
}
