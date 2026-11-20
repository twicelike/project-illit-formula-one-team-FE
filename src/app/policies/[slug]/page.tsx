import type { Metadata } from "next";
import { Suspense } from "react";
import { PolicyPageClient } from "@/components/sites/weverse/PolicyPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${label} - Weverse Policies`,
    description: `Official Weverse ${label} and platform information.`,
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PolicyPageClient slug={slug} />
    </Suspense>
  );
}
