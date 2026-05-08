import { Header } from "@/components/layout/header";
import { DashboardStats } from "@/components/dashboard/stats-cards";
import { RecentSalesTable } from "@/components/dashboard/recent-sales-table";
import { LowStockTable } from "@/components/dashboard/low-stock-table";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { startOfDay, subDays } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));

  const [
    todaySales,
    yesterdaySales,
    lowStockProducts,
    pendingPOs,
    recentSales,
    rawSales,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { saleDate: { gte: today }, status: { not: "VOID" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        saleDate: { gte: yesterday, lt: today },
        status: { not: "VOID" },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, supplier: true },
      orderBy: { stockQuantity: "asc" },
    }),
    prisma.purchaseOrder.count({
      where: { status: { in: ["DRAFT", "SENT", "PARTIAL"] } },
    }),
    prisma.sale.findMany({
      take: 10,
      orderBy: { saleDate: "desc" },
      include: { customer: true, user: true, saleItems: true },
    }),
    // Last 7 days — fetch rows and group in JS to avoid raw SQL quoting issues
    prisma.sale.findMany({
      where: {
        saleDate: { gte: subDays(new Date(), 7) },
        status: { not: "VOID" },
      },
      select: { saleDate: true, total: true },
      orderBy: { saleDate: "asc" },
    }),
  ]);

  // Group by date string (YYYY-MM-DD)
  const revenueByDay = rawSales.reduce<{ date: string; revenue: number }[]>(
    (acc, sale) => {
      const date = sale.saleDate.toISOString().split("T")[0];
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.revenue += Number(sale.total);
      } else {
        acc.push({ date, revenue: Number(sale.total) });
      }
      return acc;
    },
    []
  );

  const lowStock = lowStockProducts.filter(
    (p) => p.stockQuantity <= p.reorderLevel
  );

  const todayRevenue = Number(todaySales._sum.total ?? 0);
  const yesterdayRevenue = Number(yesterdaySales._sum.total ?? 0);
  const revenueChange =
    yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

  return {
    stats: {
      todayRevenue,
      todaySalesCount: todaySales._count,
      lowStockCount: lowStock.length,
      pendingPOCount: pendingPOs,
      revenueChange,
      salesChange: 0,
    },
    lowStockProducts: lowStock.slice(0, 10),
    recentSales,
    revenueByDay,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData();

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${session?.user?.name?.split(" ")[0]}`}
      />
      <div className="p-6 space-y-6">
        <DashboardStats stats={data.stats} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RevenueChart data={data.revenueByDay} />
          </div>
          <div>
            <LowStockTable products={data.lowStockProducts} />
          </div>
        </div>

        <RecentSalesTable sales={data.recentSales} />
      </div>
    </div>
  );
}
