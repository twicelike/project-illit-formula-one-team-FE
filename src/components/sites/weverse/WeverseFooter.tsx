"use client";

import Link from "next/link";
import { useState } from "react";
import { FOOTER_LEGAL_LINKS } from "./data";
import {
  ChevronDownIcon,
  SocialInstagramIcon,
  SocialTiktokIcon,
  SocialWeiboIcon,
  SocialXIcon,
  SocialYoutubeIcon,
} from "./icons";

interface WeverseFooterProps {
  onOpenCookieSettings: () => void;
}

export function WeverseFooter({ onOpenCookieSettings }: WeverseFooterProps) {
  const [mobileBizOpen, setMobileBizOpen] = useState(true);

  return (
    <footer className="mx-auto mt-[32px] w-full max-w-[1100px] border-t border-black/[0.04] px-[20px] pb-[28px] pt-[40px] max-[673px]:mt-[20px] max-[673px]:px-[16px] max-[673px]:pt-[28px]">
      {/* Legal Links */}
      <ul className="m-0 flex list-none flex-wrap items-center gap-x-[16px] gap-y-[6px] p-0">
        {FOOTER_LEGAL_LINKS.map((item) => (
          <li key={item.label}>
            {"isCookieSettings" in item && item.isCookieSettings ? (
              <button
                type="button"
                onClick={onOpenCookieSettings}
                className="bg-transparent p-0 text-[13px] font-normal leading-[17px] text-[#111111] hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <Link
                href={item.href}
                className={`text-[13px] leading-[17px] text-[#111111] no-underline hover:underline ${item.bold ? "font-bold" : "font-normal"
                  }`}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {/* Mobile Collapsible Business Info Header */}
      <div className="wev-footer-mobile-toggle mt-[20px]">
        <button
          type="button"
          aria-pressed={mobileBizOpen}
          onClick={() => setMobileBizOpen((prev) => !prev)}
          className="flex items-center gap-[6px] bg-transparent p-0 text-[13px] font-bold leading-[18px] text-[#767676]"
        >
          <span>Weverse Company Business Info</span>
          <ChevronDownIcon
            className={`h-[14px] w-[14px] text-[#8e8e8e] transition-transform duration-150 ${mobileBizOpen ? "rotate-180" : ""
              }`}
          />
        </button>
        <div className="mt-[6px] text-[12px] leading-[16px] text-[#8e8e8e]">
          <strong className="mr-[6px] font-bold text-[#767676]">Tel.</strong>
          <span>1544-0790 (Only available in South Korea)</span>
        </div>
      </div>

      {/* Company Info Definition List — inline flow so mobile wraps cleanly with trailing dividers matching live weverse.io */}
      <div
        className="wev-footer-desktop-dl mt-[20px] max-[673px]:mt-[12px]"
        data-mobile-open={mobileBizOpen ? "true" : "false"}
      >
        <dl className="m-0 space-y-[6px] text-[12px] leading-[18px] text-[#8e8e8e]">
          <div className="block">
            <span className="inline">
              <dt className="mr-[6px] inline font-bold text-[#767676]">
                Company Name
              </dt>
              <dd className="m-0 inline">Weverse Company Inc.</dd>
              <span
                aria-hidden="true"
                className="mx-[10px] inline-block h-[11px] w-[1px] bg-[#dcdee4] align-middle"
              />
            </span>
            <span className="inline">
              <dt className="mr-[6px] inline font-bold text-[#767676]">CEO</dt>
              <dd className="m-0 inline">Yang Zooil</dd>
              <span
                aria-hidden="true"
                className="mx-[10px] inline-block h-[11px] w-[1px] bg-[#dcdee4] align-middle max-[673px]:hidden"
              />
            </span>
            <span className="inline max-[673px]:hidden">
              <dt className="mr-[6px] inline font-bold text-[#767676]">Tel.</dt>
              <dd className="m-0 inline">
                1544-0790 (Only available in South Korea)
              </dd>
              <span
                aria-hidden="true"
                className="mx-[10px] inline-block h-[11px] w-[1px] bg-[#dcdee4] align-middle"
              />
            </span>
            <span className="inline max-[673px]:mt-[4px] max-[673px]:inline-block">
              <dt className="mr-[6px] inline font-bold text-[#767676]">Fax</dt>
              <dd className="m-0 inline">+82 2-2144-9399</dd>
              <span
                aria-hidden="true"
                className="mx-[10px] inline-block h-[11px] w-[1px] bg-[#dcdee4] align-middle"
              />
            </span>
            <span className="inline">
              <dt className="mr-[6px] inline font-bold text-[#767676]">
                E-mail
              </dt>
              <dd className="m-0 inline">ussupport@weverse.io</dd>
            </span>
          </div>

          <div className="block">
            <span className="inline">
              <dt className="mr-[6px] inline font-bold text-[#767676]">
                Address
              </dt>
              <dd className="m-0 inline">
                C, 6F, PangyoTech-one Tower, 131, Bundangnaegok-ro, Bundang-gu,
                Seongnam-si, Gyeonggi-do, Republic of Korea
              </dd>
              <span
                aria-hidden="true"
                className="mx-[10px] inline-block h-[11px] w-[1px] bg-[#dcdee4] align-middle"
              />
            </span>
            <span className="inline max-[673px]:mt-[4px] max-[673px]:inline-block">
              <dt className="mr-[6px] inline font-bold text-[#767676]">
                Business Registration No.
              </dt>
              <dd className="m-0 inline">
                <span>716-87-01158</span>{" "}
                <Link
                  href="/policies/business"
                  className="inline-flex h-[18px] items-center rounded-[3px] border border-[#5989fe]/40 px-[5px] align-middle text-[9px] font-bold leading-[12px] text-[#5989fe] no-underline hover:bg-[#edf3ff]"
                >
                  Business Registration
                </Link>
              </dd>
            </span>
          </div>

          <div className="block">
            <span className="inline">
              <dt className="mr-[6px] inline font-bold text-[#767676]">
                Mail Order Business Registration No.
              </dt>
              <dd className="m-0 inline">2022-SeongnamBundangA-0557</dd>
              <span
                aria-hidden="true"
                className="mx-[10px] inline-block h-[11px] w-[1px] bg-[#dcdee4] align-middle"
              />
            </span>
            <span className="inline max-[673px]:mt-[4px] max-[673px]:inline-block">
              <dt className="mr-[6px] inline font-bold text-[#767676]">
                Hosted by
              </dt>
              <dd className="m-0 inline">
                Amazon Web Services, Inc. and NAVER Cloud
              </dd>
            </span>
          </div>
        </dl>
      </div>

      {/* E-Commerce Intermediary Disclaimer */}
      <p className="mb-0 mt-[14px] text-[12px] leading-[17px] text-[#8e8e8e]">
        Some products on Weverse Shop are offered by individual third-party
        sellers. In such cases, Weverse Company Inc. acts solely as an
        e-commerce intermediary and is not a party to the transaction. Weverse
        Company Inc. assumes no responsibility for the product information or
        any transactions conducted by the individual sellers.
      </p>

      {/* SNS Links */}
      <div className="wev-footer-sns-row mt-[22px]">
        <div className="wev-footer-sns-group">
          <span className="text-[12px] font-bold leading-[16px] text-[#767676]">
            Weverse SNS
          </span>
          <div className="flex items-center gap-[14px]">
            <Link
              href="/policies/sns?channel=weverse-x"
              aria-label="Weverse X"
              className="text-[#8e8e8e] transition-colors hover:text-black"
            >
              <SocialXIcon className="h-[20px] w-[20px]" />
            </Link>
            <Link
              href="/policies/sns?channel=weverse-instagram"
              aria-label="Weverse Instagram"
              className="transition-opacity hover:opacity-80"
            >
              <SocialInstagramIcon
                gradientId="wev-ig-main"
                className="h-[20px] w-[20px]"
              />
            </Link>
            <Link
              href="/policies/sns?channel=weverse-youtube"
              aria-label="Weverse YouTube"
              className="transition-opacity hover:opacity-80"
            >
              <SocialYoutubeIcon className="h-[20px] w-[20px]" />
            </Link>
            <Link
              href="/policies/sns?channel=weverse-tiktok"
              aria-label="Weverse TikTok"
              className="text-[#8e8e8e] transition-colors hover:text-black"
            >
              <SocialTiktokIcon className="h-[20px] w-[20px]" />
            </Link>
          </div>
        </div>

        <div className="wev-footer-sns-group">
          <span className="text-[12px] font-bold leading-[16px] text-[#767676]">
            Weverse Shop SNS
          </span>
          <div className="flex items-center gap-[14px]">
            <Link
              href="/policies/sns?channel=shop-x"
              aria-label="Weverse Shop X"
              className="text-[#8e8e8e] transition-colors hover:text-black"
            >
              <SocialXIcon className="h-[20px] w-[20px]" />
            </Link>
            <Link
              href="/policies/sns?channel=shop-instagram"
              aria-label="Weverse Shop Instagram"
              className="transition-opacity hover:opacity-80"
            >
              <SocialInstagramIcon
                gradientId="wev-ig-shop"
                className="h-[20px] w-[20px]"
              />
            </Link>
            <Link
              href="/policies/sns?channel=shop-weibo"
              aria-label="Weverse Shop Weibo"
              className="text-[#8e8e8e] transition-colors hover:text-black"
            >
              <SocialWeiboIcon className="h-[20px] w-[20px]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-[22px] border-t border-black/[0.04] pt-[16px] text-[12px] leading-[16px] text-[#8e8e8e]">
        © 2026 Weverse Company Inc. or its affiliates (Weverse Japan Inc. &amp;
        Weverse America Inc.) all rights reserved.
      </div>
    </footer>
  );
}
