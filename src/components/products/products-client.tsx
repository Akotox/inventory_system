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
import { MoreHorizontal, Plus, Eye, Pencil, PowerOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithRelations, Category, Supplier } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface ProductsClientProps {
  products: ProductWithRelations[];
  categories: Category[];
  suppliers: Supplier[];
}

export function ProductsClient({ products, categories, suppliers }: ProductsClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
    if (statusFilter === "active" && !p.isActive) return false;
    if (statusFilter === "inactive" && p.isActive) return false;
    if (statusFilter === "low_stock" && p.stockQuantity > p.reorderLevel) return false;
    return true;
  });

  const columns: ColumnDef<ProductWithRelations>[] = [
    getSelectColumn<ProductWithRelations>(),
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
      header: "Product Name",
      cell: ({ row }) => (
        <Link
          href={`/products/${row.original.id}`}
          className="font-medium hover:text-blue-600 hover:underline transition-colors"
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
      accessorKey: "costPrice",
      header: "Cost",
      cell: ({ row }) => (
        <span className="text-right block tabular-nums">
          {formatCurrency(Number(row.original.costPrice))}
        </span>
      ),
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => (
        <span className="text-right block font-medium tabular-nums">
          {formatCurrency(Number(row.original.sellingPrice))}
        </span>
      ),
    },
    {
      accessorKey: "stockQuantity",
      header: "Stock",
      cell: ({ row }) => {
        const qty = row.original.stockQuantity;
        const level = row.original.reorderLevel;
        const isLow = qty <= level;
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-semibold tabular-nums",
                isLow ? "text-red-600" : "text-foreground"
              )}
            >
              {qty}
            </span>
            {isLow && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Low
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "reorderLevel",
      header: "Reorder At",
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.reorderLevel}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
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
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/products/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/products/${row.original.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <PowerOff className="h-4 w-4" />
              {row.original.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{products.length} products</h2>
          <p className="text-sm text-muted-foreground">
            {products.filter((p) => p.stockQuantity <= p.reorderLevel).length} below reorder level
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search by name or SKU..."
        pageSize={25}
        showExport
        exportFilename="products"
        toolbar={
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="low_stock">Low stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
