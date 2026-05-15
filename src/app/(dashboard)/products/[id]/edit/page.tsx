import { Header } from "@/components/layout/header";
import { ProductForm } from "@/components/products/product-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  return { title: product ? `Edit ${product.name}` : "Product Not Found" };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Header title="Edit Product" subtitle={`Updating ${product.name}`} />
      <div className="p-6">
        <ProductForm 
          product={serialize(product)} 
          categories={serialize(categories)} 
          suppliers={serialize(suppliers)} 
        />
      </div>
    </div>
  );
}
