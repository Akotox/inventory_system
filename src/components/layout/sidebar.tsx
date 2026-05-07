"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/pos", label: "Point of Sale", icon: Zap },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/purchases", label: "Purchase Orders", icon: Truck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sidebar-primary font-bold text-sm leading-none">InventoryOS</p>
              <p className="text-sidebar-foreground/50 text-xs mt-0.5">Enterprise</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg text-sidebar-foreground hover:bg-destructive/20 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}
