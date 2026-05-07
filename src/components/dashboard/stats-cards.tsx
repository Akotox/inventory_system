import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, AlertTriangle, Truck, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function DashboardStats({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Sales Today",
      value: stats.todaySalesCount.toString(),
      change: stats.salesChange,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockCount.toString(),
      change: null,
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? "text-red-600" : "text-emerald-600",
      bg: stats.lowStockCount > 0 ? "bg-red-50" : "bg-emerald-50",
      urgent: stats.lowStockCount > 0,
    },
    {
      title: "Pending POs",
      value: stats.pendingPOCount.toString(),
      change: null,
      icon: Truck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={cn("overflow-hidden", card.urgent && "ring-1 ring-red-200")}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                  {card.change !== null && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      card.change >= 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {card.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(card.change).toFixed(1)}% vs yesterday
                    </div>
                  )}
                </div>
                <div className={cn("p-3 rounded-xl", card.bg)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
