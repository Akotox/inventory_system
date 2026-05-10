"use client";

import { useEffect, useState } from "react";
import { 
  FileSpreadsheet, 
  Printer, 
  Download,
  ArrowLeft,
  Calendar,
  Building2,
  PieChart as PieChartIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function BalanceSheetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/accounting/reports/balance-sheet");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching balance sheet", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/accounting">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Financial Reports</h1>
            <p className="text-muted-foreground">Detailed financial statements for your firm.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-zinc-800 bg-zinc-900/50" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl print:bg-white print:text-black print:shadow-none">
        <CardHeader className="text-center border-b border-zinc-800 pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-serif tracking-widest uppercase">Costech Systems</CardTitle>
          <CardTitle className="text-xl mt-2 text-blue-400 font-light uppercase tracking-[0.2em]">Balance Sheet</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-4 text-muted-foreground uppercase text-xs tracking-widest">
            <Calendar className="h-3 w-3" />
            As of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-10 px-10 pb-16 space-y-12">
          {/* Assets Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-4 uppercase tracking-wider">Assets</h3>
              <span className="text-sm text-muted-foreground italic font-light">Current & Fixed Assets</span>
            </div>
            <div className="space-y-4">
              {data.assets.map((a: any, i: number) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className="text-zinc-400 group-hover:text-white transition-colors">{a.name}</span>
                  <div className="flex-1 border-b border-zinc-800 border-dotted mx-4 h-4" />
                  <span className="font-mono text-white">{formatCurrency(a.balance)}</span>
                </div>
              ))}
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white uppercase tracking-tighter">Total Assets</span>
                <span className="text-blue-400 underline decoration-2 underline-offset-4 decoration-blue-500/30">
                  {formatCurrency(data.summary.totalAssets)}
                </span>
              </div>
            </div>
          </section>

          {/* Liabilities Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white border-l-4 border-rose-500 pl-4 uppercase tracking-wider">Liabilities</h3>
            </div>
            <div className="space-y-4">
              {data.liabilities.map((a: any, i: number) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className="text-zinc-400 group-hover:text-white transition-colors">{a.name}</span>
                  <div className="flex-1 border-b border-zinc-800 border-dotted mx-4 h-4" />
                  <span className="font-mono text-white">{formatCurrency(a.balance)}</span>
                </div>
              ))}
              {data.liabilities.length === 0 && <p className="text-zinc-500 italic text-sm">No liabilities recorded.</p>}
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white uppercase tracking-tighter">Total Liabilities</span>
                <span className="text-rose-400">{formatCurrency(data.summary.totalLiabilities)}</span>
              </div>
            </div>
          </section>

          {/* Equity Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-4 uppercase tracking-wider">Equity</h3>
            </div>
            <div className="space-y-4">
              {data.equity.map((a: any, i: number) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className="text-zinc-400 group-hover:text-white transition-colors">{a.name}</span>
                  <div className="flex-1 border-b border-zinc-800 border-dotted mx-4 h-4" />
                  <span className="font-mono text-white">{formatCurrency(a.balance)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center group">
                <span className="text-zinc-400 group-hover:text-white transition-colors italic">Net Income / (Loss)</span>
                <div className="flex-1 border-b border-zinc-800 border-dotted mx-4 h-4" />
                <span className={`font-mono ${data.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(data.netIncome)}
                </span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white uppercase tracking-tighter">Total Equity</span>
                <span className="text-emerald-400">{formatCurrency(data.summary.totalEquityPlusNetIncome)}</span>
              </div>
            </div>
          </section>

          {/* Final Totals */}
          <div className="bg-zinc-800/30 p-6 rounded-2xl border border-zinc-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Fundamental Accounting Equation</p>
              <p className="text-sm font-light text-zinc-400 italic">Assets = Liabilities + Equity</p>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-center">
                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Assets</p>
                 <p className="text-2xl font-bold text-white">{formatCurrency(data.summary.totalAssets)}</p>
               </div>
               <div className="text-2xl font-light text-zinc-600">=</div>
               <div className="text-center">
                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">L + E</p>
                 <p className="text-2xl font-bold text-white">{formatCurrency(data.summary.totalLiabilitiesAndEquity)}</p>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
