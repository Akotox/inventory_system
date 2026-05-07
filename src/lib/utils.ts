import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Serialize Prisma Decimal / Date objects so they can be passed to Client Components */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) => {
    // Prisma Decimal has a toFixed method — convert to number
    if (value !== null && typeof value === "object" && typeof value.toFixed === "function") {
      return parseFloat(value.toString());
    }
    return value;
  }));
}

export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function generateSaleNumber(lastNumber: number): string {
  return `S-${String(lastNumber + 1).padStart(4, "0")}`;
}

export function generatePONumber(lastNumber: number): string {
  return `PO-${String(lastNumber + 1).padStart(3, "0")}`;
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? "" : String(val);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
