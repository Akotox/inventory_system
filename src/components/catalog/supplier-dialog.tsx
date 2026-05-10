"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface SupplierDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  supplier?: Supplier | null;
}

export function SupplierDialog({ open, onClose, onSaved, supplier }: SupplierDialogProps) {
  const isEdit = !!supplier;
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: supplier?.name ?? "",
        contactName: supplier?.contactName ?? "",
        email: supplier?.email ?? "",
        phone: supplier?.phone ?? "",
        address: supplier?.address ?? "",
      });
    }
  }, [open, supplier]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const url = isEdit ? `/api/suppliers/${supplier!.id}` : "/api/suppliers";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          contactName: form.contactName.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast({ title: isEdit ? "Supplier updated" : "Supplier created", description: form.name });
      onSaved();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Supplier" : "New Supplier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sup-name">Company Name *</Label>
              <Input
                id="sup-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. TechCorp Distributors"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-contact">Contact Person</Label>
              <Input
                id="sup-contact"
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="e.g. Alice Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-email">Email</Label>
              <Input
                id="sup-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="supplier@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-phone">Phone</Label>
              <Input
                id="sup-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1-555-0100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup-address">Address</Label>
              <Input
                id="sup-address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="123 Main St, City"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
