import Link from "next/link";

export function AdBannerSlot() {
  return (
    <div className="wev-ad-container" aria-label="Advertisement">
      <Link
        href="/shop?promo=black-friday"
        className="wev-ad-frame relative flex items-center justify-between border border-[#e6e8ec] bg-white px-[16px] text-black no-underline transition-colors hover:border-[#d5d8de]"
      >
        {/* Subtle static AdChoices indicator matching observed desktop/tablet/mobile banner geometry */}
        <span
          aria-hidden="true"
          className="absolute left-[2px] top-[2px] flex flex-col items-center gap-[2px] text-[#00aecd]"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2L10 6L2 10V2Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <div className="flex min-w-0 flex-col justify-center pl-[6px]">
          <span className="text-[11px] font-normal leading-[14px] text-[#8e8e8e] max-[673px]:text-[10px]">
            TikTok
          </span>
          <span className="truncate text-[22px] font-normal leading-[28px] tracking-[-0.02em] text-[#333333] max-[1023px]:text-[17px] max-[1023px]:leading-[21px] max-[673px]:text-[14px] max-[673px]:leading-[18px]">
            No Pixel Required
          </span>
        </div>

        <span className="inline-flex h-[40px] shrink-0 items-center gap-[6px] rounded-full bg-black px-[24px] text-[13px] font-semibold tracking-[0.02em] text-white max-[1023px]:h-[32px] max-[1023px]:px-[16px] max-[1023px]:text-[11px] max-[673px]:h-[28px] max-[673px]:px-[14px] max-[673px]:text-[11px]">
          <span>SIGN UP</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 2L8 6L4 10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}

