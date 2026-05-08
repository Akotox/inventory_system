"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SlidersHorizontal } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { InventoryMovementWithRelations, ProductWithRelations, Category } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface InventoryClientProps {
  movements: InventoryMovementWithRelations[];
  products: ProductWithRelations[];
  categories: Category[];
}

const movementTypeConfig = {
  SALE: { label: "Sale", variant: "destructive" as const },
  PURCHASE: { label: "Purchase", variant: "success" as const },
  ADJUSTMENT: { label: "Adjustment", variant: "warning" as const },
  RETURN: { label: "Return", variant: "info" as const },
};

export function InventoryClient({ movements, products, categories }: InventoryClientProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"movements" | "stock">("movements");

  const filteredMovements = movements.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    return true;
  });

  const movementColumns: ColumnDef<InventoryMovementWithRelations>[] = [
    {
      accessorKey: "createdAt",
      header: "Date / Time",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <Link
          href={`/products/${row.original.productId}`}
          className="font-medium hover:text-blue-600 hover:underline"
        >
          {row.original.product.name}
        </Link>
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
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const cfg = movementTypeConfig[row.original.type];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Qty Change",
      cell: ({ row }) => {
        const qty = row.original.quantity;
        return (
          <span
            className={cn(
              "font-semibold tabular-nums",
              qty > 0 ? "text-emerald-600" : "text-red-600"
            )}
          >
            {qty > 0 ? `+${qty}` : qty}
          </span>
        );
      },
    },
    {
      accessorKey: "quantityBefore",
      header: "Before",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.quantityBefore}
        </span>
      ),
    },
    {
      accessorKey: "quantityAfter",
      header: "After",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {row.original.quantityAfter}
        </span>
      ),
    },
    {
      accessorKey: "referenceType",
      header: "Reference",
      cell: ({ row }) => {
        if (!row.original.referenceId) return <span className="text-muted-foreground">—</span>;
        return (
          <span className="text-xs text-muted-foreground">
            {row.original.referenceType}
          </span>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.original.notes;
        if (!notes) return <span className="text-muted-foreground">—</span>;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm truncate max-w-[150px] block cursor-default">
                  {notes}
                </span>
              </TooltipTrigger>
              <TooltipContent>{notes}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "createdBy",
      header: "By",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdBy.name}
        </span>
      ),
    },
  ];

  const stockColumns: ColumnDef<ProductWithRelations>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
          {row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <Link
          href={`/products/${row.original.id}`}
          className="font-medium hover:text-blue-600 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.category?.name ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "stockQuantity",
      header: "Current Stock",
      cell: ({ row }) => {
        const qty = row.original.stockQuantity;
        const level = row.original.reorderLevel;
        const isLow = qty <= level;
        return (
          <div className="flex items-center gap-2">
            <span className={cn("font-bold tabular-nums", isLow ? "text-red-600" : "text-foreground")}>
              {qty}
            </span>
            {isLow && <Badge variant="destructive" className="text-xs">Low</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "reorderLevel",
      header: "Reorder Level",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{row.original.reorderLevel}</span>
      ),
    },
    {
      accessorKey: "reorderQuantity",
      header: "Reorder Qty",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{row.original.reorderQuantity}</span>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.supplier?.name ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/inventory/adjust?productId=${row.original.id}`}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Adjust
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(["movements", "stock"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
              activeTab === tab
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "movements" ? "Movement History" : "Stock Levels"}
          </button>
        ))}
      </div>

      {activeTab === "movements" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{filteredMovements.length} movements</h2>
              <p className="text-sm text-muted-foreground">Complete audit trail</p>
            </div>
          </div>
          <DataTable
            columns={movementColumns}
            data={filteredMovements}
            searchPlaceholder="Search by product or SKU..."
            pageSize={50}
            toolbar={
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="SALE">Sale</SelectItem>
                  <SelectItem value="PURCHASE">Purchase</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  <SelectItem value="RETURN">Return</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{products.length} products</h2>
              <p className="text-sm text-muted-foreground">
                {products.filter((p) => p.stockQuantity <= p.reorderLevel).length} below reorder level
              </p>
            </div>
          </div>
          <DataTable
            columns={stockColumns}
            data={products}
            searchPlaceholder="Search products..."
            pageSize={25}
          />
        </div>
      )}
    </div>
  );
}
