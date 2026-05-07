# Inventory & Sales System Design
**Stack:** PostgreSQL · Next.js · Prisma ORM · NextAuth.js

---

## Database Schema (PostgreSQL)

10 tables covering the full domain:

| Table | Purpose |
|---|---|
| `products` | Core product catalog with pricing and reorder thresholds |
| `categories` | Product groupings |
| `suppliers` | Supplier contact information |
| `inventory_movements` | Full audit trail of every stock change |
| `customers` | Customer records and lifetime spend |
| `sales` | Sale headers with payment and status |
| `sale_items` | Line items per sale |
| `purchase_orders` | Orders placed with suppliers |
| `po_items` | Line items per purchase order |
| `users` | Staff accounts with roles |

### Key Table Definitions

#### products
```sql
id              UUID PRIMARY KEY
sku             VARCHAR UNIQUE NOT NULL
name            VARCHAR NOT NULL
description     TEXT
cost_price      DECIMAL(10,2)
selling_price   DECIMAL(10,2)
reorder_level   INTEGER
reorder_quantity INTEGER
category_id     UUID REFERENCES categories(id)
supplier_id     UUID REFERENCES suppliers(id)
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT now()
```

#### inventory_movements
```sql
id               UUID PRIMARY KEY
product_id       UUID REFERENCES products(id)
type             VARCHAR  -- sale | purchase | adjustment | return
quantity         INTEGER
quantity_before  INTEGER
quantity_after   INTEGER
reference_id     UUID     -- sale_id or po_id
reference_type   VARCHAR  -- SALE | PURCHASE_ORDER
notes            TEXT
created_by       UUID REFERENCES users(id)
created_at       TIMESTAMP DEFAULT now()
```

#### sales
```sql
id              UUID PRIMARY KEY
sale_number     VARCHAR UNIQUE NOT NULL   -- e.g. S-1042
customer_id     UUID REFERENCES customers(id)
user_id         UUID REFERENCES users(id)
subtotal        DECIMAL(10,2)
discount        DECIMAL(10,2)
tax             DECIMAL(10,2)
total           DECIMAL(10,2)
payment_method  VARCHAR   -- cash | card | transfer | mixed
status          VARCHAR   -- paid | invoiced | partial | void
sale_date       TIMESTAMP
created_at      TIMESTAMP DEFAULT now()
```

#### purchase_orders
```sql
id              UUID PRIMARY KEY
po_number       VARCHAR UNIQUE NOT NULL   -- e.g. PO-023
supplier_id     UUID REFERENCES suppliers(id)
status          VARCHAR   -- draft | sent | partial | received | cancelled
total_amount    DECIMAL(10,2)
expected_date   DATE
received_date   DATE
created_at      TIMESTAMP DEFAULT now()
```

---

## Entity Relationships

```
PRODUCTS ──< INVENTORY_MOVEMENTS
PRODUCTS ──< SALE_ITEMS
PRODUCTS >── CATEGORIES
PRODUCTS >── SUPPLIERS
SALES    ──< SALE_ITEMS
SALES    >── CUSTOMERS
SALES    >── USERS
PURCHASE_ORDERS ──< PO_ITEMS
PURCHASE_ORDERS >── SUPPLIERS
PO_ITEMS >── PRODUCTS
```

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│          Next.js App Router — Pages              │
│  Dashboard | Sales/POS | Inventory | Reports     │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         Next.js API Routes  /api/*               │
│  /products | /sales | /inventory | /purchases    │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Service Layer — Business Logic        │
│  InventoryService | SalesService | ReportService │
└──────────┬─────────────────────────┬────────────┘
           │                         │
┌──────────▼──────────┐   ┌─────────▼────────────┐
│    Prisma ORM        │   │    NextAuth.js        │
│  Type-safe queries   │   │  Session + RBAC       │
│  + migrations        │   │                      │
└──────────┬──────────┘   └──────────────────────┘
           │
┌──────────▼──────────────────────────────────────┐
│                  PostgreSQL                      │
│  Products · Sales · Inventory · Customers        │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14+ App Router | Pages, routing, server components |
| API | Next.js API Routes | REST endpoints |
| ORM | Prisma | Type-safe DB access + migrations |
| Auth | NextAuth.js | Login, sessions, role-based access |
| Database | PostgreSQL | Primary data store |
| UI | Tailwind CSS + shadcn/ui | Component library |

---

## Key Design Decisions

### 1. Inventory Audit Trail
Every stock change — whether from a sale, purchase order receive, or manual adjustment — is recorded in `inventory_movements`. This gives you a complete, immutable log of what happened, when, and by whom. The `quantity_before` and `quantity_after` fields make it easy to reconstruct stock levels at any point in time.

### 2. Human-Readable Reference Numbers
Sales use `sale_number` (e.g., `S-1042`) and purchase orders use `po_number` (e.g., `PO-023`) as human-friendly identifiers, separate from UUID primary keys. These are auto-incremented at the application layer.

### 3. Reorder Automation
Each product has `reorder_level` and `reorder_quantity` fields. When an inventory movement causes stock to drop at or below `reorder_level`, the system can automatically suggest or generate a purchase order for `reorder_quantity` units from the default supplier.

### 4. Flexible Payment Handling
The `sales` table supports multiple payment statuses (`paid`, `invoiced`, `partial`, `void`) and payment methods (`cash`, `card`, `transfer`, `mixed`), allowing the POS to handle walk-in cash sales and credit invoicing for business customers.

### 5. Role-Based Access Control
User roles (e.g., `admin`, `cashier`, `warehouse`) are enforced via NextAuth.js at both the API route and page level. Cashiers can process sales but not edit products or view financial reports; warehouse staff can receive purchase orders but not issue refunds.

---

## Application Pages

### Dashboard
- Today's revenue, sales count, low-stock alerts, pending purchase orders
- Recent sales table with status badges
- Stock level indicators with reorder warnings

### Sales / POS
- Product search by name or SKU (barcode scanner compatible)
- Cart with quantity, discount, and line total
- Customer selection or walk-in
- Payment processing (split payments supported)
- Receipt generation and printing

### Inventory
- Current stock levels per product
- Filter by category, supplier, or low-stock status
- Manual stock adjustment with reason (damage, count correction)
- Movement history per product

### Products
- Full product catalog with pricing
- Category and supplier assignment
- Reorder threshold configuration
- Product activation / deactivation

### Purchase Orders
- Create PO from supplier or from low-stock suggestions
- Send PO and track status
- Receive stock (partial or full) — auto-updates inventory

### Reports
- Sales by day / week / month
- Top-selling products
- Gross profit margin per product
- Stock valuation report
- Supplier performance

---

## Service Layer — Core Logic

### InventoryService
```typescript
// Deduct stock on sale and record movement
async deductStock(productId: string, qty: number, saleId: string, userId: string)

// Add stock on purchase order receive
async receiveStock(productId: string, qty: number, poId: string, userId: string)

// Manual adjustment
async adjustStock(productId: string, qty: number, reason: string, userId: string)

// Check and return low stock products
async getLowStockProducts(): Promise<Product[]>
```

### SalesService
```typescript
// Create sale, deduct stock, record movements atomically
async createSale(payload: CreateSaleDTO): Promise<Sale>

// Void sale and restore stock
async voidSale(saleId: string, userId: string): Promise<Sale>

// Process refund for specific items
async processRefund(saleId: string, items: RefundItemDTO[]): Promise<Sale>
```

### PurchaseService
```typescript
// Create purchase order
async createPO(payload: CreatePODTO): Promise<PurchaseOrder>

// Receive items and update inventory
async receiveItems(poId: string, items: ReceiveItemDTO[]): Promise<PurchaseOrder>

// Auto-generate POs for all low-stock products
async generateReorderPOs(): Promise<PurchaseOrder[]>
```

---

## Next Steps

- [ ] Generate full `schema.prisma` file ready to run
- [ ] Scaffold API route handlers for each endpoint
- [ ] Build the POS sales screen UI
- [ ] Build the inventory movement / adjustment page
- [ ] Write service layer with Prisma transactions
- [ ] Set up NextAuth with role-based middleware
- [ ] Configure low-stock alerting (email / dashboard notification)
