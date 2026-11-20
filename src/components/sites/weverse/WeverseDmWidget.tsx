"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DM_WIDGET_ARTISTS } from "./data";
import {
  AddPersonIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  CloseIcon,
  DmMessageIcon,
  RefreshIcon,
  SearchIcon,
  SparkleIcon,
  VerifiedBadgeIcon,
} from "./icons";
import type { DmChatMessage } from "./WeverseAppProvider";

export type DmWidgetMode =
  | "closed"
  | "minimized"
  | "home"
  | "artist-list"
  | "chat";

interface WeverseDmWidgetProps {
  mode: DmWidgetMode;
  selectedTab: string;
  activeArtistId: string | null;
  threads: Record<string, DmChatMessage[]>;
  isLoggedIn: boolean;
  onModeChange: (mode: DmWidgetMode) => void;
  onSelectTab: (tab: string) => void;
  onSelectArtistRow: (artistId: string) => void;
  onBackFromChat: () => void;
  onSendMessage: (artistId: string, text: string) => void;
}

const COMMUNITY_TABS = [
  "Recommended",
  "LEE SEYOUNG",
  "AHN HYO SEOP",
  "LE SSERAFIM",
  "ASC2NT",
  "LEE SUNG KYOUNG",
  "BYEON WOO SEOK",
  "Mark Lee",
  "WINNER",
  "CHUU",
  "KINO",
  "ILLIT",
  "BOYNEXTDOOR",
  "ENHYPEN",
];

export function WeverseDmWidget({
  mode,
  selectedTab,
  activeArtistId,
  threads,
  isLoggedIn,
  onModeChange,
  onSelectTab,
  onSelectArtistRow,
  onBackFromChat,
  onSendMessage,
}: WeverseDmWidgetProps) {
  const [searchText, setSearchText] = useState("");
  const [recommendedOffset, setRecommendedOffset] = useState(0);
  const [tabsExpanded, setTabsExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const activeArtist = useMemo(
    () =>
      DM_WIDGET_ARTISTS.find((a) => a.id === activeArtistId) ??
      DM_WIDGET_ARTISTS[0],
    [activeArtistId]
  );

  const activeMessages = useMemo(
    () => (activeArtist ? threads[activeArtist.id] ?? [] : []),
    [activeArtist, threads]
  );

  useEffect(() => {
    if (mode === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mode, activeMessages.length]);

  const recommendedHomeItems = useMemo(() => {
    const start = recommendedOffset % DM_WIDGET_ARTISTS.length;
    const rotated = [
      ...DM_WIDGET_ARTISTS.slice(start),
      ...DM_WIDGET_ARTISTS.slice(0, start),
    ];
    return rotated.slice(0, 6);
  }, [recommendedOffset]);

  const filteredListArtists = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return DM_WIDGET_ARTISTS.filter((item) => {
      if (q) {
        return (
          item.artistName.toLowerCase().includes(q) ||
          item.communityName.toLowerCase().includes(q)
        );
      }
      if (selectedTab === "Recommended") return true;
      return (
        item.communityName.toLowerCase() === selectedTab.toLowerCase() ||
        item.artistName.toLowerCase() === selectedTab.toLowerCase()
      );
    });
  }, [searchText, selectedTab]);

  if (mode === "closed") return null;

  if (mode === "minimized") {
    return (
      <button
        type="button"
        onClick={() => onModeChange(activeArtistId && isLoggedIn ? "chat" : "home")}
        aria-label="Open Weverse DM"
        className="fixed bottom-0 right-[24px] z-[95] flex h-[48px] w-[240px] items-center justify-between rounded-t-[12px] border border-b-0 border-black/[0.06] bg-white px-[16px] text-left shadow-[0_0_24px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#fafbfc] max-[673px]:hidden"
      >
        <span className="text-[14px] font-bold leading-[18px] text-black">
          Weverse DM
        </span>
        <ChevronDownIcon className="h-[18px] w-[18px] rotate-180 text-black" />
      </button>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeArtist) return;
    onSendMessage(activeArtist.id, draft);
    setDraft("");
  };

  return (
    <section
      aria-label="Weverse DM"
      className="fixed bottom-0 right-[24px] z-[95] flex h-[588px] max-h-[calc(100vh-72px)] w-[375px] flex-col overflow-hidden rounded-t-[20px] border border-b-0 border-black/[0.06] bg-white shadow-[0_8px_36px_rgba(0,0,0,0.16)] max-[673px]:left-0 max-[673px]:right-0 max-[673px]:h-[84vh] max-[673px]:w-full"
    >
      {/* Header */}
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-black/[0.04] px-[16px]">
        {mode === "chat" && activeArtist ? (
          <div className="flex min-w-0 items-center gap-[8px]">
            <button
              type="button"
              onClick={onBackFromChat}
              aria-label="Back to artist list"
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-black hover:bg-black/[0.04]"
            >
              <ArrowLeftIcon className="h-[18px] w-[18px]" />
            </button>
            <div className="flex min-w-0 items-center gap-[8px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeArtist.avatar}
                alt={activeArtist.artistName}
                className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-[4px]">
                  <strong className="truncate text-[15px] font-bold leading-[19px] text-black">
                    {activeArtist.artistName}
                  </strong>
                  <VerifiedBadgeIcon className="h-[13px] w-[13px] shrink-0" />
                </div>
              </div>
            </div>
          </div>
        ) : mode === "artist-list" ? (
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => onModeChange("home")}
              aria-label="Back to Weverse DM home"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-black hover:bg-black/[0.04]"
            >
              <ArrowLeftIcon className="h-[18px] w-[18px]" />
            </button>
            <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
              Weverse DM
            </h2>
          </div>
        ) : (
          <h2 className="m-0 text-[18px] font-extrabold leading-[24px] text-black">
            Weverse DM
          </h2>
        )}

        <div className="flex items-center gap-[4px]">
          {mode === "home" && (
            <button
              type="button"
              onClick={() => {
                onSelectTab("Recommended");
                onModeChange("artist-list");
              }}
              aria-label="Browse all DM artists"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-black hover:bg-black/[0.04]"
            >
              <AddPersonIcon className="h-[20px] w-[20px]" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onModeChange("minimized")}
            aria-label="Minimize Weverse DM"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-black hover:bg-black/[0.04]"
          >
            <ChevronDownIcon className="h-[20px] w-[20px]" />
          </button>
        </div>
      </div>

      {/* View 3: Live Interactive 1:1 DM Chat View */}
      {mode === "chat" && activeArtist ? (
        <div className="flex flex-1 flex-col overflow-hidden bg-[#f7f8fa]">
          {/* Anniversary Pill */}
          <div className="flex items-center justify-between px-[16px] pt-[12px]">
            <Link
              href={`/${activeArtist.slug}`}
              className="text-[11px] font-semibold text-[#00b8c1] no-underline hover:underline"
            >
              Visit {activeArtist.communityName} Community →
            </Link>
            <span className="inline-flex items-center gap-[4px] rounded-full bg-white px-[10px] py-[4px] text-[11px] font-bold text-[#111111] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <SparkleIcon className="h-[11px] w-[11px]" />
              <span>+1 day</span>
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 space-y-[12px] overflow-y-auto px-[16px] py-[14px]">
            {activeMessages.map((msg) =>
              msg.sender === "artist" ? (
                <div key={msg.id} className="flex items-start gap-[8px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeArtist.avatar}
                    alt={activeArtist.artistName}
                    className="h-[34px] w-[34px] shrink-0 rounded-full object-cover"
                  />
                  <div className="max-w-[76%]">
                    <span className="mb-[3px] block text-[11px] font-semibold text-[#666666]">
                      {activeArtist.artistName}
                    </span>
                    <div className="flex items-end gap-[6px]">
                      <div className="rounded-[4px_16px_16px_16px] bg-white px-[13px] py-[9px] text-[14px] leading-[20px] text-[#111111] shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                        {msg.text}
                      </div>
                      <span className="shrink-0 text-[10px] text-[#8e8e8e]">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="flex items-end justify-end gap-[6px]"
                >
                  <span className="shrink-0 text-[10px] text-[#8e8e8e]">
                    {msg.timestamp}
                  </span>
                  <div className="max-w-[76%] rounded-[16px_4px_16px_16px] bg-[#00cbd5] px-[13px] py-[9px] text-[14px] font-medium leading-[20px] text-white">
                    {msg.text}
                  </div>
                </div>
              )
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Composer */}
          <form
            onSubmit={handleSend}
            className="flex shrink-0 items-center gap-[8px] border-t border-black/[0.06] bg-white px-[12px] py-[10px]"
          >
            <input
              id="weverse-dm-message-input"
              name="dmMessageInput"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Send a message to ${activeArtist.artistName}...`}
              aria-label="Type a DM message"
              className="h-[38px] flex-1 rounded-full bg-[#f7f8fa] px-[14px] text-[13px] text-black placeholder-[#8e8e8e] outline-none focus:ring-1 focus:ring-[#00cbd5]"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#00cbd5] text-white transition-opacity disabled:opacity-40"
            >
              <DmMessageIcon className="h-[18px] w-[18px]" />
            </button>
          </form>
        </div>
      ) : mode === "home" ? (
        /* View 1: Home / Messages View */
        <div className="flex-1 overflow-y-auto px-[16px] pb-[20px] pt-[12px]">
          <Link
            href="/notice/40731"
            onClick={() => onModeChange("minimized")}
            className="flex h-[84px] items-center justify-between overflow-hidden rounded-[12px] bg-[#f2f4f8] px-[16px] no-underline transition-colors hover:bg-[#ebeef4]"
          >
            <div className="flex flex-col">
              <strong className="text-[15px] font-bold leading-[20px] text-black">
                Weverse DM
              </strong>
              <span className="mt-[2px] text-[12px] leading-[16px] text-[#666666]">
                33% Off Promotion
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sites/weverse/hero/slide-01.webp"
              alt="Weverse DM 33% Off Promotion"
              className="h-[64px] w-[86px] rounded-[8px] object-cover"
            />
          </Link>

          <div className="mt-[20px]">
            <h3 className="m-0 text-[16px] font-bold leading-[22px] text-black">
              Messages
            </h3>
            <button
              type="button"
              onClick={() => {
                onSelectTab("Recommended");
                onModeChange("artist-list");
              }}
              className="mt-[12px] flex w-full items-center gap-[12px] rounded-[12px] py-[4px] text-left transition-colors hover:bg-black/[0.02]"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#dffafb] text-[22px] font-light text-black">
                +
              </span>
              <span className="text-[14px] font-medium text-[#666666]">
                DM with your artist
              </span>
            </button>
          </div>

          <hr className="my-[16px] border-0 border-t border-black/[0.05]" />

          <div className="flex items-center justify-between">
            <h3 className="m-0 text-[16px] font-bold leading-[22px] text-black">
              Recommended
            </h3>
            <button
              type="button"
              onClick={() => setRecommendedOffset((prev) => prev + 3)}
              aria-label="Refresh recommended DM artists"
              className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-black/10 text-black hover:bg-black/[0.04]"
            >
              <RefreshIcon className="h-[12px] w-[12px]" />
            </button>
          </div>

          <ul className="m-0 mt-[12px] list-none space-y-[12px] p-0">
            {recommendedHomeItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectArtistRow(item.id)}
                  className="flex w-full items-center justify-between gap-[10px] rounded-[10px] py-[2px] text-left transition-colors hover:bg-black/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-[10px]">
                    <div className="relative h-[44px] w-[44px] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.avatar}
                        alt={item.artistName}
                        className="h-full w-full rounded-full object-cover"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute bottom-[-2px] right-[-2px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-[#f7f8fa] text-[10px]"
                      >
                        {item.emoji}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-[4px]">
                        <strong className="truncate text-[14px] font-bold leading-[18px] text-black">
                          {item.artistName}
                        </strong>
                        {item.verified && (
                          <VerifiedBadgeIcon className="h-[13px] w-[13px] shrink-0" />
                        )}
                      </div>
                      <span className="block truncate text-[12px] leading-[16px] text-[#8e8e8e]">
                        {item.communityName}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex max-w-[118px] shrink-0 items-center gap-[4px] rounded-full border border-[#ebedf2] bg-white px-[10px] py-[5px] text-[11px] leading-[14px] text-[#666666]">
                    <SparkleIcon className="h-[11px] w-[11px] shrink-0" />
                    <span className="truncate">{item.statusText}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* View 2: Artist List / Filtered DM View */
        <div className="flex flex-1 flex-col overflow-hidden pt-[10px]">
          <div className="px-[16px] pb-[10px]">
            <div className="flex h-[38px] items-center rounded-full bg-[#f7f8fa] px-[14px]">
              <SearchIcon className="mr-[8px] h-[15px] w-[15px] shrink-0 text-[#484848]" />
              <input
                id="weverse-dm-search"
                name="dmArtistSearch"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Enter artist name"
                aria-label="Search DM artist name"
                className="w-full bg-transparent text-[13px] text-black placeholder-[#8e8e8e] outline-none"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  aria-label="Clear DM search"
                  className="ml-[4px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#cccccc] text-white"
                >
                  <CloseIcon className="h-[10px] w-[10px]" />
                </button>
              )}
            </div>
          </div>

          <div className="relative border-b border-black/[0.04] px-[16px] pb-[12px]">
            <div
              className={
                tabsExpanded
                  ? "flex flex-wrap gap-[6px] pr-[34px]"
                  : "wev-no-scrollbar flex flex-nowrap gap-[6px] overflow-x-auto pr-[36px]"
              }
            >
              {COMMUNITY_TABS.map((tab) => {
                const active = selectedTab.toLowerCase() === tab.toLowerCase();
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onSelectTab(tab)}
                    className={`inline-flex h-[32px] shrink-0 items-center gap-[3px] rounded-full px-[12px] text-[12px] font-medium leading-[16px] transition-colors ${active
                        ? "bg-black text-white"
                        : "bg-white text-black shadow-[0_0_0_1px_#ebedf2_inset] hover:bg-[#f7f8fa]"
                      }`}
                  >
                    <span>{tab}</span>
                    {tab === "Recommended" && (
                      <span className="mb-[6px] inline-block h-[4px] w-[4px] rounded-full bg-[#fe5b58]" />
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setTabsExpanded((prev) => !prev)}
              aria-label="Toggle DM filter tabs"
              className="absolute right-[16px] top-0 flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#ebedf2] bg-white text-black shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
            >
              <ChevronDownIcon
                className={`h-[15px] w-[15px] transition-transform ${tabsExpanded ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-[16px] py-[12px]">
            {filteredListArtists.length === 0 ? (
              <div className="py-[40px] text-center text-[13px] text-[#8e8e8e]">
                No DM artists match this filter.
              </div>
            ) : (
              <ul className="m-0 list-none space-y-[14px] p-0">
                {filteredListArtists.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectArtistRow(item.id)}
                      className="flex w-full items-center justify-between gap-[10px] rounded-[10px] py-[2px] text-left transition-colors hover:bg-black/[0.02]"
                    >
                      <div className="flex min-w-0 items-center gap-[10px]">
                        <div className="relative h-[46px] w-[46px] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.avatar}
                            alt={item.artistName}
                            className="h-full w-full rounded-full object-cover"
                          />
                          <span
                            aria-hidden="true"
                            className="absolute bottom-[-2px] right-[-2px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-white bg-[#f7f8fa] text-[10px]"
                          >
                            {item.emoji}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <strong className="block truncate text-[14px] font-bold leading-[18px] text-black">
                            {item.artistName}
                          </strong>
                          <span className="block truncate text-[12px] leading-[16px] text-[#8e8e8e]">
                            {item.communityName}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex max-w-[122px] shrink-0 items-center gap-[4px] rounded-full border border-[#ebedf2] bg-white px-[10px] py-[5px] text-[11px] leading-[14px] text-[#666666]">
                        <SparkleIcon className="h-[11px] w-[11px] shrink-0" />
                        <span className="truncate">{item.statusText}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
