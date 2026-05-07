import { LoginForm } from "@/components/auth/login-form";
import { Boxes } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Boxes className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">InventoryOS</p>
            <p className="text-slate-400 text-xs mt-0.5">Enterprise Edition</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage your inventory<br />
              <span className="text-blue-400">with confidence.</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Real-time stock tracking, sales management, and purchase order automation — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Products tracked", value: "10,000+" },
              { label: "Daily transactions", value: "500+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Reports generated", value: "Daily" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-sm">
          © 2025 InventoryOS. Enterprise Inventory Management.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <p className="font-bold text-xl">InventoryOS</p>
          </div>

          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          <LoginForm />

          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Demo credentials</p>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Admin:</span> admin@inventory.com / admin123</p>
              <p><span className="font-medium">Cashier:</span> cashier@inventory.com / cashier123</p>
              <p><span className="font-medium">Warehouse:</span> warehouse@inventory.com / warehouse123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
