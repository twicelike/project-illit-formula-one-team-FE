"use client";

import Link from "next/link";
import { useState } from "react";
import { AdBannerSlot } from "./AdBannerSlot";
import { FEATURED_ARTISTS } from "./data";
import { DmWithArtistCard } from "./DmWithArtistCard";
import { FeaturedArtistsCard } from "./FeaturedArtistsCard";
import { HeroBannerCarousel } from "./HeroBannerCarousel";
import {
  AddCommunityIcon,
  DmMessageIcon,
  ExternalLinkIcon,
  JellySquircleIcon,
  MenuIcon,
  ShopSquircleIcon,
  UserGuestIcon,
  WeverseWordmarkIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

const SIDEBAR_RECOMMENDED = FEATURED_ARTISTS.slice(0, 4);

export function WeverseHomePage() {
  const {
    user,
    allArtistsCatalog,
    logoutDemo,
    joinedSlugs,
    cart,
    dmMode,
    setDmMode,
    openDmForChip,
    openDmArtistList,
    openLoginModal,
    openCookieModal,
  } = useWeverseApp();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  const effectiveDesktopCollapsed = sidebarCollapsed || searchDrawerOpen;

  const joinedArtists = Array.from(new Set(joinedSlugs))
    .map((slug) => allArtistsCatalog.find((a) => a.slug === slug))
    .filter((a): a is (typeof allArtistsCatalog)[number] => Boolean(a));

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleHeaderMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 673) {
      setMobileMenuOpen((prev) => !prev);
      return;
    }
    if (searchDrawerOpen) {
      setSearchDrawerOpen(false);
      setSidebarCollapsed(false);
      return;
    }
    setSidebarCollapsed((prev) => !prev);
  };

  const handleToggleSearchDrawer = () => {
    setMobileMenuOpen(false);
    setSearchDrawerOpen((prev) => !prev);
  };

  const handleHeaderDmClick = () => {
    setDmMode(
      dmMode === "home" || dmMode === "artist-list" || dmMode === "chat"
        ? "minimized"
        : "home"
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Fixed Top Header (56px desktop/tablet, 48px mobile) */}
      <header className="wev-header">
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={handleHeaderMenuClick}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen || !effectiveDesktopCollapsed}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-transparent text-black transition-colors hover:bg-black/[0.04]"
          >
            <MenuIcon className="h-[24px] w-[24px]" />
          </button>
          <h1 className="m-0 flex items-center">
            <Link
              href="/"
              aria-label="Weverse"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center text-black no-underline"
            >
              <WeverseWordmarkIcon className="h-[20px] w-[95px]" />
            </Link>
          </h1>
        </div>

        <button
          type="button"
          onClick={handleHeaderDmClick}
          aria-label="DM"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-transparent text-black transition-colors hover:bg-black/[0.04]"
        >
          <DmMessageIcon className="h-[24px] w-[24px]" />
        </button>
      </header>

      {/* Desktop & Tablet Fixed Left Sidebar */}
      <aside
        aria-label="Global Navigation"
        className="wev-sidebar-desktop wev-no-scrollbar"
        data-collapsed={effectiveDesktopCollapsed ? "true" : "false"}
      >
        <div className="flex flex-col px-[8px] pb-[100px] pt-[8px]">
          {/* Auth / Login Block */}
          <div className="px-[8px] pb-[12px] pt-[8px]">
            {effectiveDesktopCollapsed ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => (user ? setSidebarCollapsed(false) : openLoginModal())}
                  aria-label={user ? user.nickname : "Login"}
                  title={user ? `${user.nickname} (${user.jellyBalance} J)` : "Login"}
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] text-black hover:bg-black/[0.04]"
                >
                  {user ? (
                    <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#00cbd5] text-[13px] font-extrabold text-white">
                      {user.nickname.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <UserGuestIcon className="h-[24px] w-[24px]" />
                  )}
                </button>
              </div>
            ) : user ? (
              <div className="max-[1023px]:hidden">
                <div className="flex items-center justify-between gap-[8px]">
                  <Link
                    href="/profile"
                    className="flex min-w-0 items-center gap-[8px] text-black no-underline hover:opacity-85"
                  >
                    <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#00cbd5] text-[14px] font-extrabold text-white">
                      {user.nickname.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-[14px] font-bold leading-[18px] text-black hover:underline">
                        {user.nickname}
                      </strong>
                      <span className="block truncate text-[11px] leading-[14px] text-[#009ba3]">
                        My Profile →
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={logoutDemo}
                    className="shrink-0 rounded-[6px] border border-black/10 px-[7px] py-[3px] text-[11px] font-semibold text-[#666666] hover:bg-black/[0.04]"
                  >
                    Log out
                  </button>
                </div>

                <Link
                  href="/profile"
                  className="mt-[10px] flex items-center justify-between rounded-[8px] bg-[#dffafb]/60 px-[10px] py-[7px] text-[12px] font-bold text-[#008b94] no-underline transition-colors hover:bg-[#dffafb]"
                >
                  <span>👤 My Profile &amp; Follow</span>
                  <span>→</span>
                </Link>

                {user.role?.toUpperCase() === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="mt-[8px] flex items-center justify-between rounded-[8px] bg-[#121c2e] px-[10px] py-[7px] text-[12px] font-extrabold text-[#00cbd5] no-underline transition-colors hover:bg-[#1e2d48]"
                  >
                    <span>🛡️ Admin Console</span>
                    <span>→</span>
                  </Link>
                )}

                <Link
                  href="/jelly"
                  className="mt-[10px] flex items-center justify-between rounded-[8px] bg-[#f7f8fa] px-[10px] py-[7px] text-[12px] font-bold text-black no-underline transition-colors hover:bg-[#dffafb]/60"
                >
                  <span className="flex items-center gap-[6px] text-[#484848]">
                    <JellySquircleIcon className="h-[16px] w-[16px] text-[#00cbd5]" />
                    <span>Jelly</span>
                  </span>
                  <span className="text-[#00b8c1]">{user.jellyBalance} J</span>
                </Link>
              </div>
            ) : (
              <div className="max-[1023px]:hidden">
                <p className="m-0 text-[14px] font-medium leading-[18px] text-[#8e8e8e]">
                  Log in and
                  <br />
                  connect with your artists!
                </p>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="mt-[12px] inline-flex h-[36px] items-center justify-center rounded-[8px] border border-[#00cbd5] bg-white px-[16px] text-[14px] font-bold leading-[18px] text-[#00b8c1] transition-colors hover:bg-[#dffafb]/40"
                >
                  Login
                </button>
              </div>
            )}

            {/* Tablet auto-folded Guest/Profile Icon (674px - 1023px) */}
            {!effectiveDesktopCollapsed && (
              <div className="hidden justify-center max-[1023px]:flex">
                <button
                  type="button"
                  onClick={() => (user ? logoutDemo() : openLoginModal())}
                  aria-label={user ? user.nickname : "Login"}
                  title={user ? `${user.nickname} (Click to sign out)` : "Login"}
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] text-black hover:bg-black/[0.04]"
                >
                  {user ? (
                    <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#00cbd5] text-[13px] font-extrabold text-white">
                      {user.nickname.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <UserGuestIcon className="h-[24px] w-[24px]" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* My Communities (shown dynamically when signed in) */}
          {user && joinedArtists.length > 0 && (
            <div className="mt-[4px] border-t border-black/[0.04] pt-[12px]">
              {!effectiveDesktopCollapsed && (
                <strong className="mb-[8px] block px-[8px] text-[14px] font-medium leading-[18px] text-[#8e8e8e] max-[1023px]:hidden">
                  My Communities
                </strong>
              )}
              <ul className="m-0 list-none space-y-[2px] p-0">
                {joinedArtists.map((artist) => (
                  <li key={`sidebar-joined-${artist.slug}`}>
                    <Link
                      href={`/${artist.slug}`}
                      title={artist.name}
                      className={`flex h-[44px] items-center gap-[12px] rounded-[8px] px-[8px] text-[15px] font-medium leading-[21px] text-black no-underline transition-colors hover:bg-black/[0.04] ${
                        effectiveDesktopCollapsed
                          ? "justify-center px-0"
                          : "max-[1023px]:justify-center max-[1023px]:px-0"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artist.logoImage}
                        alt={artist.name}
                        width={24}
                        height={24}
                        className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
                      />
                      {!effectiveDesktopCollapsed && (
                        <span className="truncate max-[1023px]:hidden">
                          {artist.name}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Section */}
          <div className="mt-[8px] border-t border-black/[0.04] pt-[12px]">
            {!effectiveDesktopCollapsed && (
              <strong className="mb-[8px] block px-[8px] text-[14px] font-medium leading-[18px] text-[#8e8e8e] max-[1023px]:hidden">
                Recommended
              </strong>
            )}

            <ul className="m-0 list-none space-y-[2px] p-0">
              <li>
                <button
                  type="button"
                  onClick={handleToggleSearchDrawer}
                  aria-label="Search Communities"
                  title="Search Communities"
                  className={`flex h-[44px] w-full items-center gap-[12px] rounded-[8px] px-[8px] text-left text-[15px] font-medium leading-[21px] text-black transition-colors hover:bg-black/[0.04] ${effectiveDesktopCollapsed
                    ? "justify-center px-0"
                    : "max-[1023px]:justify-center max-[1023px]:px-0"
                    } ${searchDrawerOpen ? "bg-black/[0.04]" : ""}`}
                >
                  <AddCommunityIcon className="h-[24px] w-[24px] shrink-0 text-black" />
                  {!effectiveDesktopCollapsed && (
                    <span className="truncate max-[1023px]:hidden">
                      Search Communities
                    </span>
                  )}
                </button>
              </li>

              {SIDEBAR_RECOMMENDED.map((artist) => (
                <li key={`sidebar-rec-${artist.slug}`}>
                  <Link
                    href={`/${artist.slug}`}
                    title={artist.name}
                    className={`flex h-[44px] items-center gap-[12px] rounded-[8px] px-[8px] text-[15px] font-medium leading-[21px] text-black no-underline transition-colors hover:bg-black/[0.04] ${effectiveDesktopCollapsed
                      ? "justify-center px-0"
                      : "max-[1023px]:justify-center max-[1023px]:px-0"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artist.logoImage}
                      alt={artist.name}
                      width={24}
                      height={24}
                      className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
                    />
                    {!effectiveDesktopCollapsed && (
                      <span className="truncate max-[1023px]:hidden">
                        {artist.name}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Go to Service Section */}
          <div className="mt-[12px] border-t border-black/[0.04] pt-[12px]">
            {!effectiveDesktopCollapsed && (
              <strong className="mb-[8px] block px-[8px] text-[14px] font-medium leading-[18px] text-[#8e8e8e] max-[1023px]:hidden">
                Go to Service
              </strong>
            )}

            <ul className="m-0 list-none space-y-[2px] p-0">
              <li>
                <Link
                  href="/shop"
                  title="Shop"
                  className={`wev-sidebar-service-link flex h-[44px] items-center justify-between rounded-[8px] px-[8px] text-[15px] font-medium leading-[21px] text-black no-underline transition-colors ${effectiveDesktopCollapsed
                    ? "justify-center px-0"
                    : "max-[1023px]:justify-center max-[1023px]:px-0"
                    }`}
                >
                  <span className="flex min-w-0 items-center gap-[12px]">
                    <ShopSquircleIcon className="wev-service-icon h-[24px] w-[24px] shrink-0 text-[#666666] transition-colors" />
                    {!effectiveDesktopCollapsed && (
                      <span className="truncate max-[1023px]:hidden">Shop</span>
                    )}
                  </span>
                  {!effectiveDesktopCollapsed && (
                    cartCount > 0 ? (
                      <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#00cbd5] px-[5px] text-[10px] font-bold text-white max-[1023px]:hidden">
                        {cartCount}
                      </span>
                    ) : (
                      <ExternalLinkIcon className="wev-external-icon h-[20px] w-[20px] shrink-0 text-[#cccccc] max-[1023px]:hidden" />
                    )
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href="/jelly"
                  title="Jelly Shop"
                  className={`wev-sidebar-service-link flex h-[44px] items-center justify-between rounded-[8px] px-[8px] text-[15px] font-medium leading-[21px] text-black no-underline transition-colors ${effectiveDesktopCollapsed
                    ? "justify-center px-0"
                    : "max-[1023px]:justify-center max-[1023px]:px-0"
                    }`}
                >
                  <span className="flex min-w-0 items-center gap-[12px]">
                    <JellySquircleIcon className="wev-service-icon h-[24px] w-[24px] shrink-0 text-[#666666] transition-colors" />
                    {!effectiveDesktopCollapsed && (
                      <span className="truncate max-[1023px]:hidden">
                        Jelly Shop
                      </span>
                    )}
                  </span>
                  {!effectiveDesktopCollapsed && (
                    <ExternalLinkIcon className="wev-external-icon h-[20px] w-[20px] shrink-0 text-[#cccccc] max-[1023px]:hidden" />
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Mobile 300px Slide-Out Navigation Drawer */}
      <WeverseGlobalMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => setSearchDrawerOpen(true)}
      />

      {/* Search Communities Floating Drawer */}
      <SearchCommunitiesDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
      />

      {/* Main Content Area + Footer */}
      <div
        id="top"
        className="wev-main-shell"
        data-collapsed={effectiveDesktopCollapsed ? "true" : "false"}
      >
        <main className="wev-home-contents flex-1">
          <HeroBannerCarousel />
          <DmWithArtistCard
            onSelectArtist={openDmForChip}
            onViewAll={() => openDmArtistList("Recommended")}
          />
          <AdBannerSlot />
          <FeaturedArtistsCard />
        </main>

        <WeverseFooter onOpenCookieSettings={openCookieModal} />
      </div>
    </div>
  );
}
