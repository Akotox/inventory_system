"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CustomerWithStats } from "@/types";
import Link from "next/link";

interface CustomersClientProps {
  customers: CustomerWithStats[];
}

export function CustomersClient({ customers }: CustomersClientProps) {
  const columns: ColumnDef<CustomerWithStats>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/customers/${row.original.id}`}
          className="font-medium hover:text-blue-600 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.email ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.phone ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "Total Spent",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(Number(row.original.totalSpent))}
        </span>
      ),
    },
    {
      id: "totalOrders",
      header: "Orders",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original._count.sales}
        </span>
      ),
    },
    {
      id: "lastPurchase",
      header: "Last Purchase",
      cell: ({ row }) => {
        const last = row.original.sales[0]?.saleDate;
        return (
          <span className="text-sm text-muted-foreground">
            {last ? formatDate(last) : "Never"}
          </span>
        );
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
              <Link href={`/customers/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                View history
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete
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
          <h2 className="text-lg font-semibold">{customers.length} customers</h2>
          <p className="text-sm text-muted-foreground">
            Total lifetime value:{" "}
            {formatCurrency(
              customers.reduce((sum, c) => sum + Number(c.totalSpent), 0)
            )}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search by name or email..."
        pageSize={25}
        showExport
        exportFilename="customers"
      />
    </div>
  );
}
