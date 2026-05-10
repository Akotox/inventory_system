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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Financials</h1>
          <p className="text-muted-foreground mt-2">Manage your firm's income, expenses, and ledger accounts.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/accounting/transactions">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </Link>
          <Link href="/accounting/reports">
            <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
              <TrendingUp className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-xl hover:border-blue-500/50 transition-colors group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Assets</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Wallet className="h-4 w-4 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalAssets)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-emerald-400 font-medium">+2.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-xl hover:border-emerald-500/50 transition-colors group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-emerald-400 font-medium">+12.3%</span> increase
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800 backdrop-blur-xl hover:border-rose-500/50 transition-colors group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</CardTitle>
              <div className="p-2 bg-rose-500/10 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                <TrendingDown className="h-4 w-4 text-rose-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowDownRight className="h-3 w-3 text-rose-400 mr-1" />
              <span className="text-rose-400 font-medium">+5.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5 text-blue-400" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest financial movements across all accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.transactions?.length > 0 ? (
                data.transactions.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{t.description}</span>
                      <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${t.toAccount?.type === 'REVENUE' || t.toAccount?.type === 'ASSET' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(t.amount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                        {t.toAccount?.name || 'Manual'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No recent transactions.</div>
              )}
              <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-400/5" asChild>
                <Link href="/accounting/transactions">View All Transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-emerald-400" />
              Account Balances
            </CardTitle>
            <CardDescription>Current state of your financial ledgers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.accounts?.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{a.type}</span>
                  </div>
                  <div className="font-mono font-bold text-white">
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
