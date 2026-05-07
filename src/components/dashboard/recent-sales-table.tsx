import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SaleWithRelations } from "@/types";
import { cn } from "@/lib/utils";

interface RecentSalesTableProps {
  sales: SaleWithRelations[];
}

const statusConfig = {
  PAID: { label: "Paid", variant: "success" as const },
  INVOICED: { label: "Invoiced", variant: "info" as const },
  PARTIAL: { label: "Partial", variant: "warning" as const },
  VOID: { label: "Void", variant: "destructive" as const },
};

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest {sales.length} transactions</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/sales">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Sale #</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Items</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const status = statusConfig[sale.status];
                return (
                  <tr key={sale.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {sale.saleNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {sale.customer?.name ?? "Walk-in"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {sale.saleItems.length}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold">
                      {formatCurrency(Number(sale.total))}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
