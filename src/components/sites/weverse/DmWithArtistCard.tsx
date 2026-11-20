"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DM_BATCHES, type DmArtistChip } from "./data";
import { ArrowLeftIcon, ArrowRightIcon, NextArrowIcon, RefreshIcon } from "./icons";

interface DmWithArtistCardProps {
  onSelectArtist: (artist: DmArtistChip) => void;
  onViewAll: () => void;
}

export function DmWithArtistCard({
  onSelectArtist,
  onViewAll,
}: DmWithArtistCardProps) {
  const [batchIndex, setBatchIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const items = DM_BATCHES[batchIndex % DM_BATCHES.length];
  const row1 = items.slice(0, 6);
  const row2 = items.slice(6, 9);

  const syncScrollArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    syncScrollArrows();
    window.addEventListener("resize", syncScrollArrows);
    return () => window.removeEventListener("resize", syncScrollArrows);
  }, [syncScrollArrows, batchIndex]);

  const scrollByAmount = (delta: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setBatchIndex((prev) => (prev + 1) % DM_BATCHES.length);
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const renderChip = (artist: DmArtistChip) => {
    const shouldMarquee = artist.marquee || artist.name.length >= 14;
    return (
      <div key={`${batchIndex}-${artist.id}`} className="shrink-0">
        <button
          type="button"
          onClick={() => onSelectArtist(artist)}
          className="wev-dm-chip"
        >
          <span className="wev-dm-chip-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artist.avatar}
              alt={artist.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </span>
          {shouldMarquee ? (
            <span className="wev-marquee-viewport">
              <span className="wev-marquee-track">
                <span className="pr-[22px]">{artist.name}</span>
                <span className="pr-[22px]" aria-hidden="true">
                  {artist.name}
                </span>
              </span>
            </span>
          ) : (
            <span className="truncate">{artist.name}</span>
          )}
        </button>
      </div>
    );
  };

  return (
    <section
      aria-label="DM with your Artist"
      className="relative rounded-[16px] bg-white pb-[16px] shadow-[0_6px_28px_rgba(0,0,0,0.10)]"
    >
      <div className="flex items-center justify-between gap-[20px] px-[16px] pb-[12px] pt-[16px]">
        <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
          DM with your Artist!
        </h2>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Refresh DM artist suggestions"
          className="flex h-[24px] w-[24px] items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:bg-black/[0.04]"
        >
          <RefreshIcon className="h-[12px] w-[12px]" />
        </button>
      </div>

      {/* Horizontal 2-row scroll container */}
      <div
        ref={scrollerRef}
        onScroll={syncScrollArrows}
        className="wev-no-scrollbar overflow-x-auto overflow-y-hidden"
      >
        <div className="inline-flex min-w-full flex-col gap-[8px]">
          <div className="flex flex-nowrap items-center gap-[8px] px-[16px]">
            {row1.map(renderChip)}
          </div>
          <div className="flex flex-nowrap items-center gap-[8px] px-[16px]">
            {row2.map(renderChip)}
            <div className="shrink-0">
              <button
                type="button"
                onClick={onViewAll}
                className="wev-dm-view-all-chip"
              >
                <span>View All</span>
                <NextArrowIcon className="h-[16px] w-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overflow Left / Right Navigation Buttons (Tablet & Narrow Desktop) */}
      {canScrollPrev && (
        <div className="wev-dm-nav-area" data-dir="prev">
          <button
            type="button"
            onClick={() => scrollByAmount(-280)}
            aria-label="Scroll DM artists left"
            className="pointer-events-auto flex h-[36px] w-[36px] items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:bg-[#f7f8fa]"
          >
            <ArrowLeftIcon className="h-[16px] w-[16px]" />
          </button>
        </div>
      )}
      {canScrollNext && (
        <div className="wev-dm-nav-area" data-dir="next">
          <button
            type="button"
            onClick={() => scrollByAmount(280)}
            aria-label="Scroll DM artists right"
            className="pointer-events-auto flex h-[36px] w-[36px] items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:bg-[#f7f8fa]"
          >
            <ArrowRightIcon className="h-[16px] w-[16px]" />
          </button>
        </div>
      )}
    </section>
  );
}

