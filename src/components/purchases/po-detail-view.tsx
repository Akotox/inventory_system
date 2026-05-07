"use client";

import { useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { ArrowLeft, PackageCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import type { PurchaseOrder, POItem, Product, Supplier } from "@/types";
import { cn } from "@/lib/utils";

type POWithFull = PurchaseOrder & {
  supplier: Supplier;
  poItems: (POItem & { product: Product })[];
};

const statusConfig = {
  DRAFT: { label: "Draft", variant: "secondary" as const },
  SENT: { label: "Sent", variant: "info" as const },
  PARTIAL: { label: "Partial", variant: "warning" as const },
  RECEIVED: { label: "Received", variant: "success" as const },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const },
};

export function PODetailView({ po }: { po: POWithFull }) {
  const router = useRouter();
  const [receiving, setReceiving] = useState(false);
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(po.poItems.map((i) => [i.id, 0]))
  );

  const canReceive = ["SENT", "PARTIAL"].includes(po.status);

  const handleReceive = async () => {
    const items = po.poItems
      .map((item) => ({
        poItemId: item.id,
        productId: item.productId,
        quantityReceived: receiveQtys[item.id] ?? 0,
      }))
      .filter((i) => i.quantityReceived > 0);

    if (items.length === 0) {
      toast({ title: "No quantities entered", variant: "destructive" });
      return;
    }

    setReceiving(true);
    try {
      const res = await fetch(`/api/purchases/${po.id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast({ title: "Stock received", description: "Inventory has been updated." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setReceiving(false);
    }
  };

  const columns: ColumnDef<POItem & { product: Product }>[] = [
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
      accessorKey: "quantityOrdered",
      header: "Ordered",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{row.original.quantityOrdered}</span>
      ),
    },
    {
      accessorKey: "quantityReceived",
      header: "Received",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.quantityReceived}</span>
      ),
    },
    {
      id: "receiveQty",
      header: "Receive Now",
      cell: ({ row }) => {
        if (!canReceive) return <span className="text-muted-foreground">—</span>;
        const remaining = row.original.quantityOrdered - row.original.quantityReceived;
        return (
          <Input
            type="number"
            min={0}
            max={remaining}
            value={receiveQtys[row.original.id] ?? 0}
            onChange={(e) =>
              setReceiveQtys((prev) => ({
                ...prev,
                [row.original.id]: Math.min(
                  Number(e.target.value),
                  remaining
                ),
              }))
            }
            className="h-8 w-24 tabular-nums"
          />
        );
      },
    },
    {
      accessorKey: "unitCost",
      header: "Unit Cost",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCurrency(Number(row.original.unitCost))}</span>
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
    {
      id: "itemStatus",
      header: "Status",
      cell: ({ row }) => {
        const ordered = row.original.quantityOrdered;
        const received = row.original.quantityReceived;
        if (received === 0)
          return <Badge variant="secondary">Pending</Badge>;
        if (received >= ordered)
          return <Badge variant="success">Complete</Badge>;
        return <Badge variant="warning">Partial</Badge>;
      },
    },
  ];

  const table = useReactTable({
    data: po.poItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalOrdered = po.poItems.reduce((s, i) => s + i.quantityOrdered, 0);
  const totalReceived = po.poItems.reduce((s, i) => s + i.quantityReceived, 0);
  const receivedPct = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
  const status = statusConfig[po.status];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/purchases">
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Link>
        </Button>
        {canReceive && (
          <Button onClick={handleReceive} disabled={receiving}>
            {receiving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PackageCheck className="h-4 w-4" />
            )}
            {receiving ? "Receiving..." : "Confirm Receipt"}
          </Button>
        )}
      </div>

      {/* Header cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">PO Number</p>
            <p className="text-xl font-bold font-mono">{po.poNumber}</p>
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
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Expected</p>
            <p className="font-medium">
              {po.expectedDate ? formatDateShort(po.expectedDate) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total</p>
            <p className="text-xl font-bold">{formatCurrency(Number(po.totalAmount))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier & progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{po.supplier.name}</p>
            {po.supplier.contactName && (
              <p className="text-sm text-muted-foreground">{po.supplier.contactName}</p>
            )}
            {po.supplier.email && (
              <p className="text-sm text-muted-foreground">{po.supplier.email}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Receiving Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {totalReceived} of {totalOrdered} units received
              </span>
              <span className="font-semibold">{Math.round(receivedPct)}%</span>
            </div>
            <Progress value={receivedPct} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* PO Items sub-table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Order Items
            {canReceive && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                — Enter quantities to receive
              </span>
            )}
          </CardTitle>
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

          {/* Footer */}
          <div className="px-4 py-4 border-t">
            <div className="flex justify-end">
              <div className="w-56 space-y-1.5 text-sm">
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Order Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(Number(po.totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {po.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{po.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
