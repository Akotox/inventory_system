import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const accounts = await (prisma as any).financialAccount.findMany({
      where: { isActive: true },
    });

    const assets = accounts.filter((a: any) => a.type === "ASSET");
    const liabilities = accounts.filter((a: any) => a.type === "LIABILITY");
    const equity = accounts.filter((a: any) => a.type === "EQUITY");
    const revenue = accounts.filter((a: any) => a.type === "REVENUE");
    const expense = accounts.filter((a: any) => a.type === "EXPENSE");

    const totalAssets = assets.reduce((sum: number, a: any) => sum + Number(a.balance), 0);
    
    const totalLiabilities = Math.abs(liabilities.reduce((sum: number, a: any) => sum + Number(a.balance), 0));
    const totalEquity = Math.abs(equity.reduce((sum: number, a: any) => sum + Number(a.balance), 0));
    
    const totalRevenue = Math.abs(revenue.reduce((sum: number, r: any) => sum + Number(r.balance), 0));
    const totalExpenses = expense.reduce((sum: number, e: any) => sum + Number(e.balance), 0);
    
    // Net Income (Revenue - Expense)
    const netIncome = totalRevenue - totalExpenses;

    return NextResponse.json({
      assets: assets.map((a: any) => ({ name: a.name, balance: a.balance })),
      liabilities: liabilities.map((a: any) => ({ name: a.name, balance: Math.abs(Number(a.balance)) })),
      equity: equity.map((a: any) => ({ name: a.name, balance: Math.abs(Number(a.balance)) })),
      netIncome,
      summary: {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalEquityPlusNetIncome: totalEquity + netIncome,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity + netIncome
      }
    });
  } catch (error) {
    console.error("[BALANCE_SHEET_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
