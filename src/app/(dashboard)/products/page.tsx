import { Header } from "@/components/layout/header";
import { ProductsClient } from "@/components/products/products-client";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const [products, categories, suppliers] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, supplier: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <Header title="Products" subtitle="Manage your product catalog" />
      <div className="p-6">
        <ProductsClient
          products={serialize(products)}
          categories={serialize(categories)}
          suppliers={serialize(suppliers)}
        />
      </div>
    </div>
  );
}
