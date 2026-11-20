"use client";

import Link from "next/link";
import { useState } from "react";
import { BLACK_FRIDAY_POPUP, COOKIE_CATEGORIES } from "./data";
import { ChevronDownIcon, CloseIcon, WeverseWordmarkIcon } from "./icons";

interface BlackFridayModalProps {
  open: boolean;
  onClose: () => void;
  onDismissForever: () => void;
}

export function BlackFridayModal({
  open,
  onClose,
  onDismissForever,
}: BlackFridayModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="2026 Black Friday Promotion"
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/60 px-[24px] py-[24px]"
    >
      <div className="flex w-full max-w-[390px] flex-col items-center">
        <div className="relative w-full overflow-hidden rounded-[16px] bg-[#021329] shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BLACK_FRIDAY_POPUP.image}
            alt="2026 Black Friday Promotion 11.20 - 12.04"
            width={BLACK_FRIDAY_POPUP.width}
            height={BLACK_FRIDAY_POPUP.height}
            className="block h-auto max-h-[74vh] w-full object-cover"
          />
          <Link
            href={BLACK_FRIDAY_POPUP.landingUrl}
            onClick={onClose}
            className="absolute bottom-[20px] left-[20px] right-[20px] flex h-[52px] items-center justify-center rounded-[8px] text-[16px] font-bold leading-[22px] no-underline transition-opacity hover:opacity-90"
            style={{
              backgroundColor: BLACK_FRIDAY_POPUP.buttonColor,
              color: BLACK_FRIDAY_POPUP.buttonTextColor,
            }}
          >
            {BLACK_FRIDAY_POPUP.buttonText}
          </Link>
        </div>

        <div className="mt-[16px] flex items-center justify-center gap-[18px] text-[15px] font-medium leading-[21px] text-white">
          <button
            type="button"
            onClick={onDismissForever}
            className="bg-transparent p-0 text-white hover:underline"
          >
            Don&apos;t show again
          </button>
          <span aria-hidden="true" className="h-[12px] w-[1px] bg-white/30" />
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent p-0 text-white hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface CookieConsentBarProps {
  open: boolean;
  onRefuse: () => void;
  onCustomize: () => void;
  onAcceptAll: () => void;
}

export function CookieConsentBar({
  open,
  onRefuse,
  onCustomize,
  onAcceptAll,
}: CookieConsentBarProps) {
  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[130] w-full bg-[#111111ed]"
    >
      <div className="mx-auto flex min-h-[50px] w-full items-center justify-between gap-[16px] px-[50px] py-[8px] max-[900px]:flex-col max-[900px]:items-start max-[900px]:px-[16px] max-[900px]:py-[12px]">
        <p className="m-0 text-[13px] font-normal leading-[18px] text-[#e4e4e4]">
          Please allow Weverse to collect cookies for a smooth experience with
          auto login!{" "}
          <Link href="/policies/cookie" className="text-[#e4e4e4] underline">
            (More)
          </Link>
        </p>

        <div className="flex shrink-0 flex-wrap items-center">
          <button
            type="button"
            onClick={onRefuse}
            className="mr-[30px] h-[32px] bg-transparent p-0 text-[12px] font-light leading-[14px] text-[#c8c8c8] underline max-[673px]:mr-[14px]"
          >
            Refuse and continue
          </button>
          <button
            type="button"
            onClick={onCustomize}
            className="h-[32px] rounded-[16px] bg-[#3a3a3a] px-[16px] text-[12px] font-bold leading-[14px] tracking-[-0.33px] text-[#e4e4e4] transition-colors hover:bg-[#4a4a4a]"
          >
            Customize
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="ml-[6px] h-[32px] rounded-[16px] bg-[#3a3a3a] px-[16px] text-[12px] font-bold leading-[14px] tracking-[-0.33px] text-[#08ccca] transition-colors hover:bg-[#4a4a4a]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

interface CookieCustomizeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function CookieCustomizeModal({
  open,
  onClose,
  onSave,
}: CookieCustomizeModalProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>("essential");
  const [consents, setConsents] = useState<Record<string, boolean>>({
    analytics: false,
    functional: false,
    advertising: false,
  });

  if (!open) return null;

  const allSelected =
    consents.analytics && consents.functional && consents.advertising;

  const toggleAll = () => {
    const next = !allSelected;
    setConsents({
      analytics: next,
      functional: next,
      advertising: next,
    });
  };

  const handleDisagreeAll = () => {
    setConsents({
      analytics: false,
      functional: false,
      advertising: false,
    });
    onSave();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Consent to Collection of Cookies"
      className="fixed inset-0 z-[140] flex flex-col items-center justify-center bg-black/60 px-[16px] py-[24px]"
    >
      <div className="w-full max-w-[520px] rounded-[14px] bg-white px-[34px] pb-[28px] pt-[30px] shadow-[0_16px_48px_rgba(0,0,0,0.3)] max-[673px]:px-[20px]">
        <h2 className="m-0 text-center text-[20px] font-bold leading-[30px] text-black">
          Consent to Collection of Cookies
        </h2>
        <p className="mb-0 mt-[14px] text-center text-[15px] leading-[23px] text-[#111111]">
          Please allow Weverse to collect cookies for a better experience!
        </p>

        <div className="mt-[22px] flex items-center justify-between border-b border-[#ebedf2] pb-[14px]">
          <label className="flex cursor-pointer items-center gap-[12px] text-[15px] font-medium text-black">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-[18px] w-[18px] rounded-[3px] border border-[#cccccc] accent-[#08ccca]"
            />
            <span>Accept All</span>
          </label>
          <ChevronDownIcon className="h-[16px] w-[16px] text-[#282828]" />
        </div>

        <div className="mt-[8px] max-h-[300px] overflow-y-auto">
          {COOKIE_CATEGORIES.map((category) => {
            const isOpen = expandedKey === category.key;
            const checked = category.required || Boolean(consents[category.key]);
            return (
              <div key={category.key} className="py-[10px]">
                <div className="flex items-center justify-between gap-[12px]">
                  <div className="flex items-center gap-[12px]">
                    {category.required ? (
                      <span
                        aria-label="Essential cookies always active"
                        className="flex h-[18px] w-[18px] items-center justify-center text-[#08ccca]"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 8.2L6.5 11.7L13 4.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setConsents((prev) => ({
                            ...prev,
                            [category.key]: !prev[category.key],
                          }))
                        }
                        aria-label={category.title}
                        className="h-[18px] w-[18px] rounded-[3px] border border-[#cccccc] accent-[#08ccca]"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedKey(isOpen ? null : category.key)
                      }
                      className="bg-transparent p-0 text-left text-[15px] font-medium text-black"
                    >
                      {category.title}
                    </button>
                  </div>

                  <div className="flex items-center gap-[8px]">
                    {category.required && (
                      <span className="text-[13px] font-medium text-[#08ccca]">
                        Required
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedKey(isOpen ? null : category.key)
                      }
                      aria-label={`Toggle ${category.title} description`}
                      aria-expanded={isOpen}
                      className="flex h-[24px] w-[24px] items-center justify-center bg-transparent p-0 text-[#282828]"
                    >
                      <ChevronDownIcon
                        className={`h-[16px] w-[16px] transition-transform ${isOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <p className="mb-0 mt-[10px] max-h-[112px] overflow-y-auto pl-[30px] pr-[8px] text-[13px] leading-[20px] text-[#666666]">
                    {category.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-[24px] grid grid-cols-2 gap-[12px] pt-[8px]">
          <button
            type="button"
            onClick={handleDisagreeAll}
            className="h-[46px] rounded-[8px] bg-white text-[15px] font-bold text-[#111111] transition-colors hover:bg-[#f7f8fa]"
          >
            Disagree All
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-[46px] rounded-[8px] bg-white text-[15px] font-bold text-[#08ccca] transition-colors hover:bg-[#f0fcfc]"
          >
            Save
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-[18px] bg-transparent p-0 text-[15px] font-medium text-white underline"
      >
        Close
      </button>
    </div>
  );
}

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmLogin: (nickname?: string) => void;
}

export function LoginPromptModal({
  open,
  onClose,
  onConfirmLogin,
}: LoginPromptModalProps) {
  const [nickname, setNickname] = useState("Weverse Fan");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmLogin(nickname);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Log in to Weverse"
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 px-[16px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] rounded-[16px] bg-white p-[28px] text-center shadow-[0_16px_48px_rgba(0,0,0,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute right-[14px] top-[14px] flex h-[32px] w-[32px] items-center justify-center rounded-full text-[#666666] hover:bg-black/[0.04]"
        >
          <CloseIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="mx-auto mb-[16px] flex justify-center text-black">
          <WeverseWordmarkIcon className="h-[22px] w-[104px]" />
        </div>
        <h2 className="m-0 text-[18px] font-bold leading-[24px] text-black">
          Log in and connect with your artists!
        </h2>
        <p className="mb-0 mt-[8px] text-[13px] leading-[19px] text-[#666666]">
          Sign in locally to unlock My Communities, 350 Jelly balance, fan
          posts, comments, and live interactive Weverse DM chat.
        </p>

        <form onSubmit={handleSubmit} className="mt-[20px] text-left">
          <label
            htmlFor="weverse-demo-nickname"
            className="block text-[12px] font-semibold text-[#484848]"
          >
            Nickname
          </label>
          <input
            id="weverse-demo-nickname"
            name="demoNickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your fan nickname"
            className="mt-[6px] h-[42px] w-full rounded-[8px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
          />

          <div className="mt-[18px] flex flex-col gap-[8px]">
            <button
              type="submit"
              className="flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#00cbd5] text-[14px] font-bold text-white transition-colors hover:bg-[#00b8c1]"
            >
              Sign In to Weverse
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] w-full rounded-[8px] border border-[#ebedf2] bg-white text-[14px] font-medium text-[#484848] hover:bg-[#f7f8fa]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
