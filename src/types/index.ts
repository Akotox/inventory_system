import type {
  Product,
  Category,
  Supplier,
  Customer,
  Sale,
  SaleItem,
  PurchaseOrder,
  POItem,
  InventoryMovement,
  User,
  UserRole,
  PaymentMethod,
  SaleStatus,
  POStatus,
  MovementType,
} from "@prisma/client";

export type {
  Product,
  Category,
  Supplier,
  Customer,
  Sale,
  SaleItem,
  PurchaseOrder,
  POItem,
  InventoryMovement,
  User,
  UserRole,
  PaymentMethod,
  SaleStatus,
  POStatus,
  MovementType,
};

// Extended types with relations
export type ProductWithRelations = Product & {
  category: Category | null;
  supplier: Supplier | null;
};

export type SaleWithRelations = Sale & {
  customer: Customer | null;
  user: User;
  saleItems: (SaleItem & { product: Product })[];
};

export type PurchaseOrderWithRelations = PurchaseOrder & {
  supplier: Supplier;
  poItems: (POItem & { product: Product })[];
};

export type InventoryMovementWithRelations = InventoryMovement & {
  product: Product;
  createdBy: User;
};

export type CustomerWithStats = Customer & {
  _count: { sales: number };
  sales: { saleDate: Date }[];
};

// Dashboard stats
export interface DashboardStats {
  todayRevenue: number;
  todaySalesCount: number;
  lowStockCount: number;
  pendingPOCount: number;
  revenueChange: number;
  salesChange: number;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
