import { Header } from "@/components/layout/header";
import { ReportsClient } from "@/components/reports/reports-client";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { subDays, startOfDay } from "date-fns";

export const metadata: Metadata = { title: "Reports" };

async function getReportData() {
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));

  const [rawSales, topProducts, stockValuation] = await Promise.all([
    // Fetch all non-void sales in last 30 days, group by date in JS
    prisma.sale.findMany({
      where: {
        saleDate: { gte: thirtyDaysAgo },
        status: { not: "VOID" },
      },
      select: { saleDate: true, total: true },
      orderBy: { saleDate: "asc" },
    }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: 10,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        name: true,
        sku: true,
        stockQuantity: true,
        costPrice: true,
        sellingPrice: true,
      },
      orderBy: { stockQuantity: "desc" },
    }),
  ]);

  // Group sales by date (YYYY-MM-DD)
  const salesByDay = rawSales.reduce<
    { date: string; revenue: number; count: number }[]
  >((acc, sale) => {
    const date = sale.saleDate.toISOString().split("T")[0];
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing.revenue += Number(sale.total);
      existing.count += 1;
    } else {
      acc.push({ date, revenue: Number(sale.total), count: 1 });
    }
    return acc;
  }, []);

  const productIds = topProducts.map((p) => p.productId);
  const productDetails = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      sku: true,
      sellingPrice: true,
      costPrice: true,
    },
  });

  const topProductsWithDetails = topProducts.map((tp) => {
    const detail = productDetails.find((p) => p.id === tp.productId);
    const selling = Number(detail?.sellingPrice ?? 0);
    const cost = Number(detail?.costPrice ?? 0);
    return {
      productId: tp.productId,
      name: detail?.name ?? "Unknown",
      sku: detail?.sku ?? "",
      revenue: Number(tp._sum.lineTotal ?? 0),
      unitsSold: tp._sum.quantity ?? 0,
      margin: selling > 0 ? ((selling - cost) / selling) * 100 : 0,
    };
  });

  const totalStockValue = stockValuation.reduce(
    (sum, p) => sum + p.stockQuantity * Number(p.costPrice),
    0
  );

  return {
    salesByDay,
    topProducts: topProductsWithDetails,
    stockValuation,
    totalStockValue,
  };
}

export default async function ReportsPage() {
  const data = await getReportData();

  return (
    <div>
      <Header title="Reports" subtitle="Analytics and business insights" />
      <div className="p-6">
        <ReportsClient data={data} />
      </div>
    </div>
  );
}
