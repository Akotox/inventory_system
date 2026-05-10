import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const accounts = await prisma.financialAccount.findMany({
      where: { isActive: true },
    });

    const assets = accounts.filter(a => a.type === "ASSET");
    const liabilities = accounts.filter(a => a.type === "LIABILITY");
    const equity = accounts.filter(a => a.type === "EQUITY");
    const revenue = accounts.filter(a => a.type === "REVENUE");
    const expense = accounts.filter(a => a.type === "EXPENSE");

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance), 0);
    
    // Net Income (Revenue - Expense) is part of Retained Earnings (Equity)
    const netIncome = revenue.reduce((sum, r) => sum + Number(r.balance), 0) - 
                      expense.reduce((sum, e) => sum + Number(e.balance), 0);

    return NextResponse.json({
      assets: assets.map(a => ({ name: a.name, balance: a.balance })),
      liabilities: liabilities.map(a => ({ name: a.name, balance: a.balance })),
      equity: equity.map(a => ({ name: a.name, balance: a.balance })),
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
