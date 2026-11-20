"use client";

import Link from "next/link";
import { useState } from "react";
import { JELLY_PACKS } from "./community-data";
import {
  DmMessageIcon,
  JellySquircleIcon,
  MenuIcon,
  SparkleIcon,
  WeverseMarkSquareIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

export function JellyPageClient() {
  const { user, addJelly, openLoginModal, openDmHome, openCookieModal } =
    useWeverseApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top 56px Header */}
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
          <strong className="text-[19px] font-extrabold leading-[24px] text-black">
            Jelly Shop
          </strong>
        </div>

        <button
          type="button"
          onClick={openDmHome}
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

      <div className="pt-[56px] max-[673px]:pt-[48px]">
        <main className="mx-auto max-w-[960px] px-[20px] pb-[64px] pt-[28px] max-[673px]:px-[16px]">
          {/* Jelly Balance Summary Hero */}
          <section className="wev-community-card flex flex-wrap items-center justify-between gap-[20px] bg-gradient-to-r from-[#dffafb] via-white to-[#edf3ff] p-[28px] max-[673px]:p-[20px]">
            <div className="flex items-center gap-[16px]">
              <JellySquircleIcon className="h-[52px] w-[52px] shrink-0 text-[#00cbd5]" />
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wide text-[#009ba3]">
                  Weverse Digital Currency
                </span>
                <h1 className="m-0 mt-[2px] text-[28px] font-extrabold leading-[34px] text-black max-[673px]:text-[22px]">
                  {user ? `${user.jellyBalance.toLocaleString()} J` : "Sign in to view Jelly"}
                </h1>
                <p className="mb-0 mt-[4px] text-[13px] text-[#666666]">
                  {user
                    ? `Signed in as ${user.nickname} · Instant local top-up enabled`
                    : "Sign in to receive 350 starter Jelly and recharge packs instantly."}
                </p>
              </div>
            </div>

            {!user && (
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="h-[42px] rounded-full bg-[#00cbd5] px-[22px] text-[14px] font-extrabold text-white hover:bg-[#00b8c1]"
              >
                Demo Sign In (+350 J)
              </button>
            )}
          </section>

          {/* Recharge Packs */}
          <section className="mt-[28px]">
            <h2 className="m-0 mb-[16px] text-[18px] font-extrabold text-black">
              Recharge Jelly Packs
            </h2>
            <div className="grid grid-cols-3 gap-[16px] max-[820px]:grid-cols-2 max-[520px]:grid-cols-1">
              {JELLY_PACKS.map((pack) => {
                const total = pack.amount + pack.bonus;
                return (
                  <div
                    key={pack.id}
                    className={`relative flex flex-col rounded-[16px] border p-[20px] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
                      pack.popular
                        ? "border-[#00cbd5] bg-[#dffafb]/20"
                        : "border-[#ebedf2] bg-white"
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute right-[16px] top-[16px] inline-flex items-center gap-[4px] rounded-full bg-[#dffafb] px-[9px] py-[3px] text-[10px] font-extrabold text-[#009ba3]">
                        <SparkleIcon className="h-[10px] w-[10px]" />
                        <span>BEST</span>
                      </span>
                    )}

                    <div className="flex items-center gap-[10px]">
                      <JellySquircleIcon className="h-[32px] w-[32px] text-[#00cbd5]" />
                      <div>
                        <strong className="block text-[20px] font-extrabold text-black">
                          {pack.amount} J
                        </strong>
                        {pack.bonus > 0 ? (
                          <span className="text-[12px] font-bold text-[#00b8c1]">
                            +{pack.bonus} Bonus J
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#8e8e8e]">
                            Standard pack
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-[20px] flex items-center justify-between border-t border-black/[0.05] pt-[14px]">
                      <span className="text-[16px] font-extrabold text-black">
                        ${pack.priceUsd.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => addJelly(total)}
                        className="h-[36px] rounded-full bg-black px-[16px] text-[12px] font-bold text-white transition-colors hover:bg-[#00cbd5]"
                      >
                        Recharge +{total} J
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Where to use Jelly */}
          <section className="mt-[32px] grid grid-cols-2 gap-[16px] max-[673px]:grid-cols-1">
            <div className="rounded-[16px] border border-[#ebedf2] bg-[#f7f8fa] p-[20px]">
              <strong className="block text-[16px] font-bold text-black">
                Weverse DM Subscriptions
              </strong>
              <p className="mb-0 mt-[6px] text-[13px] leading-[19px] text-[#666666]">
                Exchange 1:1 private messages and receive exclusive photos directly
                from your favorite artists.
              </p>
              <button
                type="button"
                onClick={openDmHome}
                className="mt-[14px] h-[36px] rounded-full bg-[#00cbd5] px-[16px] text-[12px] font-bold text-white hover:bg-[#00b8c1]"
              >
                Open Weverse DM →
              </button>
            </div>

            <div className="rounded-[16px] border border-[#ebedf2] bg-[#f7f8fa] p-[20px]">
              <strong className="block text-[16px] font-bold text-black">
                Fan Letters &amp; Community Perks
              </strong>
              <p className="mb-0 mt-[6px] text-[13px] leading-[19px] text-[#666666]">
                Explore artist communities, unlock digital VODs, and send custom
                decorated Fan Letters.
              </p>
              <Link
                href="/illit"
                className="mt-[14px] inline-flex h-[36px] items-center rounded-full bg-black px-[16px] text-[12px] font-bold text-white no-underline hover:bg-[#282828]"
              >
                Visit ILLIT Community →
              </Link>
            </div>
          </section>
        </main>

        <WeverseFooter onOpenCookieSettings={openCookieModal} />
      </div>
    </div>
  );
}
