import type { Metadata } from "next";
import { JellyPageClient } from "@/components/sites/weverse/JellyPageClient";

export const metadata: Metadata = {
  title: "Jelly Shop - Weverse",
  description: "Recharge Weverse Jelly for Weverse DM and fan perks.",
};

export default function JellyPage() {
  return <JellyPageClient />;
}
