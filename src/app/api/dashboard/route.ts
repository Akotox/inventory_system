import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));

  const [todaySales, yesterdaySales, lowStockCount, pendingPOCount] =
    await Promise.all([
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
      prisma.product.count({ where: { isActive: true } }),
      prisma.purchaseOrder.count({
        where: { status: { in: ["DRAFT", "SENT", "PARTIAL"] } },
      }),
    ]);

  const todayRevenue = Number(todaySales._sum.total ?? 0);
  const yesterdayRevenue = Number(yesterdaySales._sum.total ?? 0);
  const revenueChange =
    yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

  return NextResponse.json({
    todayRevenue,
    todaySalesCount: todaySales._count,
    lowStockCount,
    pendingPOCount,
    revenueChange,
    salesChange: 0,
  });
}
