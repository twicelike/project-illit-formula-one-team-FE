"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_SLIDES } from "./data";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { useWeverseApp } from "./WeverseAppProvider";

export function HeroBannerCarousel() {
  const { openDmHome, openDmArtistList } = useWeverseApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slideCount = HERO_SLIDES.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount]
  );

  const handlePrev = useCallback(() => {
    setIsPaused(true);
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const handleNext = useCallback(() => {
    setIsPaused(true);
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [isPaused, slideCount]);

  const slide = HERO_SLIDES[activeIndex];
  const isDarkText = slide.textColor === "#000000";

  return (
    <section
      className="wev-hero-outer"
      aria-label="Featured promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="wev-hero-stage"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
          setIsPaused(true);
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) > 40) {
            goTo(delta < 0 ? activeIndex + 1 : activeIndex - 1);
          }
        }}
      >
        {/* Crossfading blurred dynamic backdrop stack matching Weverse 3.0 */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden="true"
        >
          {HERO_SLIDES.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={item.id}
                className="absolute inset-0 transition-opacity duration-400 ease-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 1 : 0,
                  backgroundColor: item.backdropColor,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full scale-125 object-cover blur-3xl opacity-55"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor:
                      item.textColor === "#000000"
                        ? "rgba(255, 255, 255, 0.24)"
                        : "rgba(0, 0, 0, 0.28)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Mobile full-bleed square image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.image}
          alt={`${slide.firstTitle} ${slide.secondTitle}`}
          className="wev-hero-mobile-image"
        />

        {/* Mobile top-right translucent slide counter pill */}
        <div className="wev-hero-mobile-counter" aria-live="polite">
          <span>{activeIndex + 1}</span>
          <span className="mx-1.5 inline-block h-[9px] w-[1px] bg-white/40" />
          <span className="font-normal text-white/75">{slideCount}</span>
        </div>

        {/* Slide Content Link */}
        {slide.landingUrl.startsWith("#open-dm") ? (
          <button
            type="button"
            onClick={() => {
              const parts = slide.landingUrl.split(":");
              if (parts.length > 1 && parts[1]) {
                openDmArtistList(parts[1]);
              } else {
                openDmHome();
              }
            }}
            className="wev-hero-slide-body border-0 bg-transparent text-left"
            style={{ color: slide.textColor }}
          >
            <div className="wev-hero-text-col">
              {slide.communityName && (
                <span
                  className="inline-flex h-[24px] w-fit items-center rounded-full px-[8px] text-[11px] font-bold leading-[14px]"
                  style={{
                    border: isDarkText
                      ? "1px solid rgba(0, 0, 0, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.26)",
                    backgroundColor: isDarkText
                      ? "rgba(0, 0, 0, 0.04)"
                      : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {slide.communityName}
                </span>
              )}
              <strong className="wev-hero-title">
                {slide.firstTitle}
                <br />
                {slide.secondTitle}
              </strong>
              <span className="wev-hero-desc">
                {slide.subTitle}
                <br />
                {slide.secondSubTitle}
              </span>
            </div>

            <div className="wev-hero-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={`${slide.firstTitle} ${slide.secondTitle}`}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </button>
        ) : (
          <Link
            href={slide.landingUrl}
            className="wev-hero-slide-body"
            style={{ color: slide.textColor }}
          >
            <div className="wev-hero-text-col">
              {slide.communityName && (
                <span
                  className="inline-flex h-[24px] w-fit items-center rounded-full px-[8px] text-[11px] font-bold leading-[14px]"
                  style={{
                    border: isDarkText
                      ? "1px solid rgba(0, 0, 0, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.26)",
                    backgroundColor: isDarkText
                      ? "rgba(0, 0, 0, 0.04)"
                      : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {slide.communityName}
                </span>
              )}
              <strong className="wev-hero-title">
                {slide.firstTitle}
                <br />
                {slide.secondTitle}
              </strong>
              <span className="wev-hero-desc">
                {slide.subTitle}
                <br />
                {slide.secondSubTitle}
              </span>
            </div>

            <div className="wev-hero-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={`${slide.firstTitle} ${slide.secondTitle}`}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </Link>
        )}

        {/* Desktop & Tablet Prev / Next Circular Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous banner"
          className="wev-hero-desktop-arrows absolute left-[20px] top-1/2 z-10 h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/35"
        >
          <ArrowLeftIcon className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next banner"
          className="wev-hero-desktop-arrows absolute right-[20px] top-1/2 z-10 h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/35"
        >
          <ArrowRightIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Desktop & Tablet Compact Segmented Line Indicator */}
      <div
        className="wev-hero-desktop-indicator relative h-[3px] w-[120px] items-center rounded-full bg-[#e6e8ec]"
        role="tablist"
        aria-label="Banner slides"
      >
        {HERO_SLIDES.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Slide ${idx + 1}: ${item.firstTitle}`}
              onClick={() => {
                setIsPaused(true);
                goTo(idx);
              }}
              className="relative h-[14px] flex-1 bg-transparent p-0"
            >
              <span
                className="block h-[3px] w-full rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: isActive ? "#111111" : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

