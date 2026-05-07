"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Loader2 } from "lucide-react";
import type { ProductWithRelations } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { toast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

interface LowStockClientProps {
  products: ProductWithRelations[];
}

export function LowStockClient({ products }: LowStockClientProps) {
  const router = useRouter();
  const [autoOrdering, setAutoOrdering] = useState(false);

  const handleAutoReorder = async () => {
    setAutoOrdering(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto-reorder" }),
      });
      if (!res.ok) throw new Error("Failed to generate POs");
      const pos = await res.json();
      toast({
        title: `${pos.length} purchase order(s) created`,
        description: "Auto-reorder POs have been generated.",
      });
      router.push("/purchases");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAutoOrdering(false);
    }
  };

  const columns: ColumnDef<ProductWithRelations>[] = [
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
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
          {row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: "stockQuantity",
      header: "Current Stock",
      cell: ({ row }) => (
        <span className="font-bold text-red-600 tabular-nums">
          {row.original.stockQuantity}
        </span>
      ),
    },
    {
      accessorKey: "reorderLevel",
      header: "Reorder Level",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.reorderLevel}
        </span>
      ),
    },
    {
      accessorKey: "reorderQuantity",
      header: "Reorder Qty",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.reorderQuantity}
        </span>
      ),
    },
    {
      id: "deficit",
      header: "Deficit",
      cell: ({ row }) => {
        const deficit = row.original.reorderLevel - row.original.stockQuantity;
        return (
          <Badge variant="destructive" className="tabular-nums">
            -{deficit}
          </Badge>
        );
      },
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
          <Link href={`/purchases/new?productId=${row.original.id}`}>
            <Plus className="h-3.5 w-3.5" />
            Create PO
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{products.length} items below reorder level</h2>
          <p className="text-sm text-muted-foreground">
            Create individual POs or auto-generate all at once
          </p>
        </div>
        <Button onClick={handleAutoReorder} disabled={autoOrdering || products.length === 0}>
          {autoOrdering ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {autoOrdering ? "Generating..." : "Auto-Generate All POs"}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="Search products..."
        pageSize={25}
        showColumnToggle={false}
      />
    </div>
  );
}
