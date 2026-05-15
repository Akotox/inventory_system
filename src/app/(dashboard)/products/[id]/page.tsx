import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products/product-detail-view";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  return { title: product ? product.name : "Product Not Found" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
    },
  });

  if (!product) notFound();

  return (
    <div>
      <Header
        title={product.name}
        subtitle={`${product.category?.name || "Uncategorized"} · ${product.sku}`}
      />
      <div className="p-6">
        <ProductDetailView product={serialize(product)} />
      </div>
    </div>
  );
}
