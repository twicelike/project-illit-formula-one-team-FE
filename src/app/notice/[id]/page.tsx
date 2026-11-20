import type { Metadata } from "next";
import {
  GLOBAL_NOTICES,
  getArtistBySlug,
  getCommunityDetail,
} from "@/components/sites/weverse/community-data";
import { NoticeDetailClient } from "@/components/sites/weverse/NoticeDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

function resolveNotice(id: string) {
  const direct = GLOBAL_NOTICES.find((n) => n.id === id);
  if (direct) return direct;

  // Support generated welcome notices (`notice-<slug>-welcome`)
  const match = /^notice-(.+)-welcome$/.exec(id);
  if (match) {
    const artist = getArtistBySlug(match[1]);
    if (artist) {
      const bundle = getCommunityDetail(artist.slug);
      const found = bundle.notices.find((n) => n.id === id);
      if (found) return found;
    }
  }
  return GLOBAL_NOTICES[0];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const notice = resolveNotice(id);
  return {
    title: `${notice.title} - Weverse`,
    description: notice.intro,
  };
}

export default async function NoticeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const notice = resolveNotice(id);
  return <NoticeDetailClient notice={notice} />;
}
