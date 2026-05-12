"use client";

import { useEffect, useState, useRef } from "react";
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
import Skeleton from "../../../../components/ui/skeleton";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function BalanceSheetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("balance_sheet.pdf");
    } catch (error) {
      console.error("Failed to download PDF", error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 bg-zinc-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/accounting">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-200 text-zinc-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">Financial Reports</h1>
            <p className="text-zinc-500 font-medium">Detailed financial statements for your firm.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Downloading..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div ref={reportRef}>
        <Card className="bg-white border-zinc-200 shadow-2xl print:bg-white print:text-black print:shadow-none overflow-hidden">
          <CardHeader className="text-center border-b-4 border-zinc-900 pb-12 pt-16 bg-zinc-50/30">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg">
                <Building2 className="h-9 w-9 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-serif tracking-tight text-zinc-900 mb-2">Costech Systems</CardTitle>
            <CardTitle className="text-xl text-zinc-500 font-bold uppercase tracking-[0.3em]">Statement of Financial Position</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 mt-6 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
              <Calendar className="h-3 w-3" />
              As of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-16 px-16 pb-24 space-y-16">
            {/* Assets Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Assets</h3>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Debit Balance</span>
              </div>
              <div className="space-y-6">
                {data.assets.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between items-end group">
                    <span className="text-zinc-600 font-bold group-hover:text-zinc-900 transition-colors">{a.name}</span>
                    <div className="flex-1 border-b border-zinc-200 border-dotted mx-4 mb-1.5 h-0" />
                    <span className="font-mono text-zinc-900 font-bold">{formatCurrency(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t-2 border-zinc-100">
                  <span className="text-zinc-900 font-black uppercase text-sm">Total Assets</span>
                  <span className="text-xl font-black text-zinc-900 underline decoration-double decoration-zinc-900 underline-offset-4">
                    {formatCurrency(data.summary.totalAssets)}
                  </span>
                </div>
              </div>
            </section>

            {/* Liabilities Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Liabilities</h3>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Credit Balance</span>
              </div>
              <div className="space-y-6">
                {data.liabilities.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between items-end group">
                    <span className="text-zinc-600 font-bold group-hover:text-zinc-900 transition-colors">{a.name}</span>
                    <div className="flex-1 border-b border-zinc-200 border-dotted mx-4 mb-1.5 h-0" />
                    <span className="font-mono text-zinc-900 font-bold">{formatCurrency(a.balance)}</span>
                  </div>
                ))}
                {data.liabilities.length === 0 && <p className="text-zinc-400 italic text-sm font-medium">No current liabilities.</p>}
                <div className="flex justify-between items-center pt-4 border-t-2 border-zinc-100">
                  <span className="text-zinc-900 font-black uppercase text-sm">Total Liabilities</span>
                  <span className="text-xl font-bold text-zinc-900">{formatCurrency(data.summary.totalLiabilities)}</span>
                </div>
              </div>
            </section>

            {/* Equity Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2">
                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Equity</h3>
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Owner's Interest</span>
              </div>
              <div className="space-y-6">
                {data.equity.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between items-end group">
                    <span className="text-zinc-600 font-bold group-hover:text-zinc-900 transition-colors">{a.name}</span>
                    <div className="flex-1 border-b border-zinc-200 border-dotted mx-4 mb-1.5 h-0" />
                    <span className="font-mono text-zinc-900 font-bold">{formatCurrency(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-end group">
                  <span className="text-zinc-600 font-bold group-hover:text-zinc-900 transition-colors italic">Retained Earnings (Net Income)</span>
                  <div className="flex-1 border-b border-zinc-200 border-dotted mx-4 mb-1.5 h-0" />
                  <span className={`font-mono font-bold ${data.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(data.netIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-zinc-100">
                  <span className="text-zinc-900 font-black uppercase text-sm">Total Equity</span>
                  <span className="text-xl font-bold text-zinc-900">{formatCurrency(data.summary.totalEquityPlusNetIncome)}</span>
                </div>
              </div>
            </section>

            {/* Final Totals Footer */}
            <div className="mt-12 bg-zinc-900 p-10 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="text-center md:text-left">
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em] mb-2">Fundamental Equation</p>
                <p className="text-lg font-serif italic text-zinc-200">The accounts are in balance.</p>
              </div>
              <div className="flex items-center gap-12">
                 <div className="text-center">
                   <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Assets</p>
                   <p className="text-4xl font-black text-white">{formatCurrency(data.summary.totalAssets)}</p>
                 </div>
                 <div className="text-4xl font-light text-zinc-700">|</div>
                 <div className="text-center">
                   <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Liabilities + Equity</p>
                   <p className="text-4xl font-black text-white">{formatCurrency(data.summary.totalLiabilitiesAndEquity)}</p>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
