"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Hash, Layout, Printer } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export function InvoiceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    invoicePrefix: "INV-",
    invoiceNextNumber: 1,
    invoiceTerms: "",
    receiptHeader: "",
    receiptFooter: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            invoicePrefix: data.invoicePrefix || "INV-",
            invoiceNextNumber: data.invoiceNextNumber || 1,
            invoiceTerms: data.invoiceTerms || "",
            receiptHeader: data.receiptHeader || "",
            receiptFooter: data.receiptFooter || "",
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
        toast({ title: "Success", description: "Invoicing settings saved successfully" });
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-slate-800 bg-black/40 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-200">
              <FileText className="h-5 w-5 text-indigo-500" />
              Invoice Configuration
            </CardTitle>
            <CardDescription className="text-slate-400">
              Set your invoice numbering and default terms.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                   Prefix
                </Label>
                <Input 
                  className="bg-slate-900/50 border-slate-700 focus:border-indigo-500 transition-colors" 
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  placeholder="e.g. INV-"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Next Number
                </Label>
                <Input 
                  type="number"
                  className="bg-slate-900/50 border-slate-700 focus:border-indigo-500 transition-colors" 
                  value={settings.invoiceNextNumber}
                  onChange={(e) => setSettings({ ...settings, invoiceNextNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                Default Terms & Conditions
              </Label>
              <Textarea 
                className="bg-slate-900/50 border-slate-700 focus:border-indigo-500 min-h-[120px]" 
                value={settings.invoiceTerms}
                onChange={(e) => setSettings({ ...settings, invoiceTerms: e.target.value })}
                placeholder="Enter payment instructions, return policy, etc."
              />
              <p className="text-xs text-slate-500">This text will appear at the bottom of generated invoices.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-black/40 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-200">
              <Printer className="h-5 w-5 text-emerald-500" />
              POS Receipt Layout
            </CardTitle>
            <CardDescription className="text-slate-400">
              Customize the appearance of printed thermal receipts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Receipt Header</Label>
              <Textarea 
                className="bg-slate-900/50 border-slate-700 focus:border-emerald-500" 
                value={settings.receiptHeader}
                onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                placeholder="Welcome to our store!"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Receipt Footer</Label>
              <Textarea 
                className="bg-slate-900/50 border-slate-700 focus:border-emerald-500" 
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                placeholder="Thank you for shopping with us!"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all px-8"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Invoicing Settings"}
        </Button>
      </div>
    </div>
  );
}
