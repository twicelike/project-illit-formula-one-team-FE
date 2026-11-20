# Weverse.io (`https://weverse.io/`) — Inspection & Reconstruction Brief

## 1. Scope & Route Map
- **Source URL:** `https://weverse.io/`
- **Local Routes:**
  - `/` (`src/app/page.tsx`) — Weverse 3.0 Homepage with persisted Demo Auth, dynamic `My Communities`, Search Communities drawer, 17-slide Hero, DM chips, Ad slot, 52 Featured Artists, Footer
  - `/[artist]` (`src/app/[artist]/page.tsx`) — Full Weverse 3.0 Artist Community pages (`Highlight`, `Fan`, `Artist`, `Fan Letter`, `Media`, `LIVE`, `Notice`, `Shop` tabs, frosted hero, Member accordions, interactive Join / Like / Comment / Fan Post / Fan Letter / Media Player)
  - `/notice/[id]` (`src/app/notice/[id]/page.tsx`) — 2-column Notice Detail page with Share copy, red event notes, cyan CTA, and sticky Recent Notices sidebar
  - `/policies/[slug]` (`src/app/policies/[slug]/page.tsx`) — Policies & Info Viewer (`privacy`, `terms`, `service`, `paid`, `cookie`, `join`, `help`, `business`, `sns`) with `View easy version` toggle, 3-column TOC box, and Back-to-Top button
  - `/shop` (`src/app/shop/page.tsx`) — Local Weverse Shop with artist/Black Friday filters, shopping bag drawer, and demo checkout
  - `/jelly` (`src/app/jelly/page.tsx`) — Local Jelly Shop with live persisted balance and instant top-up packs
- **Platform Observed:** Weverse 3.0 (`weverse3/3_19_9`, `lang="en"`, title `Global Fandom Platform - Weverse`)
- **Zero External Escapes:** All banners, sidebar services, artists, notices, policies, business info, and SNS icons stay inside local interactive routes and modals.

## 2. Design System Tokens
- **Primary Typeface:** `Pretendard` v1.3.9 (`300`, `400`, `500`, `700`, `800`) self-hosted locally under `/sites/weverse/fonts/` from Weverse CDN (`cdn-v2pstatic.weverse.io/wev_web_fe/assets/fonts/pretendard/latest/font.css`).
- **Font Stack:** `Pretendard, -apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", Helvetica, Arial, sans-serif`
- **Palette:**
  - Page & Card Surface: `#ffffff`
  - Subtle Input Surface: `#f7f8fa`
  - Reverse Active Chip Surface: `#000000`
  - Primary Brand Mint/Teal: `#00cbd5` (text/hover `#00b8c1`, light tint `#dffafb`)
  - Secondary Blue (`NEW` / Business Registration): `#5989fe` (border `rgba(89,137,254,0.4)`, tint `#edf3ff`)
  - Negative Dot: `#fe5b58`
  - Text Grays: `#000000`, `#111111`, `#282828`, `#484848`, `#666666`, `#8e8e8e`, `#aeaeae`, `#cccccc`
  - Hairlines & Dividers: `rgba(0,0,0,0.04)`, `rgba(0,0,0,0.10)`, `#ebedf2`, `#dcdee4`
  - Card Shadow: `0 6px 28px rgba(0,0,0,0.10)`
  - DM Chip Hover Shadow: `0 0 0 1px #00cbd5 inset, 0 2px 12px rgba(0,0,0,0.08)`
- **Exact Breakpoints:**
  - Desktop: `>= 1024px` (Fixed `56px` header; `240px` expanded / `72px` collapsed sidebar; `1080px` max-width content column; `273px`-tall split hero with `300×225` thumb; `728×90` ad slot; 2-col featured artists grid)
  - Tablet Large: `834px – 1023px` (Auto-folded `72px` icon rail; `224×168` hero thumb; `468×60` ad slot)
  - Tablet Small: `674px – 833px` (Auto-folded `72px` icon rail; `170×127` hero thumb; `468×60` ad slot)
  - Mobile: `<= 673px` (`48px` header; off-canvas `300px` slide-out drawer with `rgba(0,0,0,0.25)` backdrop; `1:1` full-bleed square hero with bottom `216px` scrim & top-right `X | 17` pill; `320×50` ad slot; 4-row swipeable `83.15%`-width artist carousel with `1 | N` counter & `120px` track; mobile collapsible Footer Business Info accordion + 2-col SNS layout)

## 3. Section Architecture & Interactive Behaviors
1. **Top Fixed Header:** Hamburger menu toggle (`≡`) + verbatim Weverse wordmark SVG left; DM paper-plane icon button right.
2. **Left Sidebar / Rail / Mobile Drawer:**
   - Logged-out prompt (`Log in and\nconnect with your artists!`) + mint-bordered `Login` button (collapses to `SvgIcUserGuestMedium` in `72px` rail; clicking Login opens a clean sign-in modal linking to Weverse Account).
   - `Recommended`: `+ Search Communities` button + 4 featured artists (`JVKE`, `JD1`, `LNGSHOT`, `LEE SUNG KYOUNG`).
   - `Go to Service`: `Shop` and `Jelly Shop` (squircle icons shift from `#666` to `#00cbd5` on hover and reveal `20×20` external link arrow `#ccc`).
3. **Search Communities Floating Drawer:** Auto-folds desktop sidebar to `72px` rail and slides out a `360px` panel with live search (`Enter artist name` + clear `×`), horizontal category/alphabet pill bar (`All`, `Weverse DM`, `New`, `Group`, `Solo`, `Latin`, `A`–`Z`, `0-9`, `#-&`) with expand chevron toggling full grid, and scrollable squircle+logo artist list with member names & `NEW` badges.
4. **Hero Banner Carousel:** 17 real slides with `4000ms` autoplay loop (pauses on interaction), blurred/tinted dynamic backdrop with `0.4s ease` crossfade, adaptive `#000`/`#fff` copy, `36×36` prev/next arrows, clickable `120px` segmented indicator bar on `>=674px`, and `1:1` square mobile layout with `X | 17` badge.
5. **DM with your Artist! Card:** White elevated card (`16px` radius), refresh (`↻`) cycling real downloaded DM batches, 2 staggered rows (6 chips + 3 chips & `View All →`), `44px` pill chips with smooth marquee + `24px` fade mask for long names, `#00cbd5` inset border + cyan circle w/ white paper-plane avatar hover overlay, and horizontal overflow `<` / `>` navigation buttons on tablet/narrow desktop.
6. **Responsive Ad Banner Slot:** Matches observed `728×90` / `468×60` / `320×50` layout geometry using a clean static local banner without live Google GPT ad-tracker scripts.
7. **Looking for new artists? Card:** 51 real Weverse artists with downloaded local photos, `72×72` squircle SVG mask + overlapping `28×28` circular logo badge (`2px solid #fff`), 2-col grid on `>=674px`, and 4-row swipeable carousel (`flex-basis: 83.15%`, `1 | N` counter, `120px` track) on `<=673px`.
8. **Weverse DM Floating Widget & Dock:** Opens from header DM icon, any DM chip (pre-filtered), or `View All →`; supports Home/Messages view (promo card, `+ DM with your artist`, verified recommended list + refresh) and Artist List view (search, `Recommended •` + artist filter tabs, emoji avatar badges, cyan sparkle status marquees), plus minimize (`⌄`) into bottom-right `Weverse DM ^` floating dock pill.
9. **Initial Overlays & Footer:**
   - Black Friday promotional modal (`450×686` poster, `#000`/`#22CAE0` `Learn More`, `Don't show again` | `Close`).
   - Fixed bottom Cookie Consent bar (`#111111ed`, `50px` height, `Refuse and continue`, `Customize`, `Accept All`) + `"Consent to Collection of Cookies"` Customize modal (5 accordion rows, `Disagree All`, `Save`, `Close`), also re-openable from Footer `Cookie Settings`.
   - Footer (`max-width: 1100px`): 8 legal links (`Privacy Policy` bold), company `<dl>` with `1×12px` dividers & blue `Business Registration` pill, mobile collapsible `Weverse Company Business Info` accordion, disclaimer, `Weverse SNS` + `Weverse Shop SNS` verbatim SVG icons, and copyright.

## 4. Local Asset Structure (`public/sites/weverse/`)
- `logo192.png` — favicon
- `popup/black-friday.png` — operational promo poster
- `hero/slide-01.webp` .. `slide-17.webp` — all 17 hero carousel banners
- `dm/<slug>.webp` — 17 DM artist circular avatars (Batch 1 & Batch 2)
- `artists/<slug>-header.webp` & `<slug>-logo.webp` — paired Featured Artist images
- `fonts/Pretendard-*.woff2` — local Pretendard v1.3.9 font subsets

