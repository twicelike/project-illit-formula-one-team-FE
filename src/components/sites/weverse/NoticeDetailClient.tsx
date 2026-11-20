"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GLOBAL_NOTICES, type CommunityNotice } from "./community-data";
import {
  ArrowRightIcon,
  DmMessageIcon,
  MenuIcon,
  ShareIcon,
  WeverseMarkSquareIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

export function NoticeDetailClient({ notice }: { notice: CommunityNotice }) {
  const router = useRouter();
  const { openDmArtistList, openCookieModal, showToast } = useWeverseApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    showToast("Notice link copied to clipboard!");
  };

  const handleCta = () => {
    if (notice.ctaType === "dm") {
      openDmArtistList(notice.artistName);
      return;
    }
    if (notice.ctaType === "shop") {
      router.push(
        notice.id === "black-friday-2026"
          ? "/shop?promo=black-friday"
          : `/shop?artist=${notice.artistSlug}`
      );
      return;
    }
    router.push(`/${notice.artistSlug}`);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Community-style 56px Top Header */}
      <header className="wev-header border-b border-black/[0.05]">
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] text-black hover:bg-black/[0.04]"
          >
            <MenuIcon className="h-[24px] w-[24px]" />
          </button>
          <Link
            href="/"
            aria-label="Back to Weverse Home"
            className="flex items-center text-black no-underline hover:opacity-80"
          >
            <WeverseMarkSquareIcon className="h-[28px] w-[28px]" />
          </Link>
          <Link
            href={`/${notice.artistSlug}`}
            className="text-[19px] font-extrabold leading-[24px] text-black no-underline hover:underline"
          >
            {notice.artistName}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => openDmArtistList(notice.artistName)}
          aria-label="Open Weverse DM"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] text-black hover:bg-black/[0.04]"
        >
          <DmMessageIcon className="h-[24px] w-[24px]" />
        </button>
      </header>

      <WeverseGlobalMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <SearchCommunitiesDrawer
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* 2-Column Notice Detail Layout (max-width 1100px) */}
      <div className="pt-[56px] max-[673px]:pt-[48px]">
        <main className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] items-start gap-[32px] px-[20px] pb-[64px] pt-[36px] max-[900px]:grid-cols-1 max-[673px]:px-[16px] max-[673px]:pt-[24px]">
          {/* Left Article */}
          <article className="min-w-0">
            <div className="flex items-start justify-between gap-[16px]">
              <h1 className="m-0 text-[24px] font-extrabold leading-[33px] tracking-[-0.01em] text-black max-[673px]:text-[20px] max-[673px]:leading-[28px]">
                {notice.title}
              </h1>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share notice"
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-black/10 text-black hover:bg-black/[0.04]"
              >
                <ShareIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="mt-[10px] flex items-center gap-[10px] border-b border-black/[0.06] pb-[18px] text-[13px] text-[#8e8e8e]">
              <span>{notice.date}</span>
              <span>·</span>
              <Link
                href={`/${notice.artistSlug}`}
                className="font-semibold text-[#00b8c1] no-underline hover:underline"
              >
                {notice.artistName} Community
              </Link>
            </div>

            <div className="mt-[24px] space-y-[22px] text-[15px] leading-[25px] text-[#222222]">
              <p className="m-0 whitespace-pre-line">{notice.intro}</p>

              {notice.sections.map((section) => (
                <div key={section.heading} className="space-y-[6px]">
                  <strong className="block text-[15px] font-bold text-black">
                    {section.heading}
                  </strong>
                  {section.lines.map((line, i) => (
                    <p key={i} className="m-0 text-[#333333]">
                      {line}
                    </p>
                  ))}
                </div>
              ))}

              {notice.notes.length > 0 && (
                <div className="rounded-[12px] bg-[#fff5f5] p-[16px]">
                  <strong className="block text-[14px] font-bold text-[#ff3b30]">
                    * Please Note (Event)
                  </strong>
                  <ul className="m-0 mt-[8px] list-none space-y-[6px] p-0 text-[13px] leading-[20px] text-[#d92d20]">
                    {notice.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-[32px]">
              <button
                type="button"
                onClick={handleCta}
                className="inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[#00cbd5] px-[24px] text-[15px] font-extrabold text-white transition-colors hover:bg-[#00b8c1]"
              >
                {notice.ctaLabel}
              </button>
            </div>
          </article>

          {/* Right Sticky Recent Notices Card */}
          <aside className="sticky top-[80px] rounded-[16px] border border-[#ebedf2] bg-white p-[20px] max-[900px]:static">
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-[12px]">
              <strong className="text-[16px] font-bold text-black">
                Notice
              </strong>
              <Link
                href={`/${notice.artistSlug}`}
                className="inline-flex items-center gap-[2px] text-[12px] font-semibold text-[#666666] no-underline hover:text-black"
              >
                <span>Recent Notices</span>
                <ArrowRightIcon className="h-[13px] w-[13px]" />
              </Link>
            </div>

            <ul className="m-0 mt-[8px] list-none divide-y divide-black/[0.05] p-0">
              {GLOBAL_NOTICES.map((item) => {
                const isCurrent = item.id === notice.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/notice/${item.id}`}
                      className={`block py-[12px] no-underline transition-colors ${
                        isCurrent
                          ? "text-[#00b8c1]"
                          : "text-[#111111] hover:text-[#00b8c1]"
                      }`}
                    >
                      <div className="flex items-start gap-[6px]">
                        <span
                          className={`line-clamp-2 flex-1 text-[13px] leading-[19px] ${
                            isCurrent ? "font-bold" : "font-medium"
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.isNew && (
                          <span className="mt-[2px] inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#fe5b58] text-[9px] font-bold text-white">
                            N
                          </span>
                        )}
                      </div>
                      <span className="mt-[4px] block text-[11px] text-[#8e8e8e]">
                        {item.artistName} · {item.shortDate}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </main>

        <WeverseFooter onOpenCookieSettings={openCookieModal} />
      </div>
    </div>
  );
}
