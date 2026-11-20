import type { Metadata } from "next";
import {
  getArtistBySlug,
  getCommunityDetail,
} from "@/components/sites/weverse/community-data";
import { CommunityPageClient } from "@/components/sites/weverse/CommunityPageClient";

interface PageProps {
  params: Promise<{ artist: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { artist: slug } = await params;
  const artist = getArtistBySlug(slug);
  const displayName = artist ? artist.name : slug.toUpperCase();
  return {
    title: `${displayName} - Weverse`,
    description: `Connect with ${displayName} and global fans on Weverse.`,
  };
}

export default async function ArtistCommunityPage({ params }: PageProps) {
  const { artist: slug } = await params;
  const bundle = getCommunityDetail(slug);
  return <CommunityPageClient bundle={bundle} />;
}
