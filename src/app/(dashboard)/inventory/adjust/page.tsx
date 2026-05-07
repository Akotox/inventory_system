import { Header } from "@/components/layout/header";
import { AdjustStockForm } from "@/components/inventory/adjust-stock-form";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Adjust Stock" };

export default async function AdjustStockPage({
  searchParams,
}: {
  searchParams: { productId?: string };
}) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <Header title="Stock Adjustment" subtitle="Manually adjust inventory levels" />
      <div className="p-6">
        <AdjustStockForm
          products={serialize(products)}
          preselectedProductId={searchParams.productId}
        />
      </div>
    </div>
  );
}
