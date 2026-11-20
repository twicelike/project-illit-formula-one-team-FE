"use client";

import Link from "next/link";
import { FEATURED_ARTISTS } from "./data";
import {
  AddCommunityIcon,
  CloseIcon,
  ExternalLinkIcon,
  JellySquircleIcon,
  ShopSquircleIcon,
  WeverseWordmarkIcon,
} from "./icons";
import { useWeverseApp } from "./WeverseAppProvider";

interface WeverseGlobalMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

const SIDEBAR_RECOMMENDED = FEATURED_ARTISTS.slice(0, 4);

export function WeverseGlobalMenuDrawer({
  open,
  onClose,
  onOpenSearch,
}: WeverseGlobalMenuDrawerProps) {
  const { user, logoutDemo, openLoginModal, joinedSlugs, cart } =
    useWeverseApp();

  if (!open) return null;

  const joinedArtists = joinedSlugs
    .map((slug) => FEATURED_ARTISTS.find((a) => a.slug === slug))
    .filter((a): a is (typeof FEATURED_ARTISTS)[number] => Boolean(a));

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[199]">
      <div
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        aria-label="Global Navigation Drawer"
        className="relative z-10 flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-[8px_0_28px_rgba(0,0,0,0.16)]"
      >
        <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-black/[0.04] px-[16px]">
          <Link
            href="/"
            onClick={onClose}
            aria-label="Weverse Home"
            className="flex items-center text-black no-underline"
          >
            <WeverseWordmarkIcon className="h-[20px] w-[95px]" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] text-black hover:bg-black/[0.04]"
          >
            <CloseIcon className="h-[22px] w-[22px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[16px] pb-[40px] pt-[12px]">
          {/* Auth / Profile Block */}
          <div className="pb-[16px]">
            {user ? (
              <div className="rounded-[12px] bg-[#f7f8fa] p-[12px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <div className="flex min-w-0 items-center gap-[10px]">
                    <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#00cbd5] text-[15px] font-extrabold text-white">
                      {user.nickname.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-[14px] font-bold leading-[18px] text-black">
                        {user.nickname}
                      </strong>
                      <span className="block truncate text-[11px] text-[#8e8e8e]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logoutDemo}
                    className="shrink-0 rounded-[6px] border border-black/10 bg-white px-[8px] py-[4px] text-[11px] font-semibold text-[#666666] hover:bg-black/[0.04]"
                  >
                    Sign out
                  </button>
                </div>

                <Link
                  href="/jelly"
                  onClick={onClose}
                  className="mt-[10px] flex items-center justify-between rounded-[8px] bg-white px-[10px] py-[8px] text-[12px] font-bold text-black no-underline shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:bg-[#dffafb]/40"
                >
                  <span className="flex items-center gap-[6px] text-[#484848]">
                    <JellySquircleIcon className="h-[18px] w-[18px] text-[#00cbd5]" />
                    <span>My Jelly</span>
                  </span>
                  <span className="text-[#00b8c1]">{user.jellyBalance} J →</span>
                </Link>
              </div>
            ) : (
              <>
                <p className="m-0 text-[14px] font-medium leading-[19px] text-[#8e8e8e]">
                  Log in and
                  <br />
                  connect with your artists!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openLoginModal();
                  }}
                  className="mt-[12px] inline-flex h-[36px] items-center justify-center rounded-[8px] border border-[#00cbd5] bg-white px-[18px] text-[14px] font-bold leading-[18px] text-[#00b8c1] hover:bg-[#dffafb]/40"
                >
                  Login
                </button>
              </>
            )}
          </div>

          {/* My Communities when signed in */}
          {user && joinedArtists.length > 0 && (
            <div className="border-t border-black/[0.04] py-[14px]">
              <strong className="mb-[8px] block text-[13px] font-semibold leading-[18px] text-[#8e8e8e]">
                My Communities ({joinedArtists.length})
              </strong>
              <ul className="m-0 list-none space-y-[4px] p-0">
                {joinedArtists.map((artist) => (
                  <li key={artist.id}>
                    <Link
                      href={`/${artist.slug}`}
                      onClick={onClose}
                      className="flex h-[42px] items-center gap-[12px] rounded-[8px] px-[6px] text-[15px] font-medium text-black no-underline hover:bg-black/[0.04]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={artist.logoImage}
                        alt={artist.name}
                        width={24}
                        height={24}
                        className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
                      />
                      <span className="truncate">{artist.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended */}
          <div className="border-t border-black/[0.04] py-[14px]">
            <strong className="mb-[8px] block text-[13px] font-semibold leading-[18px] text-[#8e8e8e]">
              Recommended
            </strong>
            <ul className="m-0 list-none space-y-[4px] p-0">
              {onOpenSearch && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSearch();
                    }}
                    className="flex h-[42px] w-full items-center gap-[12px] rounded-[8px] px-[6px] text-left text-[15px] font-medium text-black hover:bg-black/[0.04]"
                  >
                    <AddCommunityIcon className="h-[24px] w-[24px] shrink-0" />
                    <span>Search Communities</span>
                  </button>
                </li>
              )}
              {SIDEBAR_RECOMMENDED.map((artist) => (
                <li key={artist.id}>
                  <Link
                    href={`/${artist.slug}`}
                    onClick={onClose}
                    className="flex h-[42px] items-center gap-[12px] rounded-[8px] px-[6px] text-[15px] font-medium text-black no-underline hover:bg-black/[0.04]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artist.logoImage}
                      alt={artist.name}
                      width={24}
                      height={24}
                      className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
                    />
                    <span className="truncate">{artist.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Go to Service */}
          <div className="border-t border-black/[0.04] pt-[14px]">
            <strong className="mb-[8px] block text-[13px] font-semibold leading-[18px] text-[#8e8e8e]">
              Go to Service
            </strong>
            <ul className="m-0 list-none space-y-[4px] p-0">
              <li>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="wev-sidebar-service-link flex h-[44px] items-center justify-between rounded-[8px] px-[6px] text-[15px] font-medium text-black no-underline"
                >
                  <span className="flex items-center gap-[12px]">
                    <ShopSquircleIcon className="wev-service-icon h-[24px] w-[24px] text-[#666666]" />
                    <span>Shop</span>
                  </span>
                  {cartCount > 0 ? (
                    <span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#00cbd5] px-[6px] text-[11px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : (
                    <ExternalLinkIcon className="wev-external-icon h-[18px] w-[18px] text-[#cccccc]" />
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/jelly"
                  onClick={onClose}
                  className="wev-sidebar-service-link flex h-[44px] items-center justify-between rounded-[8px] px-[6px] text-[15px] font-medium text-black no-underline"
                >
                  <span className="flex items-center gap-[12px]">
                    <JellySquircleIcon className="wev-service-icon h-[24px] w-[24px] text-[#666666]" />
                    <span>Jelly Shop</span>
                  </span>
                  <ExternalLinkIcon className="wev-external-icon h-[18px] w-[18px] text-[#cccccc]" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
