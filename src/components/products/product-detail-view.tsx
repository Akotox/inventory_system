"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Tag, 
  Truck, 
  BarChart3, 
  History, 
  Pencil, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithRelations } from "@/types";
import Link from "next/link";

interface ProductDetailViewProps {
  product: ProductWithRelations;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const isLowStock = product.stockQuantity <= product.reorderLevel;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/products/${product.id}/edit`}>
            <Pencil className="h-4 w-4" />
            Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Stats */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
                <Badge variant={product.isActive ? "success" : "secondary"} className="text-sm">
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono text-sm">{product.sku}</p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {product.description || "No description provided."}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cost Price</p>
                  <p className="text-lg font-semibold">{formatCurrency(Number(product.costPrice))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Selling Price</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(Number(product.sellingPrice))}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Margin</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {(((Number(product.sellingPrice) - Number(product.costPrice)) / Number(product.sellingPrice)) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Gross Profit</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(Number(product.sellingPrice) - Number(product.costPrice))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="text-sm font-medium">{product.category?.name || "Uncategorized"}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Supplier</span>
                  <span className="text-sm font-medium">{product.supplier?.name || "No Supplier"}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Inventory Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Current Stock</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isLowStock ? "text-red-600" : "text-emerald-600"}`}>
                      {product.stockQuantity}
                    </span>
                    {isLowStock ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Reorder Level</span>
                  <span className="text-sm font-medium">{product.reorderLevel}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Actions & Quick Stats */}
        <div className="space-y-6">
          <Card className={isLowStock ? "border-red-200 bg-red-50/30" : "border-emerald-200 bg-emerald-50/30"}>
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Stock Health
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <div className="flex justify-center mb-4">
                {isLowStock ? (
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                )}
              </div>
              <h3 className={`text-xl font-bold ${isLowStock ? "text-red-600" : "text-emerald-600"}`}>
                {isLowStock ? "Low Stock Alert" : "In Stock"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isLowStock 
                  ? `Stock is below the reorder level of ${product.reorderLevel}` 
                  : `Stock is currently at a healthy level`}
              </p>
              {isLowStock && (
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white border-none" asChild>
                  <Link href={`/purchases/new?productId=${product.id}`}>
                    <Truck className="h-4 w-4" />
                    Reorder Now
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <Link href={`/inventory/adjust?productId=${product.id}`}>
                  <Package className="h-4 w-4" />
                  Adjust Inventory
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" disabled>
                <XCircle className="h-4 w-4" />
                Discontinue Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
