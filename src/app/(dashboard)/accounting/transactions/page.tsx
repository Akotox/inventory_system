"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft,
  ArrowUpRight,
  MoreVertical,
  Download,
  Pencil,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Skeleton from "../../../../components/ui/skeleton";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    fromAccountId: "",
    toAccountId: "",
    date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, accountsRes] = await Promise.all([
        fetch("/api/accounting/transactions"),
        fetch("/api/accounting/accounts")
      ]);
      const transData = await transRes.json();
      const accountsData = await accountsRes.json();
      setTransactions(transData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/accounting/transactions/${editingId}` 
        : "/api/accounting/transactions";
      
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      });

      if (res.ok) {
        handleCloseDialog();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving transaction", error);
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({
      description: t.description,
      amount: t.amount.toString(),
      fromAccountId: t.fromAccountId || "",
      toAccountId: t.toAccountId || "",
      date: new Date(t.date).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This will reverse the account balance changes.")) return;
    try {
      const res = await fetch(`/api/accounting/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      fromAccountId: "",
      toAccountId: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-zinc-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/accounting">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-200 text-zinc-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">General Ledger</h1>
            <p className="text-zinc-500 font-medium">Detailed history of all financial transactions.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-zinc-200 text-zinc-900 sm:max-w-[425px] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{editingId ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Description</label>
                  <Input 
                    placeholder="Rent, Office Supplies, etc." 
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-zinc-500"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">Amount</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="bg-zinc-50 border-zinc-200 text-zinc-900"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700">Date</label>
                    <Input 
                      type="date" 
                      className="bg-zinc-50 border-zinc-200 text-zinc-900"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">From Account (Source)</label>
                  <Select 
                    onValueChange={(val) => setFormData({...formData, fromAccountId: val})}
                    value={formData.fromAccountId}
                  >
                    <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-200">
                      {accounts.map(a => (
                        <SelectItem key={a.id} value={a.id} className="text-zinc-900 focus:bg-zinc-100">{a.name} ({a.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">To Account (Destination)</label>
                  <Select 
                    onValueChange={(val) => setFormData({...formData, toAccountId: val})}
                    value={formData.toAccountId}
                  >
                    <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-200">
                      {accounts.map(a => (
                        <SelectItem key={a.id} value={a.id} className="text-zinc-900 focus:bg-zinc-100">{a.name} ({a.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-6 mt-4">
                  {editingId ? 'Update Transaction' : 'Save Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-zinc-50/50 border-b border-zinc-100">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search transactions..." 
              className="pl-10 bg-white border-zinc-200 text-zinc-900 shadow-none focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-zinc-200">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full bg-zinc-100" />)}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-zinc-100 hover:bg-transparent">
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest pl-6">Date</TableHead>
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Description</TableHead>
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Flow</TableHead>
                  <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Reference</TableHead>
                  <TableHead className="text-right text-zinc-500 font-bold uppercase text-[10px] tracking-widest pr-6">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id} className="border-zinc-100 hover:bg-zinc-50/80 transition-colors group">
                    <TableCell className="text-zinc-600 font-medium pl-6">
                      {new Date(t.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-zinc-900">{t.description}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">Recorded by {t.createdBy?.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
                        <span className="px-2 py-1 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {t.fromAccount?.name || "N/A"}
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-zinc-300" />
                        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {t.toAccount?.name || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-xs font-medium">
                      {t.referenceType || "Manual Entry"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <span className={`font-mono font-black text-lg ${t.toAccount?.type === 'REVENUE' || t.toAccount?.type === 'ASSET' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                        {formatCurrency(t.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-zinc-200">
                          <DropdownMenuItem className="text-zinc-700 focus:bg-zinc-50 cursor-pointer" onClick={() => handleEdit(t)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:bg-rose-50 cursor-pointer" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-zinc-400 font-medium italic">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
