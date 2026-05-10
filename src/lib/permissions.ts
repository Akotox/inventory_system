/**
 * Role-based access control
 *
 * Roles:
 *   ADMIN     — full access to everything
 *   MANAGER   — everything except user management
 *   CASHIER   — POS, sales view, customers, dashboard
 *   WAREHOUSE — inventory, purchase orders, products (read), dashboard
 */

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "WAREHOUSE";

/** Route prefixes each role is allowed to access */
export const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  ADMIN: ["/"], // all routes
  MANAGER: [
    "/dashboard",
    "/sales",
    "/pos",
    "/inventory",
    "/products",
    "/customers",
    "/purchases",
    "/reports",
    "/catalog",
    "/settings",
    "/accounting",
  ],
  CASHIER: [
    "/dashboard",
    "/sales",
    "/pos",
    "/customers",
  ],
  WAREHOUSE: [
    "/dashboard",
    "/inventory",
    "/products",
    "/purchases",
  ],
};

/** Returns true if the given role can access the given pathname */
export function canAccess(role: UserRole, pathname: string): boolean {
  if (role === "ADMIN") return true;
  const allowed = ROLE_ALLOWED_ROUTES[role] ?? [];
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

/** Nav items with role restrictions */
export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name — resolved in sidebar
  roles: UserRole[]; // empty = all roles
  section?: string;
}

export const NAV_ITEMS: NavItem[] = [
  // Main
  { href: "/dashboard",  label: "Dashboard",       icon: "LayoutDashboard", roles: [], section: "main" },
  { href: "/pos",        label: "Point of Sale",   icon: "Zap",             roles: ["ADMIN", "MANAGER", "CASHIER"], section: "main" },
  { href: "/sales",      label: "Sales",           icon: "ShoppingCart",    roles: ["ADMIN", "MANAGER", "CASHIER"], section: "main" },
  { href: "/customers",  label: "Customers",       icon: "Users",           roles: ["ADMIN", "MANAGER", "CASHIER"], section: "main" },
  // Inventory
  { href: "/inventory",  label: "Inventory",       icon: "Boxes",           roles: ["ADMIN", "MANAGER", "WAREHOUSE"], section: "inventory" },
  { href: "/products",   label: "Products",        icon: "Package",         roles: ["ADMIN", "MANAGER", "WAREHOUSE"], section: "inventory" },
  { href: "/purchases",  label: "Purchase Orders", icon: "Truck",           roles: ["ADMIN", "MANAGER", "WAREHOUSE"], section: "inventory" },
  // Catalog
  { href: "/catalog/categories", label: "Categories", icon: "Tag",          roles: ["ADMIN", "MANAGER"], section: "catalog" },
  { href: "/catalog/suppliers",  label: "Suppliers",  icon: "Building2",    roles: ["ADMIN", "MANAGER"], section: "catalog" },
  // Analytics
  { href: "/reports",    label: "Reports",         icon: "BarChart3",       roles: ["ADMIN", "MANAGER"], section: "analytics" },
  // Admin
  { href: "/settings",   label: "Settings",        icon: "Settings",        roles: ["ADMIN"], section: "admin" },
  // Financials
  { href: "/accounting",          label: "Ledger",           icon: "Wallet",      roles: ["ADMIN", "MANAGER"], section: "financials" },
  { href: "/accounting/reports",  label: "Balance Sheet",    icon: "FileSpreadsheet", roles: ["ADMIN", "MANAGER"], section: "financials" },
];

export const SECTION_LABELS: Record<string, string> = {
  main:      "Main",
  inventory: "Inventory",
  catalog:   "Catalog",
  analytics: "Analytics",
  financials: "Financials",
  admin:     "Admin",
};
