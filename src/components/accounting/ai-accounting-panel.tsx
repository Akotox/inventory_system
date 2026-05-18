"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, ArrowUpRight, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function AiAccountingPanel({ onTransactionsSaved }: { onTransactionsSaved: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [proposedEntries, setProposedEntries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setProposedEntries([]);
    try {
      const res = await fetch("/api/accounting/ai-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setProposedEntries(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (proposedEntries.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      for (const entry of proposedEntries) {
        const res = await fetch("/api/accounting/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: entry.description,
            amount: parseFloat(entry.amount),
            fromAccountId: entry.fromAccountId,
            toAccountId: entry.toAccountId,
            date: new Date().toISOString(),
          }),
        });
        if (!res.ok) {
          throw new Error(`Failed to save entry: ${entry.description}`);
        }
      }
      setPrompt("");
      setProposedEntries([]);
      onTransactionsSaved();
    } catch (err: any) {
      setError(err.message || "Failed to commit transactions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProposedEntries([]);
    setError(null);
  };

  return (
    <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden mb-8 border-t-4 border-t-blue-500">
      <CardHeader className="bg-blue-50/50 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-zinc-900">AI Assistant</CardTitle>
            <CardDescription className="text-zinc-500">
              Describe a financial event in plain text and our AI will automatically prepare the correct double-entry ledger transactions for you.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <textarea
            className="flex-1 min-h-[80px] p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-zinc-900 placeholder:text-zinc-400"
            placeholder="e.g. 'We sold an item we acquired for $100 cash, making a $50 profit.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading || proposedEntries.length > 0}
          />
          <div className="flex flex-col gap-2">
            {!proposedEntries.length ? (
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !prompt.trim()}
                className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md h-full px-6"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2 text-blue-400" />}
                Analyze
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleCommit} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md flex-1"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Confirm Entries
                </Button>
                <Button 
                  onClick={handleCancel} 
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-md border border-rose-100 flex items-center">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        {proposedEntries.length > 0 && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-sm font-bold text-zinc-700 mb-3 uppercase tracking-wider">Proposed Transactions</h3>
            <div className="border border-zinc-100 rounded-md overflow-hidden">
              {proposedEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-bold text-zinc-900 mb-1">{entry.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
                      <span className="px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {entry.fromAccountName || entry.fromAccountId}
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-zinc-300" />
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {entry.toAccountName || entry.toAccountId}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono font-black text-lg text-emerald-600 ml-4">
                    {formatCurrency(entry.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
