import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopPageClient } from "@/components/sites/weverse/ShopPageClient";

export const metadata: Metadata = {
  title: "Weverse Shop - Official Artist Merch",
  description: "Shop official artist albums, Season's Greetings, and Black Friday merch locally.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShopPageClient />
    </Suspense>
  );
}
