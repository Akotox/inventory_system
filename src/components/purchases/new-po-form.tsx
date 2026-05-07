"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Supplier, ProductWithRelations } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";

interface POLineItem {
  productId: string;
  productName: string;
  quantityOrdered: number;
  unitCost: number;
}

interface NewPOFormProps {
  suppliers: Supplier[];
  products: ProductWithRelations[];
  preselectedProductId?: string;
}

export function NewPOForm({ suppliers, products, preselectedProductId }: NewPOFormProps) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POLineItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Pre-populate if coming from low-stock alert
  useEffect(() => {
    if (preselectedProductId) {
      const product = products.find((p) => p.id === preselectedProductId);
      if (product) {
        setSupplierId(product.supplierId ?? "");
        setItems([
          {
            productId: product.id,
            productName: product.name,
            quantityOrdered: product.reorderQuantity,
            unitCost: Number(product.costPrice),
          },
        ]);
      }
    }
  }, [preselectedProductId, products]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", productName: "", quantityOrdered: 1, unitCost: 0 },
    ]);
  };

  const updateItem = (index: number, field: keyof POLineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value as string,
            productName: product?.name ?? "",
            unitCost: product ? Number(product.costPrice) : item.unitCost,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, i) => sum + i.quantityOrdered * i.unitCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast({ title: "Select a supplier", variant: "destructive" });
      return;
    }
    if (items.length === 0 || items.some((i) => !i.productId)) {
      toast({ title: "Add at least one product", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          items: items.map((i) => ({
            productId: i.productId,
            quantityOrdered: i.quantityOrdered,
            unitCost: i.unitCost,
          })),
          notes: notes || undefined,
          expectedDate: expectedDate || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const po = await res.json();
      toast({ title: "Purchase order created", description: po.poNumber });
      router.push(`/purchases/${po.id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* PO Header */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Expected Delivery Date</Label>
            <Input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notes</Label>
            <Input
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Line items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Order Items</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No items yet. Click "Add Item" to start.
            </p>
          )}
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 items-end p-3 rounded-lg border bg-muted/20"
            >
              <div className="col-span-5 space-y-1">
                <Label className="text-xs">Product</Label>
                <Select
                  value={item.productId}
                  onValueChange={(v) => updateItem(index, "productId", v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantityOrdered}
                  onChange={(e) =>
                    updateItem(index, "quantityOrdered", Number(e.target.value))
                  }
                  className="h-9"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Unit Cost ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitCost}
                  onChange={(e) =>
                    updateItem(index, "unitCost", Number(e.target.value))
                  }
                  className="h-9"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <Label className="text-xs">Total</Label>
                <p className="h-9 flex items-center text-sm font-medium tabular-nums">
                  {formatCurrency(item.quantityOrdered * item.unitCost)}
                </p>
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-red-500"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {items.length > 0 && (
            <div className="flex justify-end pt-2">
              <div className="text-sm font-bold">
                Order Total: {formatCurrency(total)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating..." : "Create Purchase Order"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
