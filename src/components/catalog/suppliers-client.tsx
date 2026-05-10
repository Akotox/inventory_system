"use client";

import { useState, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, PowerOff, Building2, Mail, Phone } from "lucide-react";
import { SupplierDialog } from "./supplier-dialog";
import { toast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Supplier = {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  _count: { products: number; purchaseOrders: number };
};

export function SuppliersClient({ suppliers: initial }: { suppliers: Supplier[] }) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/suppliers");
    if (res.ok) setSuppliers(await res.json());
    router.refresh();
  }, [router]);

  const handleToggleActive = async (supplier: Supplier) => {
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !supplier.isActive }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({
        title: supplier.isActive ? "Supplier deactivated" : "Supplier activated",
        description: supplier.name,
      });
      await refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Supplier",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className={cn("font-medium", !row.original.isActive && "text-muted-foreground line-through")}>
              {row.original.name}
            </p>
            {row.original.contactName && (
              <p className="text-xs text-muted-foreground">{row.original.contactName}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) =>
        row.original.email ? (
          <a
            href={`mailto:${row.original.email}`}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            {row.original.email}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) =>
        row.original.phone ? (
          <span className="flex items-center gap-1.5 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.phone}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "products",
      header: "Products",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original._count.products}</Badge>
      ),
    },
    {
      id: "orders",
      header: "POs",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original._count.purchaseOrders}</Badge>
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditing(row.original);
                setDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={row.original.isActive ? "text-red-600" : "text-emerald-600"}
              onClick={() => handleToggleActive(row.original)}
            >
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
          <h2 className="text-lg font-semibold">{suppliers.length} suppliers</h2>
          <p className="text-sm text-muted-foreground">
            {suppliers.filter((s) => s.isActive).length} active
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search suppliers..."
        showColumnToggle={false}
        pageSize={25}
      />

      <SupplierDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSaved={refresh}
        supplier={editing}
      />
    </div>
  );
}
