import { createColumnHelper } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "./utils";

export { createColumnHelper, formatCurrency, formatDate };

export type SortDirection = "asc" | "desc" | false;

export interface ServerTableState {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
}
