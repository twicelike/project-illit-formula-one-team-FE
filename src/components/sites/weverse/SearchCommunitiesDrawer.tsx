"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  resolveSlugForFandomName,
  searchApi,
  type GlobalSearchDto,
} from "@/lib/api";
import { SEARCH_FILTER_TABS } from "./data";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
  VerifiedBadgeIcon,
} from "./icons";
import { useWeverseApp } from "./WeverseAppProvider";

interface SearchCommunitiesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SearchCommunitiesDrawer({
  open,
  onClose,
}: SearchCommunitiesDrawerProps) {
  const { allArtistsCatalog, fandomsBySlug } = useWeverseApp();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [beSearchResults, setBeSearchResults] =
    useState<GlobalSearchDto | null>(null);
  const [searchingBe, setSearchingBe] = useState(false);

  // Debounced live search against BE /api/v1/search
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setBeSearchResults(null);
      setSearchingBe(false);
      return;
    }

    let cancelled = false;
    setSearchingBe(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await searchApi.globalSearch({ q, limit: 8 });
        if (!cancelled) {
          setBeSearchResults(res);
        }
      } catch {
        if (!cancelled) {
          setBeSearchResults(null);
        }
      } finally {
        if (!cancelled) {
          setSearchingBe(false);
        }
      }
    }, 240);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const filteredArtists = useMemo(() => {
    const q = query.trim().toLowerCase();
    const beMatchedSlugs = new Set(
      (beSearchResults?.fandoms ?? []).map((f) =>
        resolveSlugForFandomName(f.name)
      )
    );

    return allArtistsCatalog.filter((artist) => {
      if (q) {
        const nameHit = artist.name.toLowerCase().includes(q);
        const memberHit = artist.members?.some((m) =>
          m.toLowerCase().includes(q)
        );
        const beHit = beMatchedSlugs.has(artist.slug);
        if (!nameHit && !memberHit && !beHit) return false;
      }

      if (activeFilter === "All") return true;
      if (activeFilter === "Weverse DM") return Boolean(artist.hasDm);
      if (activeFilter === "New") return Boolean(artist.isNew);
      if (activeFilter === "Group") return artist.category === "Group";
      if (activeFilter === "Solo") return artist.category === "Solo";
      if (activeFilter === "Latin") return artist.category === "Latin";
      if (activeFilter === "0-9") return /^[0-9]/.test(artist.name);
      if (activeFilter === "#-&") return /^[^A-Za-z0-9]/.test(artist.name);

      return artist.name.toUpperCase().startsWith(activeFilter);
    });
  }, [allArtistsCatalog, query, activeFilter, beSearchResults]);

  if (!open) return null;

  const beArtists = beSearchResults?.artists ?? [];
  const bePosts = beSearchResults?.posts ?? [];

  return (
    <>
      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-transparent max-[673px]:bg-black/25"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Search Communities"
        className="fixed bottom-0 left-[72px] top-[56px] z-[80] flex w-[356px] flex-col border-r border-black/[0.06] bg-white shadow-[8px_0_32px_rgba(0,0,0,0.08)] max-[673px]:left-0 max-[673px]:top-0 max-[673px]:w-full max-[673px]:shadow-none"
      >
        {/* Mobile header bar */}
        <div className="hidden h-[48px] items-center justify-between border-b border-black/[0.04] px-[16px] max-[673px]:flex">
          <span className="text-[16px] font-bold text-black">
            Search Communities
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search Communities"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-black hover:bg-black/[0.04]"
          >
            <CloseIcon className="h-[20px] w-[20px]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-[16px] pb-[12px] pt-[12px]">
          <div className="relative flex h-[40px] items-center rounded-full bg-[#f7f8fa] px-[14px]">
            <SearchIcon className="mr-[8px] h-[16px] w-[16px] shrink-0 text-[#484848]" />
            <input
              id="weverse-community-search"
              name="communitySearch"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communities, artists, or posts"
              aria-label="Enter artist name"
              className="w-full bg-transparent text-[14px] text-black placeholder-[#8e8e8e] outline-none"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="ml-[6px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#cccccc] text-white hover:bg-[#999999]"
              >
                <CloseIcon className="h-[11px] w-[11px]" />
              </button>
            )}
          </div>
          {searchingBe && (
            <span className="mt-[4px] block px-[6px] text-[11px] text-[#8e8e8e]">
              Searching Weverse...
            </span>
          )}
        </div>

        {/* Category & Alphabet Filter Chips */}
        <div className="relative border-b border-black/[0.04] px-[16px] pb-[12px]">
          {filtersExpanded ? (
            <div className="flex flex-wrap gap-[6px] pr-[34px]">
              {SEARCH_FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFilter(tab)}
                    className={`h-[32px] rounded-full px-[12px] text-[13px] font-medium leading-[17px] transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-white text-black shadow-[0_0_0_1px_#ebedf2_inset] hover:bg-[#f7f8fa]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="wev-no-scrollbar flex flex-nowrap items-center gap-[6px] overflow-x-auto pr-[38px]">
              {SEARCH_FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFilter(tab)}
                    className={`h-[32px] shrink-0 rounded-full px-[12px] text-[13px] font-medium leading-[17px] transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-white text-black shadow-[0_0_0_1px_#ebedf2_inset] hover:bg-[#f7f8fa]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => setFiltersExpanded((prev) => !prev)}
            aria-label={
              filtersExpanded
                ? "Collapse filter options"
                : "Expand filter options"
            }
            aria-expanded={filtersExpanded}
            className="absolute right-[16px] top-0 flex h-[32px] w-[32px] items-center justify-center rounded-full border border-[#ebedf2] bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[#f7f8fa]"
          >
            <ChevronDownIcon
              className={`h-[16px] w-[16px] transition-transform duration-150 ${
                filtersExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Scrollable Community, Artist & Post Results List */}
        <div className="flex-1 overflow-y-auto px-[16px] py-[8px]">
          {filteredArtists.length === 0 &&
          beArtists.length === 0 &&
          bePosts.length === 0 ? (
            <div className="py-[48px] text-center text-[14px] text-[#8e8e8e]">
              No matching communities found.
            </div>
          ) : (
            <>
              {filteredArtists.length > 0 && (
                <ul className="m-0 list-none divide-y divide-black/[0.03] p-0">
                  {filteredArtists.map((artist) => {
                    const beFandom = fandomsBySlug[artist.slug];
                    return (
                      <li key={`search-${artist.slug}`}>
                        <Link
                          href={`/${artist.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-[12px] py-[10px] text-black no-underline transition-colors hover:bg-black/[0.02]"
                        >
                          <div className="relative shrink-0 pr-[2px]">
                            <div className="wev-squircle-mask h-[48px] w-[48px] overflow-hidden bg-[#f2f3f7]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={artist.headerImage}
                                alt={artist.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="absolute bottom-[-2px] right-[-2px] h-[20px] w-[20px] overflow-hidden rounded-full border-[1.5px] border-white bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={artist.logoImage}
                                alt=""
                                width={20}
                                height={20}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-[6px]">
                              <strong className="truncate text-[14px] font-bold leading-[19px] text-black">
                                {artist.name}
                              </strong>
                              {artist.isNew && (
                                <span className="inline-flex h-[16px] shrink-0 items-center rounded-[4px] bg-[#edf3ff] px-[5px] text-[9px] font-bold leading-[12px] text-[#5989fe]">
                                  NEW
                                </span>
                              )}
                              {beFandom?.joined && (
                                <span className="inline-flex h-[16px] shrink-0 items-center rounded-[4px] bg-[#dffafb] px-[5px] text-[9px] font-bold leading-[12px] text-[#009ba3]">
                                  JOINED
                                </span>
                              )}
                            </div>
                            {artist.members && artist.members.length > 0 && (
                              <div className="mt-[2px] flex items-end justify-between gap-[6px]">
                                <p className="m-0 line-clamp-2 text-[11px] leading-[15px] text-[#8e8e8e]">
                                  {artist.members.join(" · ")}
                                </p>
                                {artist.extraMemberCount && (
                                  <span className="shrink-0 text-[11px] font-semibold leading-[15px] text-[#484848]">
                                    +{artist.extraMemberCount}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <ArrowRightIcon className="h-[14px] w-[14px] shrink-0 text-[#484848]" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Live Backend Matching Artists */}
              {query.trim().length > 0 && beArtists.length > 0 && (
                <div className="mt-[14px] border-t border-black/[0.06] pt-[12px]">
                  <strong className="mb-[8px] block text-[12px] font-bold uppercase tracking-wide text-[#8e8e8e]">
                    Artists ({beArtists.length})
                  </strong>
                  <ul className="m-0 list-none space-y-[8px] p-0">
                    {beArtists.map((a) => {
                      const matchedArtist = allArtistsCatalog.find(
                        (cat) =>
                          cat.name.toLowerCase() ===
                            a.stageName.toLowerCase() ||
                          cat.members?.some(
                            (m) =>
                              m.toLowerCase() === a.stageName.toLowerCase()
                          )
                      );
                      const targetSlug = matchedArtist
                        ? matchedArtist.slug
                        : resolveSlugForFandomName(a.stageName);

                      return (
                        <li key={a.userId}>
                          <Link
                            href={`/${targetSlug}`}
                            onClick={onClose}
                            className="flex items-center gap-[10px] rounded-[8px] p-[6px] text-black no-underline hover:bg-black/[0.03]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                a.avatar ||
                                "/sites/weverse/artists/kep1er-logo.webp"
                              }
                              alt={a.stageName}
                              className="h-[34px] w-[34px] shrink-0 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-[4px]">
                                <strong className="truncate text-[13px] font-bold text-black">
                                  {a.stageName}
                                </strong>
                                <VerifiedBadgeIcon className="h-[13px] w-[13px] shrink-0" />
                              </div>
                              <span className="block truncate text-[11px] text-[#8e8e8e]">
                                {a.company?.name || "Weverse Artist"}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Live Backend Matching Posts */}
              {query.trim().length > 0 && bePosts.length > 0 && (
                <div className="mt-[14px] border-t border-black/[0.06] pt-[12px]">
                  <strong className="mb-[8px] block text-[12px] font-bold uppercase tracking-wide text-[#8e8e8e]">
                    Community Posts ({bePosts.length})
                  </strong>
                  <ul className="m-0 list-none space-y-[8px] p-0">
                    {bePosts.map((p) => {
                      const targetSlug = resolveSlugForFandomName(
                        p.fandomName || "illit"
                      );
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/${targetSlug}`}
                            onClick={onClose}
                            className="block rounded-[10px] bg-[#f7f8fa] p-[10px] text-black no-underline transition-colors hover:bg-[#ebedf2]"
                          >
                            <div className="flex items-center justify-between gap-[6px]">
                              <span className="flex items-center gap-[4px] text-[12px] font-bold">
                                {p.author?.stageName || p.author?.name}
                                {p.author?.verified && (
                                  <VerifiedBadgeIcon className="h-[12px] w-[12px]" />
                                )}
                              </span>
                              <span className="rounded-[4px] bg-white px-[6px] py-[2px] text-[10px] font-bold text-[#00b8c1]">
                                {p.fandomName}
                              </span>
                            </div>
                            <p className="mb-0 mt-[4px] line-clamp-2 text-[12px] leading-[17px] text-[#484848]">
                              {p.content}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
