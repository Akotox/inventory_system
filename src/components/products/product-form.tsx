"use client";

import { useState } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Category, Supplier, Product } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

interface ProductFormProps {
  categories: Category[];
  suppliers: Supplier[];
  product?: Product;
}

export function ProductForm({ categories, suppliers, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    costPrice: product ? Number(product.costPrice) : 0,
    sellingPrice: product ? Number(product.sellingPrice) : 0,
    stockQuantity: product?.stockQuantity ?? 0,
    reorderLevel: product?.reorderLevel ?? 10,
    reorderQuantity: product?.reorderQuantity ?? 50,
    categoryId: product?.categoryId ?? "",
    supplierId: product?.supplierId ?? "",
  });
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name) {
      toast({ title: "SKU and name are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryId: form.categoryId || null,
          supplierId: form.supplierId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast({
        title: isEdit ? "Product updated" : "Product created",
        description: form.name,
      });
      router.push("/products");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/products">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SKU *</Label>
              <Input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="e.g. ELEC-001"
                disabled={isEdit}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Laptop Pro 15&quot;"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Optional description..."
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => set("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select
                value={form.supplierId}
                onValueChange={(v) => set("supplierId", v)}
              >
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cost Price ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.costPrice}
                onChange={(e) => set("costPrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Selling Price ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => set("sellingPrice", Number(e.target.value))}
              />
            </div>
            {form.costPrice > 0 && form.sellingPrice > 0 && (
              <div className="col-span-2 text-sm text-muted-foreground">
                Margin:{" "}
                <span className="font-semibold text-emerald-600">
                  {(
                    ((form.sellingPrice - form.costPrice) / form.sellingPrice) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Initial Stock</Label>
              <Input
                type="number"
                min={0}
                value={form.stockQuantity}
                onChange={(e) => set("stockQuantity", Number(e.target.value))}
                disabled={isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level</Label>
              <Input
                type="number"
                min={0}
                value={form.reorderLevel}
                onChange={(e) => set("reorderLevel", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Reorder Qty</Label>
              <Input
                type="number"
                min={1}
                value={form.reorderQuantity}
                onChange={(e) => set("reorderQuantity", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
