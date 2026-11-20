"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  SocialInstagramIcon,
  SocialTiktokIcon,
  SocialWeiboIcon,
  SocialXIcon,
  SocialYoutubeIcon,
  WeverseWordmarkIcon,
} from "./icons";
import { useWeverseApp } from "./WeverseAppProvider";

interface PolicySection {
  id: string;
  title: string;
  body: string[];
  easySummary: string;
}

interface PolicyDoc {
  slug: string;
  shortLabel: string;
  title: string;
  effectiveDate: string;
  intro: string;
  easyIntro: string;
  sections: PolicySection[];
}

const POLICY_DOCS: Record<string, PolicyDoc> = {
  privacy: {
    slug: "privacy",
    shortLabel: "Privacy Policy",
    title: "Weverse Company Privacy Policy",
    effectiveDate: "Effective Date: October 15, 2026",
    intro:
      "Weverse Company Inc. ('Weverse', 'we', or 'us') respects the privacy of all global fandom members and complies with applicable data protection laws across Korea, the EU/UK, the United States, and Japan.",
    easyIntro:
      "Quick Overview: We only collect the details needed to keep your Weverse communities, DM chats, and Shop orders running safely — and you stay in full control of your preferences.",
    sections: [
      {
        id: "sec-1",
        title: "1. Personal Information Collected & Methods",
        easySummary:
          "Account email, chosen nickname, community memberships, and optional shipping details when you order merch.",
        body: [
          "We collect account registration details (email address, nickname, preferred language), service activity logs (joined communities, posts, likes, comments), and order fulfillment information when you purchase goods or Jelly.",
          "Device identifiers and cookie preferences are processed only in accordance with your Cookie Settings.",
        ],
      },
      {
        id: "sec-2",
        title: "2. Purpose of Processing Personal Information",
        easySummary:
          "Delivering community feeds, Weverse LIVE notifications, Weverse DM messaging, and merch delivery.",
        body: [
          "Personal information is used strictly to authenticate your account, personalize community feeds, process Weverse DM subscriptions and Shop orders, prevent spam or unauthorized access, and provide customer support.",
        ],
      },
      {
        id: "sec-3",
        title: "3. Retention & Destruction Period",
        easySummary:
          "Kept only while your account is active or as required for e-commerce order records.",
        body: [
          "Data is promptly deleted when an account is closed or when the collection purpose is fulfilled, except where statutory retention applies for consumer transaction records (up to 5 years under e-commerce statutes).",
        ],
      },
      {
        id: "sec-4",
        title: "4. Provision to Third Parties & Outsourcing",
        easySummary:
          "Shared only with logistics carriers and payment processors required to deliver your orders.",
        body: [
          "Weverse does not sell your personal information. Cloud hosting is operated on Amazon Web Services, Inc. and NAVER Cloud under strict encryption and access-control agreements.",
        ],
      },
      {
        id: "sec-5",
        title: "5. Rights of Users & Legal Representatives",
        easySummary:
          "View, update, export, or delete your account and adjust cookie preferences at any time.",
        body: [
          "You may inspect, modify, or request deletion of your personal information at any time through Account Settings or Cookie Settings, and withdraw optional marketing consent immediately.",
        ],
      },
      {
        id: "sec-6",
        title: "6. Contact & Privacy Protection Officer",
        easySummary:
          "Reach our dedicated privacy team anytime at privacy@weverse.io or ussupport@weverse.io.",
        body: [
          "Company Name: Weverse Company Inc. (C, 6F, PangyoTech-one Tower, 131, Bundangnaegok-ro, Bundang-gu, Seongnam-si, Gyeonggi-do, Republic of Korea).",
          "Support E-mail: ussupport@weverse.io | Tel: 1544-0790 (South Korea).",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    shortLabel: "Terms and Conditions",
    title: "Weverse Terms and Conditions",
    effectiveDate: "Effective Date: October 15, 2026",
    intro:
      "These Terms and Conditions govern your access to and use of Weverse communities, LIVE broadcasts, Media, Fan Letters, Weverse DM, and integrated fan services.",
    easyIntro:
      "Quick Overview: Treat artists and fellow fans with respect, keep your account credentials safe, and enjoy official Weverse features responsibly.",
    sections: [
      {
        id: "sec-1",
        title: "1. Purpose & Definitions",
        easySummary:
          "Explains the relationship between Weverse Company Inc. and registered community members.",
        body: [
          "These terms establish rights, obligations, and responsibilities between Weverse Company Inc. and members using Weverse web and mobile services.",
        ],
      },
      {
        id: "sec-2",
        title: "2. Account Registration & Membership",
        easySummary:
          "One Weverse Account gives you unified access to communities, Shop, and Jelly.",
        body: [
          "Members agree to provide accurate registration information and maintain account security. Individual communities may offer optional official fanclub memberships.",
        ],
      },
      {
        id: "sec-3",
        title: "3. Intellectual Property & Content Rights",
        easySummary:
          "You own your fan posts; artist photos, videos, and LIVE replays belong to their respective rights holders.",
        body: [
          "Copyright of artist posts, official videos, LIVE streams, and exclusive Weverse DM media remains with the artist label and Weverse Company Inc. Unauthorized commercial redistribution is prohibited.",
        ],
      },
    ],
  },
  service: {
    slug: "service",
    shortLabel: "Service Operation Policy",
    title: "Weverse Service Operation Policy",
    effectiveDate: "Effective Date: October 15, 2026",
    intro:
      "Our Service Operation Policy protects a safe, welcoming fandom culture across every artist community on Weverse.",
    easyIntro:
      "Quick Overview: No spam, harassment, impersonation, or unauthorized paid-content leaks.",
    sections: [
      {
        id: "sec-1",
        title: "1. Community Etiquette & Prohibited Content",
        easySummary:
          "Keep posts constructive and respectful toward artists and other fans.",
        body: [
          "Posts or comments containing hate speech, impersonation, personal data exposure (doxxing), spam bots, or illegal promotions may be removed without prior notice.",
        ],
      },
      {
        id: "sec-2",
        title: "2. Reporting & Moderation Process",
        easySummary:
          "Automated safeguards and 24/7 review teams evaluate community reports.",
        body: [
          "Members can report abusive posts or comments. Repeated violations may result in temporary posting restrictions or permanent community suspension.",
        ],
      },
    ],
  },
  paid: {
    slug: "paid",
    shortLabel: "Paid Services Terms",
    title: "Paid Services Terms and Conditions",
    effectiveDate: "Effective Date: October 15, 2026",
    intro:
      "Applies to digital purchases including Weverse Jelly, Weverse DM subscriptions, paid VOD packages, and digital memberships.",
    easyIntro:
      "Quick Overview: Transparent pricing, clear refund windows for unused Jelly/VOD, and easy subscription management.",
    sections: [
      {
        id: "sec-1",
        title: "1. Jelly Recharge & Usage",
        easySummary:
          "Jelly can be used for Weverse DM subscriptions, digital media, and eligible fan perks.",
        body: [
          "Paid Jelly may be refunded within 7 days of purchase if unused. Bonus promotional Jelly granted during events is non-refundable.",
        ],
      },
      {
        id: "sec-2",
        title: "2. Recurring Subscriptions (Weverse DM)",
        easySummary:
          "Cancel anytime before the next billing date to stop automatic renewal.",
        body: [
          "Weverse DM subscriptions renew monthly unless cancelled at least 24 hours prior to the renewal timestamp.",
        ],
      },
    ],
  },
  cookie: {
    slug: "cookie",
    shortLabel: "Cookie Policy",
    title: "Weverse Cookie Policy",
    effectiveDate: "Effective Date: October 15, 2026",
    intro:
      "Learn how Weverse uses essential, analytics, functional, and advertising cookies to improve your browsing experience.",
    easyIntro:
      "Quick Overview: Essential cookies keep login & bag working; all other cookie categories are optional and editable anytime.",
    sections: [
      {
        id: "sec-1",
        title: "1. Essential Cookies",
        easySummary:
          "Always active so sign-in, security, and shopping bag work.",
        body: [
          "Strictly necessary to deliver core navigation, login persistence, and shopping basket state.",
        ],
      },
      {
        id: "sec-2",
        title: "2. Managing Your Cookie Preferences",
        easySummary:
          "Use the Cookie Settings modal anytime to toggle non-essential categories.",
        body: [
          "You may update or withdraw consent for analytics, functionality, and advertising cookies at any moment using the Cookie Settings button below.",
        ],
      },
    ],
  },
  join: {
    slug: "join",
    shortLabel: "Join Weverse",
    title: "Partner & Join Weverse",
    effectiveDate: "Weverse Artist & Label Onboarding",
    intro:
      "Weverse connects global artists, labels, and fans in 245+ countries and territories through Communities, LIVE, Weverse DM, and Weverse Shop.",
    easyIntro:
      "Quick Overview: Everything labels and artists need to launch an official community, live streaming channel, and global merch storefront.",
    sections: [
      {
        id: "sec-1",
        title: "1. Official Artist Communities & LIVE",
        easySummary:
          "Real-time artist posts, Fan Feed, Fan Letters, and HD LIVE streaming.",
        body: [
          "Launch a dedicated space with custom artist branding, automated translation across 15+ languages, and ultra-low-latency global LIVE broadcasts.",
        ],
      },
      {
        id: "sec-2",
        title: "2. Commerce & Direct Fan Messaging",
        easySummary:
          "Unified Weverse Shop fulfillment + 1:1 Weverse DM subscriptions.",
        body: [
          "Integrate albums, Season's Greetings, tour pickup merch, and personalized Weverse DM communication inside one seamless platform.",
        ],
      },
    ],
  },
  help: {
    slug: "help",
    shortLabel: "Help Center",
    title: "Weverse Customer Help Center",
    effectiveDate: "24/7 Self-Service FAQ",
    intro:
      "Find instant answers about Weverse communities, Weverse DM chats, Jelly balance, and Weverse Shop orders.",
    easyIntro:
      "Quick Overview: Most common questions answered in seconds — no waiting required.",
    sections: [
      {
        id: "sec-1",
        title: "1. How do I join an artist community?",
        easySummary:
          "Open any artist page from Home or Search Communities and tap 'Join Now'.",
        body: [
          "Once joined, the artist community automatically appears inside your 'My Communities' sidebar for instant one-click access.",
        ],
      },
      {
        id: "sec-2",
        title: "2. How do I start a Weverse DM conversation?",
        easySummary:
          "Click the top-right paper plane icon or any artist chip in 'DM with your Artist!'.",
        body: [
          "Sign in with your demo account, choose any artist from the DM list, and start sending messages immediately inside the bottom-right DM widget.",
        ],
      },
      {
        id: "sec-3",
        title: "3. Where can I recharge Jelly or check my Shop bag?",
        easySummary:
          "Use 'Shop' and 'Jelly Shop' in the left sidebar or menu drawer.",
        body: [
          "Visit /jelly to add Jelly packs to your balance, and visit /shop to browse Black Friday deals, artist merch, and checkout your shopping bag.",
        ],
      },
    ],
  },
  business: {
    slug: "business",
    shortLabel: "Business Registration",
    title: "Weverse Company Business Information",
    effectiveDate: "Verified Corporate Filing Summary",
    intro:
      "Official corporate registration and e-commerce intermediary disclosure for Weverse Company Inc.",
    easyIntro:
      "Quick Overview: Official Korean business registration #716-87-01158 and mail-order permit details.",
    sections: [
      {
        id: "sec-1",
        title: "1. Corporate Entity Details",
        easySummary:
          "Weverse Company Inc. — CEO Yang Zooil, Seongnam-si, South Korea.",
        body: [
          "Company Name: Weverse Company Inc.",
          "CEO: Yang Zooil",
          "Business Registration No.: 716-87-01158",
          "Mail Order Business Registration No.: 2022-SeongnamBundangA-0557",
        ],
      },
      {
        id: "sec-2",
        title: "2. Headquarters & Support Contact",
        easySummary:
          "PangyoTech-one Tower, Bundang-gu | Tel: 1544-0790.",
        body: [
          "Address: C, 6F, PangyoTech-one Tower, 131, Bundangnaegok-ro, Bundang-gu, Seongnam-si, Gyeonggi-do, Republic of Korea",
          "Tel.: 1544-0790 (Only available in South Korea) | Fax: +82 2-2144-9399 | E-mail: ussupport@weverse.io",
          "Hosted by: Amazon Web Services, Inc. and NAVER Cloud",
        ],
      },
    ],
  },
  sns: {
    slug: "sns",
    shortLabel: "Official SNS",
    title: "Official Weverse & Weverse Shop SNS Channels",
    effectiveDate: "Official Verified Handles",
    intro:
      "Stay connected with official Weverse announcements, artist comeback teasers, and Weverse Shop drop schedules.",
    easyIntro:
      "Quick Overview: All 7 verified social handles for Weverse and Weverse Shop.",
    sections: [],
  },
};

const SNS_CHANNELS = [
  {
    key: "weverse-x",
    group: "Weverse SNS",
    platform: "X (Twitter)",
    handle: "@weverseofficial",
    desc: "Real-time community openings, LIVE alerts, and global event announcements.",
  },
  {
    key: "weverse-instagram",
    group: "Weverse SNS",
    platform: "Instagram",
    handle: "@weverseofficial",
    desc: "Behind-the-scenes artist highlights, reels, and Weverse Con Festival updates.",
  },
  {
    key: "weverse-youtube",
    group: "Weverse SNS",
    platform: "YouTube",
    handle: "@Weverse",
    desc: "Official artist greeting videos, trailers, and Weverse Magazine interviews.",
  },
  {
    key: "weverse-tiktok",
    group: "Weverse SNS",
    platform: "TikTok",
    handle: "@weverseofficial",
    desc: "Short-form artist challenges, comeback clips, and fandom moments.",
  },
  {
    key: "shop-x",
    group: "Weverse Shop SNS",
    platform: "X (Twitter)",
    handle: "@weverseshop",
    desc: "Instant pre-order openings, Season's Greetings drops, and Black Friday alerts.",
  },
  {
    key: "shop-instagram",
    group: "Weverse Shop SNS",
    platform: "Instagram",
    handle: "@weverseshop",
    desc: "Product lookbooks, unboxing previews, and official tour merch collections.",
  },
  {
    key: "shop-weibo",
    group: "Weverse Shop SNS",
    platform: "Weibo",
    handle: "@weverseshop",
    desc: "Official merch schedules and regional shipping announcements.",
  },
];

const NAV_SLUGS = [
  "privacy",
  "terms",
  "service",
  "paid",
  "cookie",
  "join",
  "help",
  "business",
  "sns",
];

export function PolicyPageClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const highlightedChannel = searchParams.get("channel");
  const { openCookieModal, showToast } = useWeverseApp();
  const [easyVersion, setEasyVersion] = useState(false);

  const doc = POLICY_DOCS[slug] ?? POLICY_DOCS.privacy;

  const colSize = Math.max(1, Math.ceil(doc.sections.length / 3));
  const tocColumns = [
    doc.sections.slice(0, colSize),
    doc.sections.slice(colSize, colSize * 2),
    doc.sections.slice(colSize * 2),
  ].filter((col) => col.length > 0);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Minimal 57px Policy Header */}
      <header className="sticky top-0 z-[50] flex h-[57px] items-center justify-between border-b border-[#ececec] bg-white px-[24px] max-[673px]:px-[16px]">
        <Link
          href="/"
          aria-label="Weverse Home"
          className="flex items-center text-black no-underline"
        >
          <WeverseWordmarkIcon className="h-[20px] w-[95px]" />
        </Link>

        <Link
          href="/"
          className="inline-flex h-[34px] items-center rounded-full border border-[#e4e4e4] px-[14px] text-[13px] font-semibold text-[#222222] no-underline hover:bg-[#f7f8fa]"
        >
          Back to Weverse
        </Link>
      </header>

      {/* Policy Category Switcher */}
      <div className="border-b border-[#f0f0f0] bg-[#fafafa]">
        <div className="wev-no-scrollbar mx-auto flex max-w-[1220px] items-center gap-[8px] overflow-x-auto px-[24px] py-[12px] min-[900px]:flex-wrap max-[673px]:px-[16px]">
          {NAV_SLUGS.map((key) => {
            const item = POLICY_DOCS[key];
            const active = item.slug === doc.slug;
            return (
              <Link
                key={key}
                href={`/policies/${key}`}
                className={`shrink-0 rounded-full px-[14px] py-[7px] text-[13px] font-semibold no-underline transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "bg-white text-[#484848] shadow-[0_0_0_1px_#e4e4e4_inset] hover:bg-[#f2f3f7]"
                }`}
              >
                {item.shortLabel}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Policy Document Container */}
      <main className="mx-auto max-w-[1220px] px-[24px] pb-[96px] pt-[40px] max-[673px]:px-[16px] max-[673px]:pt-[28px]">
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div>
            <h1 className="m-0 text-[32px] font-black leading-[40px] tracking-[-0.02em] text-black max-[673px]:text-[24px] max-[673px]:leading-[32px]">
              {doc.title}
            </h1>
            <p className="mb-0 mt-[8px] text-[13px] text-[#8e8e8e]">
              {doc.effectiveDate}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEasyVersion((prev) => !prev)}
            className="inline-flex h-[40px] items-center gap-[6px] rounded-full bg-[#08ccca] px-[20px] text-[14px] font-bold text-white transition-colors hover:bg-[#00b8c1]"
          >
            <span>
              {easyVersion ? "View full legal version" : "View easy version"}
            </span>
            <ArrowRightIcon className="h-[15px] w-[15px]" />
          </button>
        </div>

        <p className="mb-0 mt-[24px] text-[15px] leading-[25px] text-[#333333]">
          {easyVersion ? doc.easyIntro : doc.intro}
        </p>

        {doc.slug === "sns" ? (
          <div className="mt-[28px] grid grid-cols-2 gap-[16px] max-[760px]:grid-cols-1">
            {SNS_CHANNELS.map((ch) => {
              const isSelected = highlightedChannel === ch.key;
              return (
                <div
                  key={ch.key}
                  className={`flex items-start justify-between gap-[16px] rounded-[16px] border p-[20px] transition-colors ${
                    isSelected
                      ? "border-[#00cbd5] bg-[#dffafb]/30"
                      : "border-[#ebedf2] bg-white"
                  }`}
                >
                  <div className="flex items-start gap-[14px]">
                    <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-[#f7f8fa] text-black">
                      {ch.key.includes("-x") ? (
                        <SocialXIcon className="h-[22px] w-[22px]" />
                      ) : ch.key.includes("instagram") ? (
                        <SocialInstagramIcon
                          gradientId={`sns-ig-${ch.key}`}
                          className="h-[22px] w-[22px]"
                        />
                      ) : ch.key.includes("youtube") ? (
                        <SocialYoutubeIcon className="h-[22px] w-[22px]" />
                      ) : ch.key.includes("tiktok") ? (
                        <SocialTiktokIcon className="h-[22px] w-[22px]" />
                      ) : (
                        <SocialWeiboIcon className="h-[22px] w-[22px]" />
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[#8e8e8e]">
                        {ch.group}
                      </span>
                      <strong className="mt-[2px] block text-[16px] font-extrabold text-black">
                        {ch.platform} · {ch.handle}
                      </strong>
                      <p className="mb-0 mt-[4px] text-[13px] leading-[19px] text-[#666666]">
                        {ch.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        typeof navigator !== "undefined" &&
                        navigator.clipboard
                      ) {
                        navigator.clipboard.writeText(ch.handle).catch(() => {});
                      }
                      showToast(`Copied handle ${ch.handle}`);
                    }}
                    className="shrink-0 rounded-full border border-black/15 bg-white px-[12px] py-[6px] text-[12px] font-bold text-black hover:bg-[#f7f8fa]"
                  >
                    Copy
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {tocColumns.length > 0 && (
              <section
                aria-label="Contents"
                className="mt-[28px] rounded-[12px] bg-[#f7f7fa] p-[28px] max-[673px]:p-[20px]"
              >
                <h2 className="m-0 mb-[18px] text-[16px] font-extrabold text-black">
                  Contents
                </h2>
                <div className="wev-policy-toc-grid">
                  {tocColumns.map((col, idx) => (
                    <ul
                      key={idx}
                      className="wev-policy-toc-col m-0 list-none space-y-[10px] p-0"
                    >
                      {col.map((sec) => (
                        <li key={sec.id}>
                          <a
                            href={`#${sec.id}`}
                            className="text-[14px] font-medium leading-[21px] text-[#333333] no-underline hover:text-[#08ccca] hover:underline"
                          >
                            {sec.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-[36px] space-y-[28px]">
              {doc.sections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="scroll-mt-[80px] border-b border-black/[0.06] pb-[24px]"
                >
                  <h2 className="m-0 text-[19px] font-extrabold leading-[26px] text-black">
                    {sec.title}
                  </h2>
                  {easyVersion ? (
                    <div className="mt-[12px] rounded-[12px] border border-[#08ccca]/30 bg-[#dffafb]/30 p-[16px] text-[15px] font-medium leading-[24px] text-[#111111]">
                      {sec.easySummary}
                    </div>
                  ) : (
                    <div className="mt-[12px] space-y-[10px] text-[15px] leading-[25px] text-[#333333]">
                      {sec.body.map((paragraph, pIdx) => (
                        <p key={pIdx} className="m-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {doc.slug === "cookie" && (
              <div className="mt-[24px]">
                <button
                  type="button"
                  onClick={openCookieModal}
                  className="inline-flex h-[44px] items-center rounded-full bg-black px-[22px] text-[14px] font-bold text-white hover:bg-[#282828]"
                >
                  Open Cookie Settings
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating 48x48 Back-to-Top Circle Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="fixed bottom-[28px] right-[28px] z-[40] flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#e4e4e4] bg-white text-black shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#f7f8fa]"
      >
        <ArrowUpIcon className="h-[20px] w-[20px]" />
      </button>
    </div>
  );
}
