"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Plus, Eye, PackageCheck, XCircle } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { PurchaseOrderWithRelations, Supplier } from "@/types";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { isPast } from "date-fns";

interface PurchasesClientProps {
  purchaseOrders: PurchaseOrderWithRelations[];
  suppliers: Supplier[];
}

const statusConfig = {
  DRAFT: { label: "Draft", variant: "secondary" as const },
  SENT: { label: "Sent", variant: "info" as const },
  PARTIAL: { label: "Partial", variant: "warning" as const },
  RECEIVED: { label: "Received", variant: "success" as const },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const },
};

export function PurchasesClient({ purchaseOrders, suppliers }: PurchasesClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");

  const filtered = purchaseOrders.filter((po) => {
    if (statusFilter !== "all" && po.status !== statusFilter) return false;
    if (supplierFilter !== "all" && po.supplierId !== supplierFilter) return false;
    return true;
  });

  const columns: ColumnDef<PurchaseOrderWithRelations>[] = [
    {
      accessorKey: "poNumber",
      header: "PO #",
      cell: ({ row }) => (
        <Link
          href={`/purchases/${row.original.id}`}
          className="font-mono font-medium text-blue-600 hover:underline"
        >
          {row.original.poNumber}
        </Link>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.supplier.name}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateShort(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "expectedDate",
      header: "Expected",
      cell: ({ row }) => {
        const date = row.original.expectedDate;
        if (!date) return <span className="text-muted-foreground">—</span>;
        const overdue =
          isPast(new Date(date)) && row.original.status !== "RECEIVED";
        return (
          <span
            className={cn(
              "text-sm",
              overdue ? "text-red-600 font-medium" : "text-muted-foreground"
            )}
          >
            {formatDateShort(date)}
            {overdue && " ⚠"}
          </span>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.poItems.length}
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(Number(row.original.totalAmount))}
        </span>
      ),
    },
    {
      id: "received",
      header: "Received",
      cell: ({ row }) => {
        const items = row.original.poItems;
        const totalOrdered = items.reduce((s, i) => s + i.quantityOrdered, 0);
        const totalReceived = items.reduce((s, i) => s + i.quantityReceived, 0);
        const pct = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={pct} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground tabular-nums w-8">
              {Math.round(pct)}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/purchases/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            {["SENT", "PARTIAL"].includes(row.original.status) && (
              <DropdownMenuItem asChild>
                <Link href={`/purchases/${row.original.id}/receive`}>
                  <PackageCheck className="h-4 w-4" />
                  Receive stock
                </Link>
              </DropdownMenuItem>
            )}
            {["DRAFT", "SENT"].includes(row.original.status) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="h-4 w-4" />
                  Cancel PO
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{filtered.length} purchase orders</h2>
          <p className="text-sm text-muted-foreground">
            {purchaseOrders.filter((po) => ["DRAFT", "SENT", "PARTIAL"].includes(po.status)).length} pending
          </p>
        </div>
        <Button asChild>
          <Link href="/purchases/new">
            <Plus className="h-4 w-4" />
            New PO
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by PO # or supplier..."
        pageSize={25}
        toolbar={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
