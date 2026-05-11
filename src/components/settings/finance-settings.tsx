"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Coins, Percent, Landmark } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export function FinanceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    currencyCode: "USD",
    currencySymbol: "$",
    taxRate: 0,
    taxName: "VAT",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            currencyCode: data.currencyCode || "USD",
            currencySymbol: data.currencySymbol || "$",
            taxRate: parseFloat(data.taxRate) || 0,
            taxName: data.taxName || "VAT",
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
        toast({ title: "Success", description: "Financial settings saved successfully" });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({ title: "Error", description: "Error saving settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-black/40 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Landmark className="h-5 w-5 text-amber-500" />
            Financial & Localization
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure currency and taxation defaults for your transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Coins className="h-3 w-3" /> Currency Code
              </Label>
              <Input 
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500 transition-colors uppercase" 
                value={settings.currencyCode}
                onChange={(e) => setSettings({ ...settings, currencyCode: e.target.value.toUpperCase() })}
                placeholder="e.g. USD, KES, EUR"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                 Currency Symbol
              </Label>
              <Input 
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500 transition-colors" 
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                placeholder="e.g. $, KSh, €"
              />
            </div>
            
            <div className="pt-4 md:col-span-2 border-t border-slate-800"></div>

            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                Tax Type Name
              </Label>
              <Input 
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500 transition-colors" 
                value={settings.taxName}
                onChange={(e) => setSettings({ ...settings, taxName: e.target.value })}
                placeholder="e.g. VAT, GST, Sales Tax"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Percent className="h-3 w-3" /> Default Tax Rate (%)
              </Label>
              <Input 
                type="number"
                step="0.01"
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500 transition-colors" 
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              className="bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Financial Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
