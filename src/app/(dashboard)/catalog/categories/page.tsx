import { Header } from "@/components/layout/header";
import { CategoriesClient } from "@/components/catalog/categories-client";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <Header title="Categories" subtitle="Organise your product catalog" />
      <div className="p-6">
        <CategoriesClient categories={categories} />
      </div>
    </div>
  );
}
