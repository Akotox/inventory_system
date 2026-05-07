"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable, getSelectColumn } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, Plus, Eye, Printer, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SaleWithRelations } from "@/types";
import { useState } from "react";
import Link from "next/link";

interface SalesClientProps {
  sales: SaleWithRelations[];
}

const statusConfig = {
  PAID: { label: "Paid", variant: "success" as const },
  INVOICED: { label: "Invoiced", variant: "info" as const },
  PARTIAL: { label: "Partial", variant: "warning" as const },
  VOID: { label: "Void", variant: "destructive" as const },
};

const paymentConfig = {
  CASH: { label: "Cash", variant: "secondary" as const },
  CARD: { label: "Card", variant: "info" as const },
  TRANSFER: { label: "Transfer", variant: "purple" as const },
  MIXED: { label: "Mixed", variant: "warning" as const },
};

export function SalesClient({ sales }: SalesClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const filtered = sales.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (paymentFilter !== "all" && s.paymentMethod !== paymentFilter) return false;
    return true;
  });

  const columns: ColumnDef<SaleWithRelations>[] = [
    getSelectColumn<SaleWithRelations>(),
    {
      accessorKey: "saleNumber",
      header: "Sale #",
      cell: ({ row }) => (
        <Link
          href={`/sales/${row.original.id}`}
          className="font-mono font-medium text-blue-600 hover:underline"
        >
          {row.original.saleNumber}
        </Link>
      ),
    },
    {
      accessorKey: "saleDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.saleDate)}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.customer?.name ?? (
            <span className="text-muted-foreground italic">Walk-in</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "saleItems",
      header: "Items",
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.saleItems.length}
        </span>
      ),
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatCurrency(Number(row.original.subtotal))}
        </span>
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
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-bold tabular-nums">
          {formatCurrency(Number(row.original.total))}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => {
        const cfg = paymentConfig[row.original.paymentMethod];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
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
      accessorKey: "user",
      header: "Processed By",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.user.name}
        </span>
      ),
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
              <Link href={`/sales/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                View receipt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="h-4 w-4" />
              Print
            </DropdownMenuItem>
            {row.original.status !== "VOID" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="h-4 w-4" />
                  Void sale
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalRevenue = filtered
    .filter((s) => s.status !== "VOID")
    .reduce((sum, s) => sum + Number(s.total), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{filtered.length} sales</h2>
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalRevenue)}
          </p>
        </div>
        <Button asChild>
          <Link href="/pos">
            <Plus className="h-4 w-4" />
            New Sale
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by sale # or customer..."
        pageSize={25}
        showExport
        exportFilename="sales"
        toolbar={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="INVOICED">Invoiced</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="VOID">Void</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="MIXED">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
