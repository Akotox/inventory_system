import { Header } from "@/components/layout/header";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="System configuration" />
      <div className="p-6">
        <p className="text-muted-foreground">Settings coming soon.</p>
      </div>
    </div>
  );
}
