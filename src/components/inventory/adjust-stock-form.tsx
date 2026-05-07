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
import { Loader2, ArrowLeft } from "lucide-react";
import type { Product } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

interface AdjustStockFormProps {
  products: Product[];
  preselectedProductId?: string;
}

export function AdjustStockForm({ products, preselectedProductId }: AdjustStockFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(preselectedProductId ?? "");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity === 0 || !reason.trim()) {
      toast({ title: "Fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, reason }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast({
        title: "Stock adjusted",
        description: `${quantity > 0 ? "+" : ""}${quantity} units for ${selectedProduct?.name}`,
      });
      router.push("/inventory");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/inventory">
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Manual Stock Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
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
              {selectedProduct && (
                <p className="text-sm text-muted-foreground">
                  Current stock:{" "}
                  <span className="font-semibold">{selectedProduct.stockQuantity} units</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Quantity Change *</Label>
              <Input
                type="number"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Use negative to remove stock (e.g. -5)"
              />
              <p className="text-xs text-muted-foreground">
                Positive to add stock, negative to remove.
                {selectedProduct && quantity !== 0 && (
                  <span className="ml-1 font-medium">
                    New stock: {selectedProduct.stockQuantity + quantity}
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Input
                placeholder="e.g. Damaged units, count correction, theft..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Adjustment"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
