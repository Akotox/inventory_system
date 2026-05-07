import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import type { ProductWithRelations } from "@/types";

interface LowStockTableProps {
  products: ProductWithRelations[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Low Stock
          </CardTitle>
          <CardDescription>{products.length} items need attention</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/inventory/low-stock">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium">All stock levels are healthy</p>
          </div>
        ) : (
          <div className="divide-y">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{product.stockQuantity}</p>
                    <p className="text-xs text-muted-foreground">/ {product.reorderLevel}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={`/purchases/new?productId=${product.id}`}>
                      <Plus className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
