import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  if (!artist) {
    return { title: "Community Not Found - Weverse" };
  }
  return {
    title: `${artist.name} - Weverse`,
    description: `Connect with ${artist.name} and global fans on Weverse.`,
  };
}

export default async function ArtistCommunityPage({ params }: PageProps) {
  const { artist: slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) {
    notFound();
  }
  const bundle = getCommunityDetail(artist.slug);
  return <CommunityPageClient bundle={bundle} />;
}
