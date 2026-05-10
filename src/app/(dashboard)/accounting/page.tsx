"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  History,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function AccountingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, transRes] = await Promise.all([
          fetch("/api/accounting/accounts"),
          fetch("/api/accounting/transactions?limit=5")
        ]);
        
        const accounts = await accountsRes.json();
        const transactions = await transRes.json();
        
        setData({ accounts, transactions });
      } catch (error) {
        console.error("Failed to fetch accounting data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const totalAssets = data?.accounts
    ?.filter((a: any) => a.type === "ASSET")
    ?.reduce((sum: number, a: any) => sum + Number(a.balance), 0) || 0;

  const totalRevenue = data?.accounts
    ?.filter((a: any) => a.type === "REVENUE")
    ?.reduce((sum: number, a: any) => sum + Number(a.balance), 0) || 0;

  const totalExpenses = data?.accounts
    ?.filter((a: any) => a.type === "EXPENSE")
    ?.reduce((sum: number, a: any) => sum + Number(a.balance), 0) || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 bg-zinc-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Financials</h1>
          <p className="text-zinc-500 mt-2 font-medium">Manage your firm's income, expenses, and ledger accounts.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md" asChild>
            <Link href="/accounting/transactions">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Link>
          </Button>
          <Button variant="outline" className="border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700" asChild>
            <Link href="/accounting/reports">
              <TrendingUp className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Assets</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{formatCurrency(totalAssets)}</div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 text-emerald-600 mr-1" />
              <span className="text-emerald-600 font-bold">+2.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-emerald-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Revenue</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 text-emerald-600 mr-1" />
              <span className="text-emerald-600 font-bold">+12.3%</span> increase
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-rose-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Expenses</CardTitle>
              <div className="p-2 bg-rose-50 rounded-lg">
                <TrendingDown className="h-4 w-4 text-rose-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center">
              <ArrowDownRight className="h-3 w-3 text-rose-600 mr-1" />
              <span className="text-rose-600 font-bold">+5.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="flex items-center text-zinc-900">
              <History className="mr-2 h-5 w-5 text-zinc-400" />
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-zinc-500">Latest financial movements across all accounts.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data?.transactions?.length > 0 ? (
                data.transactions.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors border border-zinc-100">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900">{t.description}</span>
                      <span className="text-xs text-zinc-400 font-medium">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-black text-lg ${t.toAccount?.type === 'REVENUE' || t.toAccount?.type === 'ASSET' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                        {formatCurrency(t.amount)}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                        {t.toAccount?.name || 'Manual'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-400 font-medium italic">No recent transactions.</div>
              )}
              <Button variant="ghost" className="w-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold" asChild>
                <Link href="/accounting/transactions">View All Transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="flex items-center text-zinc-900">
              <Wallet className="mr-2 h-5 w-5 text-zinc-400" />
              Account Balances
            </CardTitle>
            <CardDescription className="text-zinc-500">Current state of your financial ledgers.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {data?.accounts?.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-zinc-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-800">{a.name}</span>
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{a.type}</span>
                  </div>
                  <div className="font-mono font-black text-xl text-zinc-900">
                    {formatCurrency(a.balance)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
