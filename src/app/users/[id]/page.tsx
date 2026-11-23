import type { Metadata } from "next";
import { PublicUserProfileClient } from "@/components/sites/weverse/PublicUserProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User Profile #${id} - Weverse`,
    description: "View public Weverse user and artist profile, followers, and published posts.",
  };
}

export default async function PublicUserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  return <PublicUserProfileClient userId={Number.isNaN(numericId) ? 0 : numericId} />;
}
