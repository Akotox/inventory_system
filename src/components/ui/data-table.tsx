"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Checkbox } from "./checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  showColumnToggle?: boolean;
  showExport?: boolean;
  exportFilename?: string;
  toolbar?: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  // Server-side pagination
  serverSide?: boolean;
  totalRows?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (sortBy: string, sortDir: "asc" | "desc") => void;
  onSearchChange?: (search: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize: defaultPageSize = 25,
  showColumnToggle = true,
  showExport = false,
  exportFilename = "export",
  toolbar,
  isLoading = false,
  emptyMessage = "No results found.",
  serverSide = false,
  totalRows,
  currentPage = 0,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [pagination, setPagination] = React.useState({
    pageIndex: serverSide ? currentPage : 0,
    pageSize: defaultPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      setSorting(updater);
      if (serverSide && onSortChange) {
        const newSorting = typeof updater === "function" ? updater(sorting) : updater;
        if (newSorting.length > 0) {
          onSortChange(newSorting[0].id, newSorting[0].desc ? "desc" : "asc");
        }
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      setPagination(next);
      if (serverSide) {
        if (next.pageIndex !== pagination.pageIndex) onPageChange?.(next.pageIndex);
        if (next.pageSize !== pagination.pageSize) onPageSizeChange?.(next.pageSize);
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    pageCount: serverSide && totalRows
      ? Math.ceil(totalRows / defaultPageSize)
      : undefined,
  });

  const handleSearchChange = (value: string) => {
    if (serverSide && onSearchChange) {
      onSearchChange(value);
    } else {
      setGlobalFilter(value);
    }
  };

  const handleExport = () => {
    const rows = table.getFilteredSelectedRowModel().rows.length > 0
      ? table.getFilteredSelectedRowModel().rows
      : table.getFilteredRowModel().rows;
    const exportData = rows.map((row) =>
      Object.fromEntries(
        row.getAllCells().map((cell) => [
          cell.column.id,
          cell.getValue(),
        ])
      )
    );
    exportToCSV(exportData, exportFilename);
  };

  const pageCount = serverSide && totalRows
    ? Math.ceil(totalRows / defaultPageSize)
    : table.getPageCount();

  const pageIndex = serverSide ? currentPage : table.getState().pagination.pageIndex;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {(searchKey || !serverSide) && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={serverSide ? undefined : globalFilter}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {toolbar}
        </div>
        <div className="flex items-center gap-2">
          {showExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(val) => col.toggleVisibility(!!val)}
                    >
                      {col.id.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Row selection info */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="text-sm text-muted-foreground">
          {Object.keys(rowSelection).length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none hover:text-foreground transition-colors"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-xs opacity-50">
                              {header.column.getIsSorted() === "asc"
                                ? " ↑"
                                : header.column.getIsSorted() === "desc"
                                ? " ↓"
                                : " ↕"}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/30",
                      row.getIsSelected() && "bg-muted/50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(val) => {
              table.setPageSize(Number(val));
            }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Re-export column selection helper
export function getSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}
