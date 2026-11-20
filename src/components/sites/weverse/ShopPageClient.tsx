"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LOCAL_SHOP_ITEMS } from "./community-data";
import {
  CloseIcon,
  DmMessageIcon,
  MenuIcon,
  ShoppingBagIcon,
  WeverseMarkSquareIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "black-friday", label: "BLACK FRIDAY" },
  { key: "illit", label: "ILLIT" },
  { key: "seventeen", label: "SEVENTEEN" },
  { key: "boynextdoor", label: "BOYNEXTDOOR" },
  { key: "tws", label: "TWS" },
  { key: "bts", label: "BTS" },
  { key: "p1harmony", label: "P1Harmony" },
  { key: "marklee", label: "Mark Lee" },
];

export function ShopPageClient() {
  const searchParams = useSearchParams();
  const initialArtist = searchParams.get("artist");
  const initialPromo = searchParams.get("promo");

  const {
    cart,
    addToCart,
    updateCartQty,
    clearCart,
    openDmHome,
    openCookieModal,
    showToast,
  } = useWeverseApp();

  const [selectedFilter, setSelectedFilter] = useState<string>(
    initialPromo === "black-friday"
      ? "black-friday"
      : initialArtist?.toLowerCase() ?? "all"
  );
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (selectedFilter === "all") return LOCAL_SHOP_ITEMS;
    if (selectedFilter === "black-friday") {
      return LOCAL_SHOP_ITEMS.filter(
        (item) =>
          item.badges.includes("BLACK FRIDAY") ||
          item.badges.includes("PRE-ORDER") ||
          item.badges.includes("EXCLUSIVE")
      );
    }
    return LOCAL_SHOP_ITEMS.filter(
      (item) => item.artistSlug.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [selectedFilter]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.priceUsd * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;
    clearCart();
    setBagOpen(false);
    showToast("Demo order placed! Thank you for shopping on Weverse Shop.");
  };

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
            Weverse Shop
          </strong>
        </div>

        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={() => setBagOpen(true)}
            aria-label="Open shopping bag"
            className="relative flex h-[40px] items-center gap-[6px] rounded-full border border-black/10 bg-white px-[14px] text-[13px] font-bold text-black hover:bg-[#f7f8fa]"
          >
            <ShoppingBagIcon className="h-[18px] w-[18px]" />
            <span>Bag</span>
            {cartCount > 0 && (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#00cbd5] px-[5px] text-[11px] font-extrabold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={openDmHome}
            aria-label="Open Weverse DM"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] text-black hover:bg-black/[0.04]"
          >
            <DmMessageIcon className="h-[24px] w-[24px]" />
          </button>
        </div>
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
        <main className="mx-auto max-w-[1100px] px-[20px] pb-[64px] pt-[24px] max-[673px]:px-[16px]">
          {/* Black Friday / Official Shop Promo Hero */}
          <section className="relative overflow-hidden rounded-[20px] bg-[#021329] p-[28px] text-white max-[673px]:p-[20px]">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-[20px]">
              <div className="max-w-[540px]">
                <span className="inline-flex rounded-full bg-[#00cbd5] px-[10px] py-[4px] text-[11px] font-extrabold text-[#021329]">
                  2026 BLACK FRIDAY · UP TO 90% OFF
                </span>
                <h1 className="mb-0 mt-[12px] text-[30px] font-extrabold leading-[36px] tracking-[-0.02em] max-[673px]:text-[22px] max-[673px]:leading-[28px]">
                  Official Artist Merch &amp; 2027 Season&apos;s Greetings
                </h1>
                <p className="mb-0 mt-[8px] text-[14px] leading-[21px] text-white/80">
                  Browse exclusive pre-orders, tour hoodies, and winter fairy
                  merch right inside the local Weverse Shop.
                </p>
              </div>
              <div className="flex items-center gap-[10px]">
                <Link
                  href="/notice/black-friday-2026"
                  className="inline-flex h-[40px] items-center rounded-full border border-white/25 bg-white/10 px-[18px] text-[13px] font-bold text-white no-underline hover:bg-white/20"
                >
                  Campaign Details
                </Link>
                <button
                  type="button"
                  onClick={() => setBagOpen(true)}
                  className="inline-flex h-[40px] items-center rounded-full bg-[#00cbd5] px-[18px] text-[13px] font-bold text-white hover:bg-[#00b8c1]"
                >
                  View Bag ({cartCount})
                </button>
              </div>
            </div>
          </section>

          {/* Artist Filter Strip */}
          <div className="wev-no-scrollbar mt-[22px] flex items-center gap-[8px] overflow-x-auto pb-[6px]">
            {FILTER_OPTIONS.map((opt) => {
              const active = selectedFilter === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedFilter(opt.key)}
                  className={`h-[36px] shrink-0 rounded-full px-[16px] text-[13px] font-bold transition-colors ${
                    active
                      ? "bg-black text-white"
                      : "bg-[#f7f8fa] text-[#484848] hover:bg-[#ebedf2]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          <div className="mt-[20px] grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="wev-community-card flex flex-col overflow-hidden"
              >
                <div className="aspect-square overflow-hidden bg-[#f7f8fa]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-[16px]">
                  <div className="flex items-center justify-between gap-[8px]">
                    <Link
                      href={`/${item.artistSlug}`}
                      className="text-[11px] font-extrabold uppercase tracking-wide text-[#00b8c1] no-underline hover:underline"
                    >
                      {item.artistName}
                    </Link>
                    <div className="flex flex-wrap gap-[4px]">
                      {item.badges.slice(0, 2).map((badge) => (
                        <span
                          key={badge}
                          className={`inline-flex h-[17px] items-center rounded-[3px] px-[5px] text-[9px] font-bold ${
                            badge === "BLACK FRIDAY"
                              ? "bg-black text-[#00cbd5]"
                              : badge === "EXCLUSIVE"
                                ? "bg-[#dffafb] text-[#009ba3]"
                                : "bg-[#edf3ff] text-[#4070f4]"
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <strong className="mt-[6px] text-[15px] font-bold leading-[21px] text-black">
                    {item.name}
                  </strong>
                  <p className="mb-0 mt-[6px] line-clamp-2 text-[12px] leading-[18px] text-[#666666]">
                    {item.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-[16px]">
                    <span className="text-[17px] font-extrabold text-black">
                      ${item.priceUsd.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          artistName: item.artistName,
                          priceUsd: item.priceUsd,
                          image: item.image,
                        })
                      }
                      className="inline-flex h-[36px] items-center gap-[6px] rounded-full bg-black px-[16px] text-[12px] font-bold text-white transition-colors hover:bg-[#00cbd5]"
                    >
                      <ShoppingBagIcon className="h-[14px] w-[14px]" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        <WeverseFooter onOpenCookieSettings={openCookieModal} />
      </div>

      {/* Interactive Shopping Bag Slide-Over Drawer */}
      {bagOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag"
          className="fixed inset-0 z-[150] flex justify-end bg-black/40"
          onClick={() => setBagOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-[400px] flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.16)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[56px] items-center justify-between border-b border-black/[0.06] px-[20px]">
              <strong className="text-[17px] font-extrabold text-black">
                Shopping Bag ({cartCount})
              </strong>
              <button
                type="button"
                onClick={() => setBagOpen(false)}
                aria-label="Close bag"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-black hover:bg-black/[0.04]"
              >
                <CloseIcon className="h-[20px] w-[20px]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
              {cart.length === 0 ? (
                <div className="py-[56px] text-center">
                  <p className="m-0 text-[14px] font-medium text-[#8e8e8e]">
                    Your shopping bag is currently empty.
                  </p>
                </div>
              ) : (
                <ul className="m-0 list-none divide-y divide-black/[0.05] p-0">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-[12px] py-[14px]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-[64px] w-[64px] shrink-0 rounded-[10px] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-[#8e8e8e]">
                          {item.artistName}
                        </span>
                        <strong className="line-clamp-2 text-[13px] font-bold leading-[18px] text-black">
                          {item.name}
                        </strong>
                        <div className="mt-[8px] flex items-center justify-between">
                          <span className="text-[14px] font-extrabold text-black">
                            ${(item.priceUsd * item.quantity).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-[8px] rounded-full border border-black/10 px-[8px] py-[2px]">
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="bg-transparent px-[4px] text-[14px] font-bold text-black"
                            >
                              −
                            </button>
                            <span className="text-[12px] font-bold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, 1)}
                              aria-label="Increase quantity"
                              className="bg-transparent px-[4px] text-[14px] font-bold text-black"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-black/[0.06] p-[20px]">
              <div className="mb-[14px] flex items-center justify-between text-[15px]">
                <span className="font-semibold text-[#666666]">Subtotal</span>
                <strong className="text-[18px] font-extrabold text-black">
                  ${subtotal.toFixed(2)}
                </strong>
              </div>
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="h-[48px] w-full rounded-full bg-[#00cbd5] text-[15px] font-extrabold text-white transition-colors hover:bg-[#00b8c1] disabled:opacity-40"
              >
                Complete Demo Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
