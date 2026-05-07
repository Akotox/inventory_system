"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithRelations, Customer } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";

interface CartItem {
  product: ProductWithRelations;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface POSClientProps {
  products: ProductWithRelations[];
  customers: Customer[];
}

const paymentMethods = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "CARD", label: "Card", icon: CreditCard },
  { value: "TRANSFER", label: "Transfer", icon: ArrowLeftRight },
];

export function POSClient({ products, customers }: POSClientProps) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("walkin");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!search) return products.slice(0, 20);
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const addToCart = (product: ProductWithRelations) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: Number(product.sellingPrice),
          discount: 0,
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const subtotal = cart.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity - i.discount,
    0
  );
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.1;
  const total = taxableAmount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId === "walkin" ? null : customerId,
          userId: session?.user?.id,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
          })),
          discount,
          tax,
          paymentMethod,
          status: "PAID",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to process sale");
      }

      setSuccess(true);
      setCart([]);
      setDiscount(0);
      setCustomerId("walkin");
      toast({ title: "Sale completed", description: "Receipt ready to print." });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-10rem)]">
      {/* Product search panel */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or scan SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 text-base"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto scrollbar-thin flex-1">
          {filteredProducts.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className={cn(
                  "relative text-left p-4 rounded-xl border transition-all hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5",
                  inCart
                    ? "border-blue-400 bg-blue-50 ring-1 ring-blue-300"
                    : "bg-card hover:bg-accent/30"
                )}
              >
                {inCart && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                    {inCart.quantity}
                  </div>
                )}
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-tight line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {product.sku}
                  </p>
                  <p className="text-base font-bold text-blue-600">
                    {formatCurrency(Number(product.sellingPrice))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.stockQuantity} in stock
                  </p>
                </div>
              </button>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cart.length > 0 && (
                <Badge variant="secondary">{cart.length} items</Badge>
              )}
            </CardTitle>
          </CardHeader>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs">Click a product to add it</p>
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.product.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & checkout */}
          <div className="border-t p-4 space-y-4">
            {/* Customer */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> Customer
              </Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walkin">Walk-in customer</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment method */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Payment method</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors",
                        paymentMethod === pm.value
                          ? "border-blue-400 bg-blue-50 text-blue-700"
                          : "hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Discount ($)</Label>
              <Input
                type="number"
                min={0}
                max={subtotal}
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0.00"
                className="h-9"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="tabular-nums">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (10%)</span>
                <span className="tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-1.5">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              className="w-full h-11 text-base"
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {loading ? "Processing..." : success ? "Sale Complete!" : `Charge ${formatCurrency(total)}`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
