import { Header } from "@/components/layout/header";
import { ProductForm } from "@/components/products/product-form";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <Header title="New Product" subtitle="Add a product to your catalog" />
      <div className="p-6">
        <ProductForm categories={serialize(categories)} suppliers={serialize(suppliers)} />
      </div>
    </div>
  );
}
