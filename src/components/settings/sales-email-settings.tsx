"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toaster"; // Assuming toast is available
import { Mail, ShieldCheck, Server, Key } from "lucide-react";

export function SalesEmailSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    senderName: "",
    senderEmail: "",
    enableSalesEmails: false,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            smtpHost: data.smtpHost || "",
            smtpPort: data.smtpPort || 587,
            smtpUser: data.smtpUser || "",
            smtpPassword: data.smtpPassword || "",
            senderName: data.senderName || "",
            senderEmail: data.senderEmail || "",
            enableSalesEmails: data.enableSalesEmails || false,
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
        // toast({ title: "Settings saved", description: "Email configuration updated successfully." });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      // toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure how the system sends automated sales emails to customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 pb-4">
            <Checkbox 
              id="enable-emails" 
              checked={settings.enableSalesEmails}
              onCheckedChange={(checked) => setSettings({ ...settings, enableSalesEmails: !!checked })}
            />
            <Label htmlFor="enable-emails" className="text-slate-200">Enable Automated Sales Emails</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-1">
                <Server className="h-3 w-3" /> SMTP Host
              </Label>
              <Input 
                placeholder="smtp.example.com" 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500" 
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">SMTP Port</Label>
              <Input 
                type="number" 
                placeholder="587" 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500" 
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> SMTP User
              </Label>
              <Input 
                placeholder="user@example.com" 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500" 
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-1">
                <Key className="h-3 w-3" /> SMTP Password
              </Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="bg-slate-900/50 border-slate-700 focus:border-cyan-500" 
                value={settings.smtpPassword}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 space-y-4 border-t border-slate-800">
            <CardTitle className="text-sm font-medium text-slate-300">Sender Details</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Display Name</Label>
                <Input 
                  placeholder="Costech Systems" 
                  className="bg-slate-900/50 border-slate-700 focus:border-cyan-500" 
                  value={settings.senderName}
                  onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Sender Email Address</Label>
                <Input 
                  placeholder="no-reply@costech.com" 
                  className="bg-slate-900/50 border-slate-700 focus:border-cyan-500" 
                  value={settings.senderEmail}
                  onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Email Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
