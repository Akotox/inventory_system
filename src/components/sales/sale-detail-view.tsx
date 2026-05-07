"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  getCoreRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Printer, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/toaster";
import type { Sale, SaleItem, Product, Customer, User } from "@/types";

type SaleWithFull = Sale & {
  customer: Customer | null;
  user: User;
  saleItems: (SaleItem & { product: Product })[];
};

const statusConfig = {
  PAID: { label: "Paid", variant: "success" as const },
  INVOICED: { label: "Invoiced", variant: "info" as const },
  PARTIAL: { label: "Partial", variant: "warning" as const },
  VOID: { label: "Void", variant: "destructive" as const },
};

const paymentConfig = {
  CASH: "Cash",
  CARD: "Card",
  TRANSFER: "Bank Transfer",
  MIXED: "Mixed",
};

export function SaleDetailView({ sale }: { sale: SaleWithFull }) {
  const router = useRouter();
  const [voiding, setVoiding] = useState(false);

  const handleVoid = async () => {
    if (!confirm("Are you sure you want to void this sale? Stock will be restored.")) return;
    setVoiding(true);
    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "void" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast({ title: "Sale voided", description: "Stock has been restored." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setVoiding(false);
    }
  };

  // Sub-table columns (Sale Items)
  const columns: ColumnDef<SaleItem & { product: Product }>[] = [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.product.name}</p>
        </div>
      ),
    },
    {
      id: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
          {row.original.product.sku}
        </span>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: "Unit Price",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCurrency(Number(row.original.unitPrice))}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {Number(row.original.discount) > 0
            ? formatCurrency(Number(row.original.discount))
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "lineTotal",
      header: "Line Total",
      cell: ({ row }) => (
        <span className="tabular-nums font-bold">
          {formatCurrency(Number(row.original.lineTotal))}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: sale.saleItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const status = statusConfig[sale.status];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sales">
            <ArrowLeft className="h-4 w-4" />
            Back to Sales
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          {sale.status !== "VOID" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleVoid}
              disabled={voiding}
            >
              <XCircle className="h-4 w-4" />
              {voiding ? "Voiding..." : "Void Sale"}
            </Button>
          )}
        </div>
      </div>

      {/* Header card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sale Number</p>
            <p className="text-xl font-bold font-mono">{sale.saleNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
            <Badge variant={status.variant} className="text-sm px-3 py-1">
              {status.label}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Date</p>
            <p className="font-medium">{formatDate(sale.saleDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Payment</p>
            <p className="font-medium">{paymentConfig[sale.paymentMethod]}</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer & Staff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sale.customer ? (
              <div className="space-y-1">
                <p className="font-semibold">{sale.customer.name}</p>
                {sale.customer.email && (
                  <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
                )}
                {sale.customer.phone && (
                  <p className="text-sm text-muted-foreground">{sale.customer.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Walk-in customer</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Processed By
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{sale.user.name}</p>
            <p className="text-sm text-muted-foreground">{sale.user.email}</p>
          </CardContent>
        </Card>
      </div>

      {/* Line items sub-table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-4 py-3 text-left font-medium text-muted-foreground"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/20">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer totals */}
          <div className="px-4 py-4 border-t space-y-2">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(Number(sale.subtotal))}</span>
                </div>
                {Number(sale.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="tabular-nums">−{formatCurrency(Number(sale.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span className="tabular-nums">{formatCurrency(Number(sale.tax))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(Number(sale.total))}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sale.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{sale.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
