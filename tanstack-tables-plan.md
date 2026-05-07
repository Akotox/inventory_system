# TanStack Table Plan — Inventory & Sales System

## Overview

We use **TanStack Table v8** (`@tanstack/react-table`) across all data-heavy views in the system. Each table is built as a reusable React component with a shared base configuration and feature-specific column definitions.

---

## Shared Setup

```bash
npm install @tanstack/react-table
```

### Base table component (`components/ui/DataTable.tsx`)

All tables in the system share a single `<DataTable />` wrapper that handles rendering, pagination controls, and loading/empty states. Individual pages pass in `columns` and `data`.

```ts
// Shared features enabled globally:
- Column sorting (client-side for small datasets, server-side for large)
- Column visibility toggle
- Global search filter
- Pagination (client or server)
- Row selection (checkboxes) where applicable
```

---

## Tables

### 1. Products Table (`/products`)

**Purpose:** Browse, search, and manage the product catalogue.

| Column | Type | Notes |
|---|---|---|
| Select | checkbox | Row selection for bulk actions |
| SKU | string | Sortable, filterable |
| Name | string | Sortable, clickable → product detail |
| Category | string | Filterable via dropdown |
| Cost Price | number | Right-aligned, formatted as currency |
| Selling Price | number | Right-aligned, formatted as currency |
| Stock Qty | number | Color-coded: red if below reorder level |
| Reorder Level | number | |
| Status | boolean | Active / Inactive badge |
| Actions | — | Edit, View, Deactivate |

**TanStack features:**
- `getSortedRowModel` — sort by name, SKU, price, stock
- `getFilteredRowModel` — global search + category column filter
- `getPaginationRowModel` — 25 rows per page default
- `getCoreRowModel` with row selection for bulk delete / export

**Column filters:** Category (faceted), Status (boolean toggle)

---

### 2. Inventory Movements Table (`/inventory`)

**Purpose:** Full audit trail of every stock change — sales, purchases, manual adjustments.

| Column | Type | Notes |
|---|---|---|
| Date / Time | datetime | Sortable, default sort desc |
| Product | string | Linked to product |
| SKU | string | |
| Type | enum | Sale · Purchase · Adjustment · Return — badge per type |
| Qty Change | number | Positive (green) or negative (red) with +/- prefix |
| Qty Before | number | |
| Qty After | number | |
| Reference | string | Sale # or PO # — clickable |
| Notes | string | Truncated with tooltip |
| Created By | string | User name |

**TanStack features:**
- `getSortedRowModel` — date desc by default
- `getFilteredRowModel` — filter by Type, date range, product
- `getPaginationRowModel` — 50 rows per page
- Server-side pagination recommended (movements volume is high)

**Column filters:** Type (multi-select facet), Date range (custom filter fn)

---

### 3. Sales Table (`/sales`)

**Purpose:** View and manage all sales transactions.

| Column | Type | Notes |
|---|---|---|
| Sale # | string | Human-readable, clickable → sale detail |
| Date | datetime | Sortable |
| Customer | string | Filterable, "Walk-in" for anonymous |
| Items | number | Count of line items |
| Subtotal | number | Currency |
| Discount | number | Currency |
| Tax | number | Currency |
| Total | number | Currency, bold |
| Payment Method | enum | Cash · Card · Transfer · Credit |
| Status | enum | Paid · Invoiced · Partial · Void — badge |
| Processed By | string | User name |
| Actions | — | View receipt, Void, Print |

**TanStack features:**
- `getSortedRowModel` — date, total, customer
- `getFilteredRowModel` — status filter, payment method filter, date range
- `getPaginationRowModel` — 25 rows per page
- Row selection for bulk export (CSV/PDF)

**Column filters:** Status (faceted), Payment Method (faceted), Date range

---

### 4. Sale Items Sub-table (inside Sale Detail modal)

**Purpose:** Line items within a single sale — shown inline when viewing a sale.

| Column | Type | Notes |
|---|---|---|
| Product | string | |
| SKU | string | |
| Unit Price | number | Currency |
| Qty | number | |
| Discount | number | Currency |
| Line Total | number | Currency, bold |

**TanStack features:**
- `getCoreRowModel` only — no pagination, no filters (typically < 20 rows)
- Footer row for totals (subtotal, discount, tax, grand total)

---

### 5. Customers Table (`/customers`)

**Purpose:** Manage customer records and view purchase history.

| Column | Type | Notes |
|---|---|---|
| Name | string | Sortable, clickable → customer detail |
| Email | string | |
| Phone | string | |
| Total Spent | number | Currency, sortable |
| Total Orders | number | Computed from sales join |
| Last Purchase | datetime | Sortable |
| Actions | — | View history, Edit, Delete |

**TanStack features:**
- `getSortedRowModel` — name, total spent, last purchase
- `getFilteredRowModel` — global search
- `getPaginationRowModel` — 25 rows per page

---

### 6. Purchase Orders Table (`/purchases`)

**Purpose:** Track supplier purchase orders and receiving status.

| Column | Type | Notes |
|---|---|---|
| PO # | string | Clickable → PO detail |
| Supplier | string | Filterable |
| Created Date | datetime | Sortable |
| Expected Date | date | Color-coded if overdue |
| Items | number | Count of PO line items |
| Total Amount | number | Currency |
| Received | number | % of items received — progress bar |
| Status | enum | Draft · Ordered · Partial · Received · Cancelled |
| Actions | — | View, Receive stock, Cancel |

**TanStack features:**
- `getSortedRowModel` — date, supplier, status
- `getFilteredRowModel` — status filter, supplier filter
- `getPaginationRowModel` — 25 rows per page

**Column filters:** Status (faceted), Supplier (faceted)

---

### 7. PO Items Sub-table (inside PO Detail)

**Purpose:** Line items in a purchase order, with receive quantity input.

| Column | Type | Notes |
|---|---|---|
| Product | string | |
| SKU | string | |
| Qty Ordered | number | |
| Qty Received | number | Editable inline when receiving |
| Unit Cost | number | Currency |
| Line Total | number | Currency |
| Status | enum | Pending · Partial · Complete |

**TanStack features:**
- `getCoreRowModel` only
- Editable cells for "Qty Received" using `column.columnDef.meta` pattern
- Footer row for order total

---

### 8. Low Stock Alert Table (Dashboard widget)

**Purpose:** Quick view of products at or below reorder level.

| Column | Type | Notes |
|---|---|---|
| Product | string | |
| SKU | string | |
| Current Stock | number | Red text |
| Reorder Level | number | |
| Reorder Qty | number | |
| Supplier | string | |
| Action | — | "Create PO" button |

**TanStack features:**
- `getCoreRowModel` + `getSortedRowModel`
- No pagination — capped at 10 rows in dashboard widget, full list on `/inventory/low-stock`
- Pre-filtered: only rows where `stock_qty <= reorder_level`

---

## Shared Utilities

### Column helper factory

```ts
// lib/table-utils.ts
import { createColumnHelper } from '@tanstack/react-table'

// Currency formatter
export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

// Date formatter
export const formatDate = (val: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val))
```

### Server-side pagination hook

```ts
// hooks/useServerTable.ts
// Used by: Inventory Movements, Sales (when dataset > 1000 rows)
// Manages: pageIndex, pageSize, sorting state → passed as query params to API
```

### Exportable rows

Tables with row selection support CSV export via a shared `exportToCSV(rows, columns)` utility. Applied to: Products, Sales, Customers.

---

## Feature Matrix

| Table | Sort | Filter | Pagination | Row Select | Editable | Server-side |
|---|---|---|---|---|---|---|
| Products | ✓ | ✓ | ✓ | ✓ | — | Optional |
| Inventory Movements | ✓ | ✓ | ✓ | — | — | ✓ |
| Sales | ✓ | ✓ | ✓ | ✓ | — | Optional |
| Sale Items (sub) | — | — | — | — | — | — |
| Customers | ✓ | ✓ | ✓ | — | — | — |
| Purchase Orders | ✓ | ✓ | ✓ | — | — | — |
| PO Items (sub) | — | — | — | — | ✓ | — |
| Low Stock (widget) | ✓ | — | — | — | — | — |
