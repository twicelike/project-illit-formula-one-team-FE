"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { type FeaturedArtist } from "./data";
import { useWeverseApp } from "./WeverseAppProvider";

function ArtistRowItem({ artist }: { artist: FeaturedArtist }) {
  return (
    <Link
      href={`/${artist.slug}`}
      className="group flex h-[76px] items-center gap-[12px] text-black no-underline"
    >
      <div className="relative shrink-0 pr-[4px]">
        <div className="wev-squircle-mask h-[72px] w-[72px] overflow-hidden bg-[#f2f3f7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.headerImage}
            alt={artist.name}
            width={72}
            height={72}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute bottom-[-2px] right-[-2px] h-[28px] w-[28px] overflow-hidden rounded-full border-2 border-white bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.logoImage}
            alt=""
            width={28}
            height={28}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <strong className="line-clamp-2 min-w-0 flex-1 break-words text-[16px] font-bold leading-[22px] text-black group-hover:underline">
        {artist.name}
      </strong>
    </Link>
  );
}

export function FeaturedArtistsCard() {
  const { allArtistsCatalog } = useWeverseApp();
  const [mobilePage, setMobilePage] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

  const mobileColumns = useMemo(() => {
    const cols: FeaturedArtist[][] = [];
    for (let i = 0; i < allArtistsCatalog.length; i += 4) {
      cols.push(allArtistsCatalog.slice(i, i + 4));
    }
    return cols;
  }, [allArtistsCatalog]);

  const totalPages = mobileColumns.length;

  const handleMobileScroll = () => {
    const el = mobileCarouselRef.current;
    if (!el || totalPages <= 1) return;
    const colWidth = el.clientWidth * 0.8315;
    if (colWidth <= 0) return;
    const page = Math.min(
      totalPages - 1,
      Math.max(0, Math.round(el.scrollLeft / colWidth))
    );
    setMobilePage(page);
  };

  return (
    <section
      aria-label="Looking for new artists"
      className="overflow-hidden rounded-[16px] bg-white pb-[16px] shadow-[0_6px_28px_rgba(0,0,0,0.10)]"
    >
      {/* Desktop & Tablet 2-Column Grid (>= 674px) */}
      <div className="wev-featured-desktop">
        <h2 className="m-0 px-[16px] pb-[12px] pt-[16px] text-[16px] font-bold leading-[22px] text-black">
          Looking for new artists?
        </h2>
        <div className="px-[16px]">
          <ul className="m-0 grid list-none grid-cols-2 gap-x-[16px] gap-y-[12px] p-0">
            {allArtistsCatalog.map((artist) => (
              <li key={`feat-desk-${artist.slug}`} className="min-w-0">
                <ArtistRowItem artist={artist} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile 4-Row Horizontal Swipeable Carousel (<= 673px) */}
      <div className="wev-featured-mobile">
        <div className="flex items-center justify-between gap-[8px] px-[16px] pb-[12px] pt-[16px]">
          <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
            Looking for new artists?
          </h2>
          <div className="px-[4px] py-[2px] text-[10px] leading-[14px]">
            <span className="font-bold text-black">{mobilePage + 1}</span>
            <span className="mx-[4px] mt-[4px] inline-block h-[7px] w-[1px] bg-black/30 align-top" />
            <span className="text-black/50">{totalPages}</span>
          </div>
        </div>

        <div
          ref={mobileCarouselRef}
          onScroll={handleMobileScroll}
          className="wev-no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {mobileColumns.map((column, colIdx) => (
            <ul
              key={colIdx}
              className="m-0 shrink-0 basis-[83.15%] snap-start list-none pl-[16px] pr-0"
            >
              {column.map((artist) => (
                <li key={`feat-mob-${artist.slug}`} className="mb-[12px] last:mb-0">
                  <ArtistRowItem artist={artist} />
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* 120px Bottom Progress Track */}
        <div className="mx-auto mt-[12px] h-[3px] w-[120px] overflow-hidden rounded-full bg-[#e6e8ec]">
          <div
            className="h-full rounded-full bg-black transition-transform duration-200"
            style={{
              width: `${100 / Math.max(1, totalPages)}%`,
              transform: `translateX(${mobilePage * 100}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

