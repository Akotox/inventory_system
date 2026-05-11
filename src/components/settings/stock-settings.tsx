"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Bell, AlertTriangle } from "lucide-react";

export function StockSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    enableStockAlerts: true,
    stockAlertEmail: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            lowStockThreshold: data.lowStockThreshold ?? 10,
            enableStockAlerts: data.enableStockAlerts ?? true,
            stockAlertEmail: data.stockAlertEmail || "",
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        // Success toast
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      // Error toast
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-blue-500/20 bg-black/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Package className="h-5 w-5" />
            Inventory & Stock Settings
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage how the system handles stock levels and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" /> Default Low Stock Threshold
              </Label>
              <Input 
                type="number" 
                className="bg-slate-900/50 border-slate-700 focus:border-blue-500" 
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-slate-500">
                Products with stock below this level will be marked as "Low Stock".
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-4 border-t border-slate-800">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="enable-stock-alerts" 
                checked={settings.enableStockAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, enableStockAlerts: !!checked })}
              />
              <Label htmlFor="enable-stock-alerts" className="text-slate-200">Enable Stock Level Alerts</Label>
            </div>

            {settings.enableStockAlerts && (
              <div className="space-y-2 max-w-md">
                <Label className="text-slate-300">Alert Notification Email</Label>
                <Input 
                  placeholder="admin@costech.com" 
                  className="bg-slate-900/50 border-slate-700 focus:border-blue-500" 
                  value={settings.stockAlertEmail}
                  onChange={(e) => setSettings({ ...settings, stockAlertEmail: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Daily reports and real-time alerts will be sent to this address.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Stock Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
