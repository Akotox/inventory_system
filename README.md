# InventoryOS — Enterprise Inventory & Sales System

A full-stack enterprise inventory and sales management system built with Next.js 15, Prisma, PostgreSQL, NextAuth.js, TanStack Table v8, and shadcn/ui.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | NextAuth.js v5 (beta) |
| UI | Tailwind CSS + shadcn/ui components |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Validation | Zod |

---

## Quick Start

### 1. Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_db"
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
```

### 2. Database

```bash
# Create the database and run migrations
npm run db:migrate

# Seed with demo data (15 products, 3 users, sample sales & POs)
npm run db:seed
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@inventory.com | admin123 |
| Cashier | cashier@inventory.com | cashier123 |
| Warehouse | warehouse@inventory.com | warehouse123 |

---

## Pages

| Route | Description |
|---|---|
| `/dashboard` | KPI cards, revenue chart, low-stock alerts, recent sales |
| `/pos` | Point of Sale — product grid, cart, payment processing |
| `/sales` | Sales table with filters, void, export |
| `/sales/[id]` | Sale detail with line items sub-table |
| `/products` | Product catalog with category/status filters |
| `/products/new` | Create product form |
| `/inventory` | Stock levels + movement history (tabbed) |
| `/inventory/adjust` | Manual stock adjustment form |
| `/inventory/low-stock` | Full low-stock list with auto-reorder |
| `/customers` | Customer table with lifetime value |
| `/purchases` | Purchase orders with progress bars |
| `/purchases/new` | Create PO form |
| `/purchases/[id]` | PO detail with editable receive quantities |
| `/reports` | Revenue charts, top products, stock valuation |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/sales` | List / create sales |
| GET/PATCH | `/api/sales/[id]` | Get / void a sale |
| GET/POST | `/api/products` | List / create products |
| GET/PATCH/DELETE | `/api/products/[id]` | Get / update / deactivate |
| GET/POST | `/api/inventory` | List movements / adjust stock |
| GET/POST | `/api/purchases` | List / create POs |
| POST | `/api/purchases/[id]/receive` | Receive stock against a PO |
| GET/POST | `/api/customers` | List / create customers |
| GET | `/api/dashboard` | Dashboard stats |

---

## Service Layer

```
src/lib/services/
  inventory.service.ts   — deductStock, receiveStock, adjustStock, returnStock, getLowStockProducts
  sales.service.ts       — createSale (atomic), voidSale
  purchase.service.ts    — createPO, receiveItems, generateReorderPOs
```

All mutating operations use Prisma transactions to keep inventory movements and stock counts in sync.

---

## TanStack Tables

8 tables implemented per the spec:

| Table | Sort | Filter | Pagination | Select | Editable | Server-side |
|---|---|---|---|---|---|---|
| Products | ✓ | ✓ | ✓ | ✓ | — | Optional |
| Inventory Movements | ✓ | ✓ | ✓ | — | — | Ready |
| Sales | ✓ | ✓ | ✓ | ✓ | — | Optional |
| Sale Items (sub) | — | — | — | — | — | — |
| Customers | ✓ | ✓ | ✓ | — | — | — |
| Purchase Orders | ✓ | ✓ | ✓ | — | — | — |
| PO Items (sub) | — | — | — | — | ✓ | — |
| Low Stock (widget) | ✓ | — | — | — | — | — |

---

## Role-Based Access

| Role | Capabilities |
|---|---|
| ADMIN | Full access — products, reports, user management |
| MANAGER | Products, reports, purchase orders |
| CASHIER | POS, view sales, view inventory |
| WAREHOUSE | Receive POs, adjust stock |

---

## Database Commands

```bash
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Run migrations (creates DB if needed)
npm run db:push       # Push schema without migration (dev only)
npm run db:seed       # Seed demo data
npm run db:studio     # Open Prisma Studio GUI
```
