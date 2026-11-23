"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  authApi,
  followApi,
  getStoredTokens,
  interactionApi,
  postApi,
  resolveSlugForFandomName,
  type ArtistProfileDto,
  type CommentDto,
  type FollowStatusDto,
  type FollowUserDto,
  type PostDto,
  type UserProfileDto,
} from "@/lib/api";
import {
  CloseIcon,
  CommentIcon,
  DmMessageIcon,
  HeartIcon,
  MenuIcon,
  SparkleIcon,
  VerifiedBadgeIcon,
  WeverseWordmarkIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PublicUserProfileClient({ userId }: { userId: number }) {
  const {
    user,
    openLoginModal,
    openCookieModal,
    dmMode,
    setDmMode,
    showToast,
  } = useWeverseApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  const [publicUser, setPublicUser] = useState<UserProfileDto | null>(null);
  const [artistDetail, setArtistDetail] = useState<ArtistProfileDto | null>(
    null
  );
  const [followStatus, setFollowStatus] = useState<FollowStatusDto | null>(
    null
  );
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingFollow, setTogglingFollow] = useState(false);

  // Comments state
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(
    null
  );
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, CommentDto[]>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>(
    {}
  );

  // Followers / Following Modal
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<
    "followers" | "following"
  >("followers");
  const [followersList, setFollowersList] = useState<FollowUserDto[]>([]);
  const [followingList, setFollowingList] = useState<FollowUserDto[]>([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  const loadPublicProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        authApi.getPublicProfile(userId),
        postApi.getUserPosts(userId, { size: 30 }).catch(() => null),
      ]);
      setPublicUser(uRes);
      if (uRes.artistProfile) {
        setArtistDetail(uRes.artistProfile);
      } else if (uRes.role?.toUpperCase() === "ARTIST") {
        const ad = await authApi.getArtistDetail(userId).catch(() => null);
        if (ad) setArtistDetail(ad);
      }
      if (pRes) {
        setPosts(pRes.items ?? pRes.content ?? []);
      }

      if (getStoredTokens()?.accessToken && user?.id !== userId) {
        const st = await followApi.getFollowStatus(userId).catch(() => null);
        if (st) setFollowStatus(st);
      }
    } catch {
      // Ignore if not found
    } finally {
      setLoading(false);
    }
  }, [userId, user?.id]);

  useEffect(() => {
    void loadPublicProfile();
  }, [loadPublicProfile]);

  const handleToggleFollow = async () => {
    if (!user || !getStoredTokens()?.accessToken) {
      openLoginModal(() => {
        void handleToggleFollow();
      });
      return;
    }
    if (!publicUser) return;

    setTogglingFollow(true);
    try {
      const currentlyFollowing = Boolean(followStatus?.following);
      const res = currentlyFollowing
        ? await followApi.unfollowUser(publicUser.id)
        : await followApi.followUser(publicUser.id);

      setFollowStatus((prev) => ({
        targetUserId: publicUser.id,
        following: res.following,
        followedBy: prev?.followedBy ?? false,
        mutual: Boolean(res.following && prev?.followedBy),
      }));
      setPublicUser((prev) =>
        prev ? { ...prev, totalFollower: res.targetTotalFollower } : prev
      );
      showToast(
        res.following
          ? `Followed ${artistDetail?.stageName || publicUser.name}!`
          : `Unfollowed ${artistDetail?.stageName || publicUser.name}`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update follow status"
      );
    } finally {
      setTogglingFollow(false);
    }
  };

  const openFollowModal = async (tab: "followers" | "following") => {
    if (!publicUser) return;
    setFollowModalTab(tab);
    setFollowModalOpen(true);
    setLoadingFollowList(true);
    try {
      const [flwrs, flwng] = await Promise.all([
        followApi.getFollowers(publicUser.id, { size: 50 }),
        followApi.getFollowing(publicUser.id, { size: 50 }),
      ]);
      setFollowersList(flwrs.items ?? flwrs.content ?? []);
      setFollowingList(flwng.items ?? flwng.content ?? []);
    } catch {
      // Ignore
    } finally {
      setLoadingFollowList(false);
    }
  };

  const handleTogglePostLike = async (post: PostDto) => {
    if (!user || !getStoredTokens()?.accessToken) {
      openLoginModal();
      return;
    }
    try {
      const res = await interactionApi.togglePostReaction(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                reactedByMe: res.reacted,
                totalReactions: res.totalReactions,
              }
            : p
        )
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to like post");
    }
  };

  const handleToggleComments = async (postId: number) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }
    setOpenCommentsPostId(postId);
    try {
      const page = await interactionApi.getPostComments(postId, { size: 30 });
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: page.items ?? page.content ?? [],
      }));
    } catch {
      // Ignore
    }
  };

  const handleCreateComment = async (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    const text = (commentDrafts[postId] ?? "").trim();
    if (!text) return;
    if (!user || !getStoredTokens()?.accessToken) {
      openLoginModal();
      return;
    }
    try {
      await interactionApi.createComment(postId, { content: text });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      const page = await interactionApi.getPostComments(postId, { size: 30 });
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: page.items ?? page.content ?? [],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, totalComments: (p.totalComments ?? 0) + 1 }
            : p
        )
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to post comment");
    }
  };

  const displayName =
    artistDetail?.stageName || publicUser?.name || `Weverse User #${userId}`;
  const isArtist =
    publicUser?.role?.toUpperCase() === "ARTIST" || Boolean(artistDetail);
  const avatarUrl =
    artistDetail?.avatar ||
    publicUser?.avatar ||
    "/sites/weverse/artists/kep1er-logo.webp";
  const primaryFandomSlug = posts[0]?.fandomName
    ? resolveSlugForFandomName(posts[0].fandomName)
    : "illit";

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-black">
      {/* Top Header */}
      <header className="wev-header">
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-transparent text-black hover:bg-black/[0.04]"
          >
            <MenuIcon className="h-[24px] w-[24px]" />
          </button>
          <Link
            href="/"
            aria-label="Weverse Home"
            className="flex items-center text-black no-underline"
          >
            <WeverseWordmarkIcon className="h-[20px] w-[95px]" />
          </Link>
          <span className="rounded-full bg-[#f3e8ff] px-[12px] py-[4px] text-[11px] font-extrabold text-[#7c3aed] max-[600px]:hidden">
            {isArtist ? "ARTIST PROFILE" : "MEMBER PROFILE"}
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <Link
            href="/profile"
            className="rounded-full bg-[#f2f4f8] px-[14px] py-[7px] text-[12px] font-bold text-[#222222] no-underline hover:bg-[#e4e7ee]"
          >
            👤 My Profile
          </Link>
          <button
            type="button"
            onClick={() =>
              setDmMode(dmMode === "closed" ? "home" : "minimized")
            }
            aria-label="Weverse DM"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-transparent text-black hover:bg-black/[0.04]"
          >
            <DmMessageIcon className="h-[24px] w-[24px]" />
          </button>
        </div>
      </header>

      <WeverseGlobalMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => setSearchDrawerOpen(true)}
      />
      <SearchCommunitiesDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-[1060px] px-[20px] pb-[72px] pt-[80px]">
        {loading ? (
          <div className="rounded-[20px] bg-white p-[40px] text-center text-[14px] text-[#8e8e8e]">
            Loading profile...
          </div>
        ) : !publicUser ? (
          <div className="rounded-[20px] bg-white p-[40px] text-center">
            <h1 className="m-0 text-[20px] font-extrabold text-black">
              User not found
            </h1>
            <Link
              href="/"
              className="mt-[14px] inline-block rounded-full bg-[#00cbd5] px-[20px] py-[8px] text-[13px] font-bold text-white no-underline"
            >
              Back to Weverse Home
            </Link>
          </div>
        ) : (
          <div className="space-y-[20px]">
            {/* Visitor Profile Hero Card */}
            <section className="rounded-[20px] border border-black/[0.06] bg-white p-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-[16px]">
                <div className="flex items-center gap-[18px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-[84px] w-[84px] shrink-0 rounded-full border-2 border-[#00cbd5] object-cover"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-[8px]">
                      <h1 className="m-0 text-[24px] font-extrabold text-black">
                        {displayName}
                      </h1>
                      {isArtist && (
                        <VerifiedBadgeIcon className="h-[18px] w-[18px]" />
                      )}
                      <span
                        className={`rounded-full px-[10px] py-[3px] text-[11px] font-extrabold ${
                          isArtist
                            ? "bg-[#dffafb] text-[#008b94]"
                            : "bg-[#f3e8ff] text-[#7c3aed]"
                        }`}
                      >
                        {isArtist
                          ? `ARTIST${
                              artistDetail?.company?.name
                                ? ` · ${artistDetail.company.name}`
                                : ""
                            }`
                          : publicUser.memberProfile?.membershipTier || "FAN"}
                      </span>
                      {followStatus?.followedBy && (
                        <span className="rounded-full bg-[#f2f4f8] px-[10px] py-[3px] text-[11px] font-bold text-[#484848]">
                          Follows You
                        </span>
                      )}
                      {followStatus?.mutual && (
                        <span className="rounded-full bg-[#fce8ee] px-[10px] py-[3px] text-[11px] font-extrabold text-[#d6335a]">
                          🤝 Mutual Follow
                        </span>
                      )}
                    </div>
                    <p className="mb-0 mt-[6px] text-[13px] text-[#666666]">
                      {artistDetail?.bio ||
                        `Weverse ${
                          isArtist ? "Official Artist" : "Community Member"
                        }`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[10px]">
                  {user?.id === publicUser.id ? (
                    <Link
                      href="/profile"
                      className="rounded-full bg-black px-[18px] py-[9px] text-[13px] font-bold text-white no-underline"
                    >
                      ✏️ Edit My Profile
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={togglingFollow}
                      onClick={() => void handleToggleFollow()}
                      className={`h-[40px] rounded-full px-[20px] text-[13px] font-extrabold transition-colors ${
                        followStatus?.following
                          ? "border-2 border-[#00cbd5] bg-white text-[#008b94] hover:bg-[#fff2f2] hover:text-[#d63333]"
                          : "bg-[#00cbd5] text-white hover:bg-[#00b8c1]"
                      }`}
                    >
                      {followStatus?.following
                        ? "✓ Following"
                        : `+ Follow ${isArtist ? "Artist" : ""}`}
                    </button>
                  )}

                  <Link
                    href={`/${primaryFandomSlug}`}
                    className="inline-flex h-[40px] items-center rounded-full bg-[#f2f4f8] px-[16px] text-[13px] font-bold text-[#222222] no-underline hover:bg-[#e5e8ef]"
                  >
                    Community →
                  </Link>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="mt-[20px] grid grid-cols-4 gap-[12px] max-[760px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void openFollowModal("followers")}
                  className="rounded-[12px] bg-[#f7f8fa] p-[14px] text-left hover:bg-[#dffafb]/60"
                >
                  <strong className="block text-[20px] font-extrabold text-black">
                    {(publicUser.totalFollower ?? 0).toLocaleString()}
                  </strong>
                  <span className="text-[11px] font-semibold text-[#008b94]">
                    Followers
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => void openFollowModal("following")}
                  className="rounded-[12px] bg-[#f7f8fa] p-[14px] text-left hover:bg-[#dffafb]/60"
                >
                  <strong className="block text-[20px] font-extrabold text-black">
                    {(publicUser.totalFollowing ?? 0).toLocaleString()}
                  </strong>
                  <span className="text-[11px] font-semibold text-[#008b94]">
                    Following
                  </span>
                </button>

                <div className="rounded-[12px] bg-[#f7f8fa] p-[14px]">
                  <strong className="block text-[20px] font-extrabold text-black">
                    {posts.length}
                  </strong>
                  <span className="text-[11px] font-semibold text-[#666666]">
                    Published Posts
                  </span>
                </div>

                <div className="rounded-[12px] bg-[#f7f8fa] p-[14px]">
                  <strong className="block text-[18px] font-extrabold text-black">
                    {artistDetail?.debutDate
                      ? new Date(artistDetail.debutDate).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )
                      : publicUser.createdAt
                        ? new Date(publicUser.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )
                        : "Nov 2026"}
                  </strong>
                  <span className="text-[11px] font-semibold text-[#666666]">
                    {isArtist ? "Debut Date" : "Member Since"}
                  </span>
                </div>
              </div>
            </section>

            {/* Published Posts Timeline */}
            <section className="rounded-[20px] border border-black/[0.06] bg-white p-[24px] shadow-sm">
              <div className="mb-[16px] flex items-center justify-between">
                <h2 className="m-0 text-[17px] font-extrabold text-black">
                  📋 Published Posts by {displayName} ({posts.length})
                </h2>
              </div>

              {posts.length === 0 ? (
                <p className="m-0 py-[28px] text-center text-[14px] text-[#8e8e8e]">
                  No published posts yet.
                </p>
              ) : (
                <div className="space-y-[14px]">
                  {posts.map((post) => {
                    const fSlug = resolveSlugForFandomName(
                      post.fandomName || "illit"
                    );
                    const commentsOpen = openCommentsPostId === post.id;
                    const pComments = commentsByPostId[post.id] ?? [];

                    return (
                      <article
                        key={post.id}
                        className="rounded-[14px] bg-[#f7f8fa] p-[18px]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-[8px]">
                          <div className="flex items-center gap-[6px]">
                            <strong className="text-[13px] font-bold text-[#008b94]">
                              {displayName}
                            </strong>
                            {isArtist && (
                              <VerifiedBadgeIcon className="h-[13px] w-[13px]" />
                            )}
                            <span className="text-[12px] text-[#8e8e8e]">
                              · {formatDateTime(post.createdAt)}
                            </span>
                          </div>
                          {post.fandomName && (
                            <Link
                              href={`/${fSlug}`}
                              className="rounded-full bg-white px-[10px] py-[3px] text-[11px] font-bold text-[#008b94] no-underline"
                            >
                              Posted in {post.fandomName} →
                            </Link>
                          )}
                        </div>

                        {post.artistInteractions?.highlightText && (
                          <div className="mt-[8px] inline-flex items-center gap-[5px] rounded-full bg-[#dffafb] px-[10px] py-[3px] text-[11px] font-extrabold text-[#008b94]">
                            <SparkleIcon className="h-[11px] w-[11px]" />
                            <span>{post.artistInteractions.highlightText}</span>
                          </div>
                        )}

                        <p className="mb-0 mt-[10px] whitespace-pre-line text-[14px] leading-[21px] text-[#18181b]">
                          {post.content}
                        </p>

                        {post.media && post.media.length > 0 && (
                          <div className="mt-[10px] grid grid-cols-2 gap-[8px] max-[600px]:grid-cols-1">
                            {post.media.map((m) => (
                              <div
                                key={m.id}
                                className="max-h-[240px] overflow-hidden rounded-[10px] bg-white"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={m.mediaUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-[12px] flex items-center gap-[16px]">
                          <button
                            type="button"
                            onClick={() => void handleTogglePostLike(post)}
                            className={`inline-flex items-center gap-[5px] bg-transparent p-0 text-[13px] font-bold ${
                              post.reactedByMe
                                ? "text-[#fe5b58]"
                                : "text-[#666666] hover:text-black"
                            }`}
                          >
                            <HeartIcon
                              filled={post.reactedByMe}
                              className="h-[17px] w-[17px]"
                            />
                            <span>{post.totalReactions ?? 0} Reactions</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleToggleComments(post.id)}
                            className="inline-flex items-center gap-[5px] bg-transparent p-0 text-[13px] font-bold text-[#666666] hover:text-black"
                          >
                            <CommentIcon className="h-[17px] w-[17px]" />
                            <span>{post.totalComments ?? 0} Comments</span>
                          </button>
                        </div>

                        {commentsOpen && (
                          <div className="mt-[10px] rounded-[10px] bg-white p-[12px]">
                            {pComments.length === 0 ? (
                              <p className="m-0 text-[12px] text-[#8e8e8e]">
                                No comments yet.
                              </p>
                            ) : (
                              <ul className="m-0 list-none space-y-[6px] p-0">
                                {pComments.map((c) => (
                                  <li key={c.id} className="text-[13px]">
                                    <Link
                                      href={`/users/${c.author?.id ?? ""}`}
                                      className="mr-[6px] font-bold text-black no-underline hover:underline"
                                    >
                                      {c.author?.stageName || c.author?.name}
                                    </Link>
                                    <span className="text-[#333333]">
                                      {c.content}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <form
                              onSubmit={(e) =>
                                void handleCreateComment(post.id, e)
                              }
                              className="mt-[8px] flex items-center gap-[6px]"
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
                                className="h-[32px] flex-1 rounded-full border border-black/15 px-[12px] text-[12px] text-black outline-none"
                              />
                              <button
                                type="submit"
                                className="h-[32px] rounded-full bg-black px-[14px] text-[11px] font-bold text-white"
                              >
                                Post
                              </button>
                            </form>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        <div className="mt-[48px]">
          <WeverseFooter onOpenCookieSettings={openCookieModal} />
        </div>
      </main>

      {/* Followers / Following Modal */}
      {followModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Followers and Following"
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/50 px-[16px]"
          onClick={() => setFollowModalOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[460px] overflow-y-auto rounded-[20px] bg-white p-[22px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[17px] font-extrabold text-black">
                {displayName}&apos;s Network
              </h2>
              <button
                type="button"
                onClick={() => setFollowModalOpen(false)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-black hover:bg-black/[0.05]"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="mt-[12px] flex gap-[8px]">
              <button
                type="button"
                onClick={() => setFollowModalTab("followers")}
                className={`rounded-full px-[14px] py-[6px] text-[12px] font-bold ${
                  followModalTab === "followers"
                    ? "bg-black text-white"
                    : "bg-[#f2f4f8] text-[#484848]"
                }`}
              >
                Followers ({followersList.length})
              </button>
              <button
                type="button"
                onClick={() => setFollowModalTab("following")}
                className={`rounded-full px-[14px] py-[6px] text-[12px] font-bold ${
                  followModalTab === "following"
                    ? "bg-black text-white"
                    : "bg-[#f2f4f8] text-[#484848]"
                }`}
              >
                Following ({followingList.length})
              </button>
            </div>

            <div className="mt-[12px] space-y-[8px]">
              {loadingFollowList ? (
                <p className="m-0 py-[20px] text-center text-[13px] text-[#8e8e8e]">
                  Loading...
                </p>
              ) : (followModalTab === "followers"
                  ? followersList
                  : followingList
                ).length === 0 ? (
                <p className="m-0 py-[20px] text-center text-[13px] text-[#8e8e8e]">
                  No users found.
                </p>
              ) : (
                (followModalTab === "followers"
                  ? followersList
                  : followingList
                ).map((item) => (
                  <Link
                    key={item.userId}
                    href={`/users/${item.userId}`}
                    onClick={() => setFollowModalOpen(false)}
                    className="flex items-center justify-between rounded-[12px] bg-[#f7f8fa] p-[10px] text-black no-underline hover:bg-[#ebedf2]"
                  >
                    <div className="flex items-center gap-[10px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.avatar ||
                          "/sites/weverse/artists/kep1er-logo.webp"
                        }
                        alt={item.stageName || item.name}
                        className="h-[38px] w-[38px] rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-[4px]">
                          <strong className="text-[13px] font-bold">
                            {item.stageName || item.name}
                          </strong>
                          {item.verified && (
                            <VerifiedBadgeIcon className="h-[13px] w-[13px]" />
                          )}
                        </div>
                        <span className="block text-[11px] text-[#8e8e8e]">
                          {(item.totalFollower ?? 0).toLocaleString()} followers
                        </span>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[#008b94]">
                      View Profile →
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
