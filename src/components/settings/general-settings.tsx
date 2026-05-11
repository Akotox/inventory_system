"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, Receipt } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    taxNumber: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            companyName: data.companyName || "",
            companyAddress: data.companyAddress || "",
            companyPhone: data.companyPhone || "",
            companyEmail: data.companyEmail || "",
            taxNumber: data.taxNumber || "",
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
        toast({ title: "Success", description: "General settings saved successfully" });
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-black/40 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Building2 className="h-5 w-5 text-cyan-500" />
            Company Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure your business details used for invoices and reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Building2 className="h-3 w-3" /> Business Name
              </Label>
              <Input 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors" 
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                placeholder="e.g. Costech Systems"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Receipt className="h-3 w-3" /> Tax / Registration Number
              </Label>
              <Input 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors" 
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                placeholder="e.g. VAT-12345678"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Mail className="h-3 w-3" /> Business Email
              </Label>
              <Input 
                type="email"
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors" 
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Phone className="h-3 w-3" /> Phone Number
              </Label>
              <Input 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors" 
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <MapPin className="h-3 w-3" /> Physical Address
              </Label>
              <Input 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500 transition-colors" 
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                placeholder="123 Business Way, City, Country"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Company Info"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
