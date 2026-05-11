import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesEmailSettings } from "@/components/settings/sales-email-settings";
import { StockSettings } from "@/components/settings/stock-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Mail, Package, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-[#050505] text-white">
      <Header title="System Settings" subtitle="Configure your application environment" />
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1 mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex gap-2">
              <Building2 className="h-4 w-4" /> General
            </TabsTrigger>
            <TabsTrigger value="emails" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex gap-2">
              <Mail className="h-4 w-4" /> Sales Emails
            </TabsTrigger>
            <TabsTrigger value="stock" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white flex gap-2">
              <Package className="h-4 w-4" /> Stock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-slate-800 bg-black/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-400" />
                  General Configuration
                </CardTitle>
                <CardDescription>
                  Basic system and company information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">Company information settings are coming soon in the next update.</p>
              </CardContent>
            </Card>
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
