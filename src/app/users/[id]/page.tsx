import type { Metadata } from "next";
import { PublicUserProfileClient } from "@/components/sites/weverse/PublicUserProfileClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Profile - Weverse",
    description:
      "View Weverse member and artist profile, followers, and published posts.",
  };
}

export default async function PublicUserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  return (
    <PublicUserProfileClient
      userId={Number.isNaN(numericId) ? 0 : numericId}
    />
  );
}
