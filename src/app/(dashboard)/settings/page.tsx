import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesEmailSettings } from "@/components/settings/sales-email-settings";
import { StockSettings } from "@/components/settings/stock-settings";
import { GeneralSettings } from "@/components/settings/general-settings";
import { FinanceSettings } from "@/components/settings/finance-settings";
import { InvoiceSettings } from "@/components/settings/invoice-settings";
import { Mail, Package, Building2, Landmark, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-[#050505] text-white">
      <Header title="System Settings" subtitle="Configure your application environment" />
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1 mb-6 flex-wrap h-auto">
            <TabsTrigger value="general" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex gap-2">
              <Building2 className="h-4 w-4" /> General
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white flex gap-2">
              <Landmark className="h-4 w-4" /> Finance
            </TabsTrigger>
            <TabsTrigger value="invoicing" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex gap-2">
              <FileText className="h-4 w-4" /> Invoicing
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex gap-2">
              <Mail className="h-4 w-4" /> Sales Emails
            </TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex gap-2">
              <Package className="h-4 w-4" /> Stock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="finance">
            <FinanceSettings />
          </TabsContent>

          <TabsContent value="invoicing">
            <InvoiceSettings />
          </TabsContent>

          <TabsContent value="emails">
            <SalesEmailSettings />
          </TabsContent>

          <TabsContent value="stock">
            <StockSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
