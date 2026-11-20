"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type CommunityDetailBundle,
  type CommunityFanLetter,
  type CommunityMediaItem,
  type CommunityPost,
} from "./community-data";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CloseIcon,
  CommentIcon,
  DmMessageIcon,
  HeartIcon,
  MegaphoneIcon,
  MenuIcon,
  PlayTriangleIcon,
  ShoppingBagIcon,
  VerifiedBadgeIcon,
  WeverseMarkSquareIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

type CommunityTab =
  | "Highlight"
  | "Fan"
  | "Artist"
  | "Fan Letter"
  | "Media"
  | "LIVE"
  | "Notice"
  | "Shop";

const TABS: CommunityTab[] = [
  "Highlight",
  "Fan",
  "Artist",
  "Fan Letter",
  "Media",
  "LIVE",
  "Notice",
  "Shop",
];

const LETTER_THEMES = ["#fce8ee", "#e3f2fd", "#f3e8ff", "#dffafb", "#fff3e0"];

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function CommunityPageClient({
  bundle,
}: {
  bundle: CommunityDetailBundle;
}) {
  const {
    user,
    joinedSlugs,
    toggleJoinCommunity,
    likedPostIds,
    toggleLikePost,
    postComments,
    addPostComment,
    userPosts,
    createFanPost,
    addToCart,
    openDmArtistList,
    openLoginModal,
    openCookieModal,
    showToast,
  } = useWeverseApp();

  const { artist, accentColor } = bundle;
  const isJoined = Boolean(user && joinedSlugs.includes(artist.slug));

  const [activeTab, setActiveTab] = useState<CommunityTab>("Highlight");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileScrolled, setMobileScrolled] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(
    bundle.members[0]?.name ?? null
  );
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
    null
  );
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {}
  );
  const [newPostText, setNewPostText] = useState("");
  const [showPostComposer, setShowPostComposer] = useState(false);

  const [extraLetters, setExtraLetters] = useState<CommunityFanLetter[]>([]);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterTo, setLetterTo] = useState(artist.name);
  const [letterBody, setLetterBody] = useState("");
  const [letterBg, setLetterBg] = useState(LETTER_THEMES[0]);
  const [readingLetter, setReadingLetter] =
    useState<CommunityFanLetter | null>(null);

  const [activeMedia, setActiveMedia] = useState<CommunityMediaItem | null>(
    null
  );
  const [liveHeartCount, setLiveHeartCount] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setMobileScrolled(window.scrollY > 240);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const combinedFanPosts: CommunityPost[] = useMemo(() => {
    const mine = userPosts
      .filter((p) => p.artistSlug === artist.slug)
      .map<CommunityPost>((p) => ({
        id: p.id,
        type: "fan",
        authorName: p.authorName,
        authorAvatar: artist.logoImage,
        membershipBadge: true,
        timestamp: p.timestamp,
        body: p.body,
        likes: p.likes,
        comments: [],
      }));
    return [...mine, ...bundle.fanPosts];
  }, [userPosts, artist.slug, artist.logoImage, bundle.fanPosts]);

  const allLetters = useMemo(
    () => [...extraLetters, ...bundle.fanLetters],
    [extraLetters, bundle.fanLetters]
  );

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }
    if (!newPostText.trim()) return;
    createFanPost(artist.slug, newPostText);
    setNewPostText("");
    setShowPostComposer(false);
  };

  const handleSubmitComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentDrafts[postId] ?? "";
    if (!text.trim()) return;
    if (!user) {
      openLoginModal(() => {
        addPostComment(postId, text);
        setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      });
      return;
    }
    addPostComment(postId, text);
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }
    if (!letterBody.trim()) return;
    const created: CommunityFanLetter = {
      id: `user-letter-${Date.now()}`,
      toName: letterTo,
      fromName: user.nickname,
      image: artist.logoImage,
      note: letterBody.trim(),
      accentBg: letterBg,
    };
    setExtraLetters((prev) => [created, ...prev]);
    setLetterBody("");
    setShowLetterModal(false);
    showToast(`Fan letter sent to ${letterTo}!`);
  };

  const renderPostCard = (post: CommunityPost, compact = false) => {
    const isLiked = likedPostIds.includes(post.id);
    const totalLikes = post.likes + (isLiked ? 1 : 0);
    const extraComments = postComments[post.id] ?? [];
    const allComments = [...post.comments, ...extraComments];
    const commentsVisible = openCommentsPostId === post.id;

    return (
      <article
        key={post.id}
        className={`rounded-[14px] border border-black/[0.05] bg-white ${
          compact ? "p-[14px]" : "p-[18px]"
        }`}
      >
        <div className="flex items-center gap-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="h-[36px] w-[36px] shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[5px]">
              <strong className="truncate text-[14px] font-bold leading-[19px] text-black">
                {post.authorName}
              </strong>
              {post.verified && (
                <VerifiedBadgeIcon className="h-[14px] w-[14px] shrink-0" />
              )}
              {post.membershipBadge && (
                <span className="inline-flex h-[16px] shrink-0 items-center rounded-[4px] bg-[#f3e8ff] px-[5px] text-[9px] font-bold text-[#7c3aed]">
                  MEMBERSHIP
                </span>
              )}
            </div>
            <span className="block text-[11px] leading-[15px] text-[#8e8e8e]">
              {post.timestamp}
            </span>
          </div>
        </div>

        <p className="mb-0 mt-[10px] whitespace-pre-line text-[14px] leading-[21px] text-[#222222]">
          {post.body}
        </p>

        {post.images && post.images.length > 0 && (
          <div
            className={`mt-[12px] grid gap-[6px] ${
              post.images.length === 1
                ? "grid-cols-1"
                : post.images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {post.images.map((src, idx) => (
              <button
                key={`${post.id}-img-${idx}`}
                type="button"
                onClick={() => setLightboxImage(src)}
                aria-label="View full image"
                className={`overflow-hidden rounded-[10px] bg-[#f2f3f7] p-0 ${
                  post.images?.length === 1
                    ? compact
                      ? "h-[160px]"
                      : "max-h-[340px]"
                    : "aspect-square"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.03]"
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-[12px] flex items-center gap-[16px] border-t border-black/[0.04] pt-[10px]">
          <button
            type="button"
            onClick={() => toggleLikePost(post.id)}
            className={`inline-flex items-center gap-[5px] bg-transparent p-0 text-[13px] font-semibold transition-colors ${
              isLiked ? "text-[#fe5b58]" : "text-[#666666] hover:text-black"
            }`}
          >
            <HeartIcon filled={isLiked} className="h-[18px] w-[18px]" />
            <span>{formatCount(totalLikes)}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setOpenCommentsPostId(commentsVisible ? null : post.id)
            }
            className="inline-flex items-center gap-[5px] bg-transparent p-0 text-[13px] font-semibold text-[#666666] transition-colors hover:text-black"
          >
            <CommentIcon className="h-[18px] w-[18px]" />
            <span>{allComments.length}</span>
          </button>
        </div>

        {commentsVisible && (
          <div className="mt-[12px] rounded-[10px] bg-[#f7f8fa] p-[12px]">
            {allComments.length === 0 ? (
              <p className="m-0 text-[12px] text-[#8e8e8e]">
                Be the first to leave a cheering comment!
              </p>
            ) : (
              <ul className="m-0 list-none space-y-[8px] p-0">
                {allComments.map((c) => (
                  <li key={c.id} className="text-[13px] leading-[18px]">
                    <span className="mr-[6px] font-bold text-black">
                      {c.author}
                    </span>
                    <span className="text-[#333333]">{c.text}</span>
                    <span className="ml-[6px] text-[11px] text-[#8e8e8e]">
                      {c.timestamp}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={(e) => handleSubmitComment(post.id, e)}
              className="mt-[10px] flex items-center gap-[8px]"
            >
              <input
                type="text"
                value={commentDrafts[post.id] ?? ""}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
                placeholder="Leave a comment..."
                aria-label="Leave a comment"
                className="h-[34px] flex-1 rounded-full border border-black/10 bg-white px-[12px] text-[13px] text-black outline-none focus:border-[#00cbd5]"
              />
              <button
                type="submit"
                className="h-[34px] shrink-0 rounded-full bg-black px-[14px] text-[12px] font-bold text-white hover:bg-[#282828]"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </article>
    );
  };

  const renderAboutCard = () => (
    <div className="wev-community-card p-[20px]">
      <div className="flex items-center gap-[14px]">
        <div className="wev-squircle-mask h-[64px] w-[64px] shrink-0 overflow-hidden bg-[#f2f3f7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={artist.logoImage}
            alt={artist.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-[18px] font-extrabold leading-[24px] text-black">
            {artist.name}
          </strong>
          <span className="mt-[2px] block text-[13px] text-[#8e8e8e]">
            {bundle.memberCountLabel}
          </span>
        </div>
      </div>

      <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
        <button
          type="button"
          onClick={() => toggleJoinCommunity(artist.slug)}
          className={`inline-flex h-[38px] items-center justify-center gap-[6px] rounded-full text-[13px] font-bold transition-colors ${
            isJoined
              ? "border border-[#ebedf2] bg-[#f7f8fa] text-[#484848] hover:bg-[#eceef3]"
              : "bg-black text-white hover:bg-[#222222]"
          }`}
        >
          {isJoined && <CheckCircleIcon className="h-[15px] w-[15px]" />}
          <span>{isJoined ? "Joined" : "Join Now"}</span>
        </button>
        <button
          type="button"
          onClick={() =>
            openDmArtistList(artist.hasDm ? artist.name : "Recommended")
          }
          className="inline-flex h-[38px] items-center justify-center gap-[6px] rounded-full border border-[#00cbd5] bg-white text-[13px] font-bold text-[#00b8c1] transition-colors hover:bg-[#dffafb]/40"
        >
          <DmMessageIcon className="h-[15px] w-[15px]" />
          <span>Weverse DM</span>
        </button>
      </div>

      <div className="mt-[18px] border-t border-black/[0.05] pt-[14px]">
        <h3 className="m-0 mb-[10px] text-[14px] font-bold leading-[19px] text-black">
          Artist Members ({bundle.members.length})
        </h3>
        <ul className="m-0 list-none divide-y divide-black/[0.04] p-0">
          {bundle.members.map((member) => {
            const isOpen = expandedMember === member.name;
            return (
              <li key={member.name} className="py-[8px]">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMember(isOpen ? null : member.name)
                  }
                  className="flex w-full items-center justify-between gap-[10px] bg-transparent p-0 text-left"
                >
                  <span className="flex min-w-0 items-center gap-[10px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-[34px] w-[34px] shrink-0 rounded-full object-cover"
                    />
                    <span className="truncate text-[14px] font-semibold text-black">
                      {member.name}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className={`h-[16px] w-[16px] shrink-0 text-[#8e8e8e] transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-[8px] rounded-[10px] bg-[#f7f8fa] p-[10px] text-[12px] leading-[17px] text-[#484848]">
                    <div className="font-semibold text-black">
                      Birthday: {member.birthday}
                    </div>
                    <p className="mb-0 mt-[4px]">{member.bio}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Desktop/Tablet Solid 56px Community Header */}
      <header className="wev-header wev-community-header-desktop border-b border-black/[0.04]">
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
            className="flex items-center text-black no-underline transition-opacity hover:opacity-80"
          >
            <WeverseMarkSquareIcon className="h-[28px] w-[28px]" />
          </Link>
          <span className="text-[19px] font-extrabold leading-[24px] tracking-[-0.01em] text-black">
            {artist.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            openDmArtistList(artist.hasDm ? artist.name : "Recommended")
          }
          aria-label="Open Weverse DM"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] text-black hover:bg-black/[0.04]"
        >
          <DmMessageIcon className="h-[24px] w-[24px]" />
        </button>
      </header>

      {/* Mobile Transparent-to-Accent Scroll Header */}
      <header
        className="wev-community-header-mobile fixed left-0 right-0 top-0 z-[60] h-[48px] items-center justify-between px-[12px] text-white transition-colors duration-200"
        style={{
          backgroundColor: mobileScrolled ? accentColor : "transparent",
          backgroundImage: mobileScrolled
            ? "none"
            : "linear-gradient(to bottom, rgba(0,0,0,0.34), rgba(0,0,0,0))",
        }}
      >
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
          >
            <MenuIcon className="h-[22px] w-[22px]" />
          </button>
          <Link
            href="/"
            aria-label="Back to Weverse Home"
            className="flex items-center text-white no-underline"
          >
            <WeverseMarkSquareIcon className="h-[24px] w-[24px] text-black/85" />
          </Link>
          {mobileScrolled && (
            <span className="text-[17px] font-extrabold tracking-[-0.01em] text-white">
              {artist.name}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            openDmArtistList(artist.hasDm ? artist.name : "Recommended")
          }
          aria-label="Open Weverse DM"
          className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
        >
          <DmMessageIcon className="h-[22px] w-[22px]" />
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

      {/* Full-Bleed Community Hero Banner */}
      <div className="pt-[56px] max-[673px]:pt-0">
        <section className="wev-community-hero-stage" aria-label={artist.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bundle.heroDesktopImage}
            alt={artist.name}
            className="h-full w-full object-cover object-center max-[673px]:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bundle.heroMobileImage}
            alt={artist.name}
            className="hidden h-full w-full object-cover object-top max-[673px]:block"
          />

          <div className="wev-community-hero-blur-desktop" aria-hidden="true" />
          <div className="wev-community-hero-blur-mobile" aria-hidden="true" />

          <div className="absolute inset-0 z-10 mx-auto flex max-w-[1100px] flex-col justify-end px-[24px] pb-[32px] max-[673px]:items-center max-[673px]:px-[20px] max-[673px]:pb-[24px] max-[673px]:text-center">
            <h1 className="m-0 text-[48px] font-extrabold leading-[54px] tracking-[-0.02em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.32)] max-[900px]:text-[36px] max-[900px]:leading-[42px] max-[673px]:text-[32px] max-[673px]:leading-[38px]">
              {artist.name}
            </h1>
            <div className="mt-[16px] flex items-center gap-[10px] max-[673px]:w-full max-[673px]:justify-center">
              <button
                type="button"
                onClick={() => toggleJoinCommunity(artist.slug)}
                className={`inline-flex h-[42px] items-center justify-center gap-[6px] rounded-full px-[24px] text-[14px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform active:scale-[0.98] max-[673px]:w-full max-[673px]:max-w-[260px] ${
                  isJoined
                    ? "bg-white/25 text-white backdrop-blur-md hover:bg-white/35"
                    : "bg-white text-black hover:bg-[#f7f8fa]"
                }`}
              >
                {isJoined && <CheckCircleIcon className="h-[16px] w-[16px]" />}
                <span>{isJoined ? "Joined Community" : "Join Now"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Sticky 8-Tab Bar */}
        <nav
          aria-label="Community sections"
          className="sticky top-[56px] z-[45] border-b border-black/[0.06] bg-white max-[673px]:top-[48px]"
        >
          <div className="wev-no-scrollbar mx-auto flex max-w-[1100px] items-center gap-[24px] overflow-x-auto px-[20px] max-[673px]:gap-[18px] max-[673px]:px-[16px]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative shrink-0 bg-transparent py-[14px] text-[15px] leading-[20px] transition-colors ${
                    isActive
                      ? "font-extrabold text-black"
                      : "font-medium text-[#666666] hover:text-black"
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Community Body */}
        {activeTab === "Highlight" ? (
          <main className="wev-community-grid">
            <div className="flex min-w-0 flex-col gap-[20px]">
              {/* Notice Card */}
              <section className="wev-community-card p-[20px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[8px]">
                    <MegaphoneIcon
                      className="h-[20px] w-[20px]"
                      style={{ color: accentColor }}
                    />
                    <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
                      Notice
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Notice")}
                    className="inline-flex items-center gap-[2px] bg-transparent p-0 text-[13px] font-semibold text-[#666666] hover:text-black"
                  >
                    <span>More</span>
                    <ArrowRightIcon className="h-[14px] w-[14px]" />
                  </button>
                </div>

                <ul className="m-0 mt-[12px] list-none divide-y divide-black/[0.04] p-0">
                  {bundle.notices.slice(0, 3).map((notice) => (
                    <li key={notice.id}>
                      <Link
                        href={`/notice/${notice.id}`}
                        className="flex items-center justify-between gap-[10px] py-[10px] text-black no-underline transition-colors hover:text-[#00b8c1]"
                      >
                        <span className="flex min-w-0 items-center gap-[6px]">
                          <span className="truncate text-[14px] font-medium leading-[20px]">
                            {notice.title}
                          </span>
                          {notice.isNew && (
                            <span className="inline-flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-[#fe5b58] text-[9px] font-bold text-white">
                              N
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-[12px] text-[#8e8e8e]">
                          {notice.shortDate}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Mobile About/Members placement right after Notice */}
              <div className="hidden max-[900px]:block">{renderAboutCard()}</div>

              {/* From Artist Preview */}
              <section className="wev-community-card p-[20px]">
                <div className="mb-[14px] flex items-center justify-between">
                  <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
                    From {artist.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Artist")}
                    className="inline-flex items-center gap-[2px] bg-transparent p-0 text-[13px] font-semibold text-[#666666] hover:text-black"
                  >
                    <span>More</span>
                    <ArrowRightIcon className="h-[14px] w-[14px]" />
                  </button>
                </div>
                <div className="space-y-[14px]">
                  {bundle.artistPosts.slice(0, 1).map((post) =>
                    renderPostCard(post)
                  )}
                </div>
              </section>

              {/* Fan Posts 2-Col Preview */}
              <section className="wev-community-card p-[20px]">
                <div className="mb-[14px] flex items-center justify-between">
                  <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
                    Fan
                  </h2>
                  <div className="flex items-center gap-[12px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("Fan");
                        setShowPostComposer(true);
                      }}
                      className="rounded-full bg-[#f7f8fa] px-[12px] py-[5px] text-[12px] font-bold text-black hover:bg-[#ebedf2]"
                    >
                      + Write Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Fan")}
                      className="inline-flex items-center gap-[2px] bg-transparent p-0 text-[13px] font-semibold text-[#666666] hover:text-black"
                    >
                      <span>More</span>
                      <ArrowRightIcon className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[12px] max-[673px]:grid-cols-1">
                  {combinedFanPosts.slice(0, 2).map((post) =>
                    renderPostCard(post, true)
                  )}
                </div>
              </section>

              {/* Merch Row */}
              <section className="wev-community-card p-[20px]">
                <div className="mb-[14px] flex items-center justify-between">
                  <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
                    Merch
                  </h2>
                  <Link
                    href={`/shop?artist=${artist.slug}`}
                    className="inline-flex items-center gap-[2px] text-[13px] font-semibold text-[#666666] no-underline hover:text-black"
                  >
                    <span>Shop All</span>
                    <ArrowRightIcon className="h-[14px] w-[14px]" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-[12px] max-[673px]:grid-cols-2">
                  {bundle.merch.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col overflow-hidden rounded-[12px] border border-black/[0.05] bg-white"
                    >
                      <div className="aspect-square overflow-hidden bg-[#f7f8fa]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-[10px]">
                        <div className="mb-[6px] flex flex-wrap gap-[4px]">
                          {item.badges.map((badge) => (
                            <span
                              key={badge}
                              className={`inline-flex h-[16px] items-center rounded-[3px] px-[5px] text-[9px] font-bold ${
                                badge === "EXCLUSIVE"
                                  ? "bg-[#e9f8fa] text-[#009ba3]"
                                  : badge === "PRE-ORDER"
                                    ? "bg-[#edf3ff] text-[#4070f4]"
                                    : "bg-[#fce8ee] text-[#d6335a]"
                              }`}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <strong className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-black">
                          {item.name}
                        </strong>
                        <span className="mt-[4px] text-[14px] font-extrabold text-black">
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
                          className="mt-auto inline-flex h-[32px] w-full items-center justify-center gap-[5px] rounded-[8px] bg-[#f7f8fa] text-[12px] font-bold text-black transition-colors hover:bg-[#00cbd5] hover:text-white"
                        >
                          <ShoppingBagIcon className="h-[14px] w-[14px]" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Media & LIVE Cards */}
              <section className="wev-community-card p-[20px]">
                <div className="mb-[14px] flex items-center justify-between">
                  <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
                    Media &amp; LIVE
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Media")}
                    className="inline-flex items-center gap-[2px] bg-transparent p-0 text-[13px] font-semibold text-[#666666] hover:text-black"
                  >
                    <span>More</span>
                    <ArrowRightIcon className="h-[14px] w-[14px]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-[14px] max-[673px]:grid-cols-1">
                  {bundle.media.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setLiveHeartCount(0);
                        setActiveMedia(item);
                      }}
                      className="group flex flex-col overflow-hidden rounded-[12px] border border-black/[0.05] bg-white p-0 text-left"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                        <span
                          className={`absolute left-[10px] top-[10px] rounded-[4px] px-[7px] py-[2px] text-[10px] font-extrabold text-white ${
                            item.kind === "live"
                              ? "bg-[#fe5b58]"
                              : "bg-black/75"
                          }`}
                        >
                          {item.kind === "live" ? "LIVE REPLAY" : "VIDEO"}
                        </span>
                        <span className="absolute bottom-[8px] right-[8px] rounded-[4px] bg-black/75 px-[6px] py-[2px] text-[11px] font-bold text-white">
                          {item.duration}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-90 transition-opacity group-hover:bg-black/25">
                          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-black/60 text-white">
                            <PlayTriangleIcon className="h-[20px] w-[20px]" />
                          </span>
                        </span>
                      </div>
                      <div className="p-[12px]">
                        <strong className="line-clamp-2 block text-[14px] font-bold leading-[19px] text-black">
                          {item.title}
                        </strong>
                        <span className="mt-[4px] block text-[12px] text-[#8e8e8e]">
                          {item.authorName} · {item.views} views · {item.date}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Fan Letters Grid */}
              <section className="wev-community-card p-[20px]">
                <div className="mb-[14px] flex items-center justify-between">
                  <h2 className="m-0 text-[16px] font-bold leading-[22px] text-black">
                    Fan Letter
                  </h2>
                  <div className="flex items-center gap-[12px]">
                    <button
                      type="button"
                      onClick={() => setShowLetterModal(true)}
                      className="rounded-full bg-[#f7f8fa] px-[12px] py-[5px] text-[12px] font-bold text-black hover:bg-[#ebedf2]"
                    >
                      + Write Letter
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Fan Letter")}
                      className="inline-flex items-center gap-[2px] bg-transparent p-0 text-[13px] font-semibold text-[#666666] hover:text-black"
                    >
                      <span>More</span>
                      <ArrowRightIcon className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-[10px] max-[673px]:grid-cols-2">
                  {allLetters.slice(0, 4).map((letter) => (
                    <button
                      key={letter.id}
                      type="button"
                      onClick={() => setReadingLetter(letter)}
                      className="flex flex-col overflow-hidden rounded-[12px] border border-black/[0.06] p-[10px] text-left transition-transform hover:-translate-y-[2px]"
                      style={{ backgroundColor: letter.accentBg }}
                    >
                      <span className="text-[11px] font-extrabold text-[#484848]">
                        To. {letter.toName}
                      </span>
                      <div className="my-[8px] aspect-[4/3] overflow-hidden rounded-[8px] bg-white/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={letter.image}
                          alt={letter.toName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="m-0 line-clamp-3 text-[12px] leading-[16px] text-[#222222]">
                        {letter.note}
                      </p>
                      <span className="mt-auto pt-[6px] text-[10px] font-semibold text-[#666666]">
                        From {letter.fromName}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Desktop Right Sticky About/Members Column */}
            <aside className="sticky top-[120px] max-[900px]:hidden">
              {renderAboutCard()}
            </aside>
          </main>
        ) : (
          <main className="mx-auto max-w-[1100px] px-[20px] pb-[96px] pt-[20px] max-[673px]:px-[16px]">
            {activeTab === "Fan" && (
              <div className="mx-auto max-w-[760px] space-y-[16px]">
                <div className="wev-community-card p-[18px]">
                  <div className="flex items-center justify-between">
                    <h2 className="m-0 text-[17px] font-bold text-black">
                      Fan Feed ({combinedFanPosts.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowPostComposer((prev) => !prev)}
                      className="rounded-full bg-[#00cbd5] px-[16px] py-[8px] text-[13px] font-bold text-white hover:bg-[#00b8c1]"
                    >
                      {showPostComposer ? "Cancel" : "Write a Post"}
                    </button>
                  </div>

                  {showPostComposer && (
                    <form onSubmit={handleCreatePost} className="mt-[14px]">
                      <textarea
                        rows={3}
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder={`Share a message with ${artist.name} and fellow fans...`}
                        className="w-full rounded-[12px] border border-[#dcdee4] bg-[#f7f8fa] p-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5]"
                      />
                      <div className="mt-[10px] flex justify-end">
                        <button
                          type="submit"
                          className="rounded-full bg-black px-[20px] py-[8px] text-[13px] font-bold text-white hover:bg-[#282828]"
                        >
                          Publish Post
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="space-y-[14px]">
                  {combinedFanPosts.map((post) => renderPostCard(post))}
                </div>
              </div>
            )}

            {activeTab === "Artist" && (
              <div className="mx-auto max-w-[760px] space-y-[14px]">
                <h2 className="m-0 text-[18px] font-bold text-black">
                  Artist Posts from {artist.name}
                </h2>
                {bundle.artistPosts.map((post) => renderPostCard(post))}
              </div>
            )}

            {activeTab === "Fan Letter" && (
              <div>
                <div className="mb-[16px] flex items-center justify-between">
                  <h2 className="m-0 text-[18px] font-bold text-black">
                    Fan Letters to {artist.name} ({allLetters.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowLetterModal(true)}
                    className="rounded-full bg-[#00cbd5] px-[18px] py-[9px] text-[13px] font-bold text-white hover:bg-[#00b8c1]"
                  >
                    + Send Fan Letter
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-[14px] max-[900px]:grid-cols-2">
                  {allLetters.map((letter) => (
                    <button
                      key={letter.id}
                      type="button"
                      onClick={() => setReadingLetter(letter)}
                      className="flex flex-col overflow-hidden rounded-[16px] border border-black/[0.06] p-[14px] text-left transition-transform hover:-translate-y-[2px]"
                      style={{ backgroundColor: letter.accentBg }}
                    >
                      <span className="text-[12px] font-extrabold text-[#484848]">
                        To. {letter.toName}
                      </span>
                      <div className="my-[10px] aspect-[4/3] overflow-hidden rounded-[10px] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={letter.image}
                          alt={letter.toName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="m-0 line-clamp-4 text-[13px] leading-[19px] text-[#222222]">
                        {letter.note}
                      </p>
                      <span className="mt-auto pt-[10px] text-[11px] font-semibold text-[#666666]">
                        From {letter.fromName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === "Media" || activeTab === "LIVE") && (
              <div>
                <h2 className="m-0 mb-[16px] text-[18px] font-bold text-black">
                  {activeTab === "LIVE"
                    ? `${artist.name} LIVE Replays`
                    : `${artist.name} Official Media`}
                </h2>
                <div className="grid grid-cols-2 gap-[16px] max-[673px]:grid-cols-1">
                  {bundle.media
                    .filter((item) =>
                      activeTab === "LIVE" ? item.kind === "live" : true
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLiveHeartCount(0);
                          setActiveMedia(item);
                        }}
                        className="wev-community-card group flex flex-col overflow-hidden p-0 text-left"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                          />
                          <span
                            className={`absolute left-[12px] top-[12px] rounded-[4px] px-[8px] py-[3px] text-[11px] font-extrabold text-white ${
                              item.kind === "live"
                                ? "bg-[#fe5b58]"
                                : "bg-black/75"
                            }`}
                          >
                            {item.kind === "live" ? "LIVE REPLAY" : "VIDEO"}
                          </span>
                          <span className="absolute bottom-[10px] right-[10px] rounded-[4px] bg-black/75 px-[7px] py-[3px] text-[12px] font-bold text-white">
                            {item.duration}
                          </span>
                          <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-black/60 text-white">
                              <PlayTriangleIcon className="h-[24px] w-[24px]" />
                            </span>
                          </span>
                        </div>
                        <div className="p-[16px]">
                          <strong className="block text-[16px] font-bold leading-[22px] text-black">
                            {item.title}
                          </strong>
                          <p className="mb-0 mt-[6px] text-[13px] leading-[19px] text-[#666666]">
                            {item.description}
                          </p>
                          <span className="mt-[8px] block text-[12px] text-[#8e8e8e]">
                            {item.authorName} · {item.views} views ·{" "}
                            {item.likes} likes · {item.date}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {activeTab === "Notice" && (
              <div className="wev-community-card mx-auto max-w-[820px] p-[24px]">
                <h2 className="m-0 mb-[14px] text-[18px] font-bold text-black">
                  {artist.name} Notices
                </h2>
                <ul className="m-0 list-none divide-y divide-black/[0.06] p-0">
                  {bundle.notices.map((notice) => (
                    <li key={notice.id}>
                      <Link
                        href={`/notice/${notice.id}`}
                        className="flex items-center justify-between gap-[12px] py-[14px] text-black no-underline hover:text-[#00b8c1]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-[6px]">
                            <strong className="truncate text-[15px] font-semibold">
                              {notice.title}
                            </strong>
                            {notice.isNew && (
                              <span className="inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#fe5b58] text-[9px] font-bold text-white">
                                N
                              </span>
                            )}
                          </div>
                          <span className="mt-[4px] block text-[12px] text-[#8e8e8e]">
                            {notice.date}
                          </span>
                        </div>
                        <ArrowRightIcon className="h-[16px] w-[16px] shrink-0 text-[#8e8e8e]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "Shop" && (
              <div>
                <div className="mb-[16px] flex items-center justify-between">
                  <h2 className="m-0 text-[18px] font-bold text-black">
                    {artist.name} Official Merch
                  </h2>
                  <Link
                    href={`/shop?artist=${artist.slug}`}
                    className="rounded-full border border-black/15 px-[14px] py-[7px] text-[13px] font-bold text-black no-underline hover:bg-[#f7f8fa]"
                  >
                    Open Full Weverse Shop →
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-[16px] max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
                  {bundle.merch.map((item) => (
                    <div
                      key={item.id}
                      className="wev-community-card flex flex-col overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden bg-[#f7f8fa]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-[14px]">
                        <div className="mb-[6px] flex flex-wrap gap-[4px]">
                          {item.badges.map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex h-[18px] items-center rounded-[4px] bg-[#edf3ff] px-[6px] text-[10px] font-bold text-[#4070f4]"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <strong className="text-[15px] font-bold leading-[20px] text-black">
                          {item.name}
                        </strong>
                        <p className="mb-0 mt-[4px] line-clamp-2 text-[12px] leading-[17px] text-[#666666]">
                          {item.description}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-[12px]">
                          <span className="text-[16px] font-extrabold text-black">
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
                            className="inline-flex h-[34px] items-center gap-[6px] rounded-full bg-black px-[14px] text-[12px] font-bold text-white hover:bg-[#00cbd5]"
                          >
                            <ShoppingBagIcon className="h-[14px] w-[14px]" />
                            <span>Add to Bag</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}

        <WeverseFooter onOpenCookieSettings={openCookieModal} />
      </div>

      {/* Floating Bottom Translucent Teal Login Bar when logged out */}
      {!user && (
        <div className="fixed bottom-[16px] left-1/2 z-[55] w-[calc(100%-32px)] max-w-[780px] -translate-x-1/2">
          <div className="flex items-center justify-between gap-[12px] rounded-full bg-[#00cbd5]/85 px-[24px] py-[13px] text-white shadow-[0_8px_28px_rgba(0,203,213,0.34)] backdrop-blur-md max-[673px]:px-[16px] max-[673px]:py-[11px]">
            <span className="text-[14px] font-bold leading-[19px] max-[673px]:text-[12px]">
              Only community members can see the content in full!
            </span>
            <button
              type="button"
              onClick={() => openLoginModal()}
              className="inline-flex shrink-0 items-center gap-[4px] rounded-full bg-white/20 px-[14px] py-[6px] text-[13px] font-extrabold text-white transition-colors hover:bg-white/30 max-[673px]:text-[12px]"
            >
              <span>Log in to continue</span>
              <ArrowRightIcon className="h-[14px] w-[14px]" />
            </button>
          </div>
        </div>
      )}

      {/* Write Fan Letter Modal */}
      {showLetterModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Write a Fan Letter"
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 px-[16px]"
          onClick={() => setShowLetterModal(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-[20px] bg-white p-[24px] shadow-[0_16px_48px_rgba(0,0,0,0.24)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-bold text-black">
                Write a Fan Letter
              </h2>
              <button
                type="button"
                onClick={() => setShowLetterModal(false)}
                aria-label="Close"
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-black hover:bg-black/[0.04]"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <form
              onSubmit={handleCreateLetter}
              className="mt-[16px] space-y-[14px]"
            >
              <div>
                <label
                  htmlFor="fan-letter-to"
                  className="mb-[6px] block text-[12px] font-bold text-[#484848]"
                >
                  To
                </label>
                <select
                  id="fan-letter-to"
                  value={letterTo}
                  onChange={(e) => setLetterTo(e.target.value)}
                  className="h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-white px-[12px] text-[14px] text-black outline-none"
                >
                  <option value={artist.name}>{artist.name} (All)</option>
                  {bundle.members.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="mb-[6px] block text-[12px] font-bold text-[#484848]">
                  Paper Color
                </span>
                <div className="flex items-center gap-[8px]">
                  {LETTER_THEMES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setLetterBg(color)}
                      aria-label={`Select color ${color}`}
                      className={`h-[28px] w-[28px] rounded-full border-2 ${
                        letterBg === color ? "border-black" : "border-black/10"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="fan-letter-body"
                  className="mb-[6px] block text-[12px] font-bold text-[#484848]"
                >
                  Message
                </label>
                <textarea
                  id="fan-letter-body"
                  rows={4}
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  placeholder={`Write a warm fan letter to ${letterTo}...`}
                  className="w-full rounded-[12px] border border-[#dcdee4] p-[12px] text-[14px] text-black outline-none"
                  style={{ backgroundColor: letterBg }}
                />
              </div>

              <button
                type="submit"
                className="h-[44px] w-full rounded-full bg-[#00cbd5] text-[14px] font-bold text-white hover:bg-[#00b8c1]"
              >
                Send Fan Letter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Read Fan Letter Modal */}
      {readingLetter && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fan letter to ${readingLetter.toName}`}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 px-[16px]"
          onClick={() => setReadingLetter(null)}
        >
          <div
            className="w-full max-w-[420px] rounded-[20px] p-[24px] shadow-[0_16px_48px_rgba(0,0,0,0.24)]"
            style={{ backgroundColor: readingLetter.accentBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <strong className="text-[16px] font-extrabold text-black">
                To. {readingLetter.toName}
              </strong>
              <button
                type="button"
                onClick={() => setReadingLetter(null)}
                aria-label="Close letter"
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/70 text-black"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
            <div className="my-[14px] aspect-[4/3] overflow-hidden rounded-[12px] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={readingLetter.image}
                alt={readingLetter.toName}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="m-0 whitespace-pre-line text-[15px] leading-[23px] text-[#222222]">
              {readingLetter.note}
            </p>
            <div className="mt-[16px] text-right text-[13px] font-bold text-[#484848]">
              — From {readingLetter.fromName}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Media / LIVE Player Modal */}
      {activeMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeMedia.title}
          className="fixed inset-0 z-[155] flex items-center justify-center bg-black/75 px-[16px]"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="w-full max-w-[740px] overflow-hidden rounded-[20px] bg-[#111111] text-white shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeMedia.thumbnail}
                alt={activeMedia.title}
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/45 p-[16px]">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-[10px] py-[4px] text-[11px] font-extrabold ${
                      activeMedia.kind === "live"
                        ? "bg-[#fe5b58] text-white"
                        : "bg-white/20 text-white backdrop-blur-sm"
                    }`}
                  >
                    {activeMedia.kind === "live"
                      ? `LIVE REPLAY · ${activeMedia.duration}`
                      : `VIDEO · ${activeMedia.duration}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMedia(null)}
                    aria-label="Close player"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80"
                  >
                    <CloseIcon className="h-[18px] w-[18px]" />
                  </button>
                </div>

                <div>
                  <div className="mb-[10px] h-[4px] w-full overflow-hidden rounded-full bg-white/25">
                    <div className="h-full w-[38%] rounded-full bg-[#00cbd5]" />
                  </div>
                  <div className="flex items-center justify-between gap-[12px]">
                    <div>
                      <strong className="block text-[16px] font-bold">
                        {activeMedia.title}
                      </strong>
                      <span className="text-[12px] text-white/70">
                        {activeMedia.authorName} · {activeMedia.views} views ·{" "}
                        {activeMedia.date}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLiveHeartCount((c) => c + 1)}
                      className="inline-flex h-[36px] items-center gap-[6px] rounded-full bg-[#fe5b58] px-[14px] text-[13px] font-bold text-white transition-transform active:scale-95"
                    >
                      <HeartIcon filled className="h-[16px] w-[16px]" />
                      <span>
                        {activeMedia.likes}
                        {liveHeartCount > 0 ? ` +${liveHeartCount}` : ""}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-[16px] text-[13px] leading-[20px] text-white/80">
              {activeMedia.description}
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 p-[20px]"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Close preview"
            className="absolute right-[20px] top-[20px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <CloseIcon className="h-[22px] w-[22px]" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Full resolution preview"
            className="max-h-[86vh] max-w-[92vw] rounded-[12px] object-contain"
          />
        </div>
      )}
    </div>
  );
}
