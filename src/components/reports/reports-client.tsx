"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportsClientProps {
  data: {
    salesByDay: { date: string; revenue: number; count: number }[];
    topProducts: {
      productId: string;
      name: string;
      sku: string;
      revenue: number;
      unitsSold: number;
      margin: number;
    }[];
    stockValuation: {
      name: string;
      sku: string;
      stockQuantity: number;
      costPrice: any;
      sellingPrice: any;
    }[];
    totalStockValue: number;
  };
}

export function ReportsClient({ data }: ReportsClientProps) {
  const chartData = data.salesByDay.map((d) => ({
    date: format(parseISO(d.date), "MMM d"),
    revenue: d.revenue,
    sales: d.count,
  }));

  const topProductColumns: ColumnDef<(typeof data.topProducts)[0]>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.original.sku}</p>
        </div>
      ),
    },
    {
      accessorKey: "unitsSold",
      header: "Units Sold",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{row.original.unitsSold}</span>
      ),
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold">
          {formatCurrency(row.original.revenue)}
        </span>
      ),
    },
    {
      accessorKey: "margin",
      header: "Margin",
      cell: ({ row }) => {
        const m = row.original.margin;
        return (
          <Badge
            variant={m >= 30 ? "success" : m >= 15 ? "warning" : "destructive"}
          >
            {m.toFixed(1)}%
          </Badge>
        );
      },
    },
  ];

  const stockColumns: ColumnDef<(typeof data.stockValuation)[0]>[] = [
    {
      accessorKey: "name",
      header: "Product",
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
          {row.original.sku}
        </span>
      ),
    },
    {
      accessorKey: "stockQuantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.stockQuantity}</span>
      ),
    },
    {
      accessorKey: "costPrice",
      header: "Cost",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCurrency(Number(row.original.costPrice))}</span>
      ),
    },
    {
      id: "stockValue",
      header: "Stock Value",
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold">
          {formatCurrency(row.original.stockQuantity * Number(row.original.costPrice))}
        </span>
      ),
    },
  ];

  const totalRevenue = data.salesByDay.reduce((s, d) => s + d.revenue, 0);
  const totalSales = data.salesByDay.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">30-Day Revenue</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">30-Day Sales</p>
            <p className="text-3xl font-bold mt-1">{totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Stock Valuation</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(data.totalStockValue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue — Last 30 Days</CardTitle>
          <CardDescription>Revenue and transaction count per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By revenue, all time</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={topProductColumns}
              data={data.topProducts}
              showColumnToggle={false}
              pageSize={10}
            />
          </CardContent>
        </Card>

        {/* Stock valuation */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Valuation</CardTitle>
            <CardDescription>
              Total: {formatCurrency(data.totalStockValue)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={stockColumns}
              data={data.stockValuation}
              showColumnToggle={false}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
