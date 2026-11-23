import type { Metadata } from "next";
import { AdminConsoleClient } from "@/components/sites/weverse/AdminConsoleClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin & Moderation Console - Weverse",
  description:
    "Manage entertainment agencies, artist communities, official artist accounts, fan letter templates, and content moderation.",
};

export default function AdminConsolePage() {
  return <AdminConsoleClient />;
}
