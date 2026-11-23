"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  authApi,
  fandomApi,
  fanLetterApi,
  followApi,
  getStoredTokens,
  interactionApi,
  postApi,
  resolveSlugForFandomName,
  type CommentDto,
  type FanLetterDto,
  type FollowUserDto,
  type MyCommunityDto,
  type PostDto,
  type ReactorDto,
  type UserProfileDto,
} from "@/lib/api";
import {
  AddCommunityIcon,
  CloseIcon,
  CommentIcon,
  DmMessageIcon,
  HeartIcon,
  JellySquircleIcon,
  MenuIcon,
  ShopSquircleIcon,
  SparkleIcon,
  UserGuestIcon,
  VerifiedBadgeIcon,
  WeverseWordmarkIcon,
} from "./icons";
import { SearchCommunitiesDrawer } from "./SearchCommunitiesDrawer";
import { useWeverseApp } from "./WeverseAppProvider";
import { WeverseFooter } from "./WeverseFooter";
import { WeverseGlobalMenuDrawer } from "./WeverseGlobalMenuDrawer";

type ProfileMainTab =
  | "posts"
  | "following-feed"
  | "fan-letters"
  | "communities"
  | "artist-studio";

const STICKER_EMOJI_MAP: Record<string, string> = {
  "heart-sparkle": "💖",
  "star-glow": "✨",
  "ribbon-bow": "🎀",
  "cherry-blossom": "🌸",
  "gold-star": "⭐",
  "music-note": "🎵",
};

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

export function ProfilePageClient() {
  const {
    user,
    allArtistsCatalog,
    joinedSlugs,
    toggleJoinCommunity,
    refreshCommunitiesFromBackend,
    logoutDemo,
    openLoginModal,
    openCookieModal,
    dmMode,
    setDmMode,
    showToast,
  } = useWeverseApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileMainTab>("posts");

  // Feeds & activity data
  const [myPosts, setMyPosts] = useState<PostDto[]>([]);
  const [followingPosts, setFollowingPosts] = useState<PostDto[]>([]);
  const [followingArtistOnly, setFollowingArtistOnly] = useState(false);
  const [followingMediaOnly, setFollowingMediaOnly] = useState(false);

  const [mySentLetters, setMySentLetters] = useState<FanLetterDto[]>([]);
  const [myCommunities, setMyCommunities] = useState<MyCommunityDto[]>([]);

  // Artist Studio & Inbox data
  const [artistInbox, setArtistInbox] = useState<FanLetterDto[]>([]);
  const [inboxVisibility, setInboxVisibility] = useState<
    "ALL" | "PUBLIC" | "PRIVATE"
  >("ALL");

  // Edit Personal Profile Form state
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Change Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Edit Artist Profile Form state
  const [artistStageName, setArtistStageName] = useState("");
  const [artistBio, setArtistBio] = useState("");
  const [artistAvatar, setArtistAvatar] = useState("");
  const [savingArtistProfile, setSavingArtistProfile] = useState(false);

  // Post Edit / Comment / Reactors states
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostContent, setEditingPostContent] = useState("");
  const [openCommentsPostId, setOpenCommentsPostId] = useState<number | null>(
    null
  );
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, CommentDto[]>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>(
    {}
  );
  const [reactorsModalPostId, setReactorsModalPostId] = useState<number | null>(
    null
  );
  const [reactorsList, setReactorsList] = useState<ReactorDto[]>([]);
  const [loadingReactors, setLoadingReactors] = useState(false);

  // Edit Fan Letter state
  const [editingLetter, setEditingLetter] = useState<FanLetterDto | null>(null);
  const [editingLetterContent, setEditingLetterContent] = useState("");
  const [editingLetterPublic, setEditingLetterPublic] = useState(true);
  const [savingLetterEdit, setSavingLetterEdit] = useState(false);

  // Followers & Following Network Modal
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<
    "followers" | "following"
  >("followers");
  const [followersList, setFollowersList] = useState<FollowUserDto[]>([]);
  const [followingList, setFollowingList] = useState<FollowUserDto[]>([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  const isArtistRole =
    profile?.role?.toUpperCase() === "ARTIST" ||
    user?.role?.toUpperCase() === "ARTIST";

  const joinedArtists = Array.from(new Set(joinedSlugs))
    .map((slug) => allArtistsCatalog.find((a) => a.slug === slug))
    .filter((a): a is (typeof allArtistsCatalog)[number] => Boolean(a));

  const loadAllProfileData = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens?.accessToken) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    try {
      const me = await authApi.getMyProfile();
      setProfile(me);
      setEditName(me.name || "");
      setEditAvatar(me.avatar || "");

      if (me.artistProfile) {
        setArtistStageName(me.artistProfile.stageName || me.name || "");
        setArtistBio(me.artistProfile.bio || "");
        setArtistAvatar(me.artistProfile.avatar || me.avatar || "");
      } else {
        setArtistStageName(me.name || "");
        setArtistAvatar(me.avatar || "");
      }

      const [postsPage, lettersPage, commsPage] = await Promise.all([
        postApi.getUserPosts(me.id, { size: 30 }).catch(() => null),
        fanLetterApi.getMySentLetters({ size: 30 }).catch(() => null),
        fandomApi.getMyCommunities({ size: 50 }).catch(() => null),
      ]);

      if (postsPage) setMyPosts(postsPage.items ?? postsPage.content ?? []);
      if (lettersPage)
        setMySentLetters(lettersPage.items ?? lettersPage.content ?? []);
      if (commsPage)
        setMyCommunities(commsPage.items ?? commsPage.content ?? []);
    } catch {
      // Handled gracefully
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadAllProfileData();
  }, [loadAllProfileData, user?.id]);

  const loadFollowingFeed = useCallback(async () => {
    if (!getStoredTokens()?.accessToken) return;
    try {
      const page = await postApi.getFollowingFeed({
        artistOnly: followingArtistOnly,
        hasMedia: followingMediaOnly,
        size: 30,
      });
      setFollowingPosts(page.items ?? page.content ?? []);
    } catch {
      // Ignore
    }
  }, [followingArtistOnly, followingMediaOnly]);

  useEffect(() => {
    void loadFollowingFeed();
  }, [loadFollowingFeed, user?.id]);

  const loadArtistInbox = useCallback(async () => {
    if (!isArtistRole || !getStoredTokens()?.accessToken) return;
    try {
      const page = await fanLetterApi.getArtistInbox({
        visibility: inboxVisibility,
        size: 30,
      });
      setArtistInbox(page.items ?? page.content ?? []);
    } catch {
      // Ignore
    }
  }, [isArtistRole, inboxVisibility]);

  useEffect(() => {
    void loadArtistInbox();
  }, [loadArtistInbox]);

  const openFollowModal = async (tab: "followers" | "following") => {
    const targetId = profile?.id ?? user?.id;
    if (!targetId) {
      openLoginModal();
      return;
    }
    setFollowModalTab(tab);
    setFollowModalOpen(true);
    setLoadingFollowList(true);
    try {
      const [flwrs, flwng] = await Promise.all([
        followApi.getFollowers(targetId, { size: 50 }),
        followApi.getFollowing(targetId, { size: 50 }),
      ]);
      setFollowersList(flwrs.items ?? flwrs.content ?? []);
      setFollowingList(flwng.items ?? flwng.content ?? []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not load follow network"
      );
    } finally {
      setLoadingFollowList(false);
    }
  };

  const handleToggleFollowInModal = async (item: FollowUserDto) => {
    if (!getStoredTokens()?.accessToken) {
      openLoginModal();
      return;
    }
    try {
      const res = item.followedByMe
        ? await followApi.unfollowUser(item.userId)
        : await followApi.followUser(item.userId);

      const updateRow = (list: FollowUserDto[]) =>
        list.map((u) =>
          u.userId === item.userId
            ? {
                ...u,
                followedByMe: res.following,
                totalFollower: res.targetTotalFollower,
              }
            : u
        );
      setFollowersList(updateRow);
      setFollowingList(updateRow);
      setProfile((prev) =>
        prev ? { ...prev, totalFollowing: res.myTotalFollowing } : prev
      );
      showToast(
        res.following
          ? `Followed ${item.stageName || item.name}!`
          : `Unfollowed ${item.stageName || item.name}`
      );
      void loadFollowingFeed();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update follow status"
      );
    }
  };

  const handleAvatarFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const uploaded = await postApi.uploadMedia(file, "avatars");
      setEditAvatar(uploaded.mediaUrl);
      if (isArtistRole) {
        setArtistAvatar(uploaded.mediaUrl);
      }
      showToast("Avatar uploaded! Click Save Profile Changes to apply.");
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Avatar upload failed. You can also paste an image URL."
      );
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleSavePersonalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    if (trimmedName.length < 2) {
      showToast("Nickname must be at least 2 characters.");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await authApi.updateMyProfile({
        name: trimmedName,
        avatar: editAvatar.trim() || null,
      });
      setProfile(updated);
      showToast("Personal profile updated successfully!");
      await refreshCommunitiesFromBackend();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changeMyPassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      showToast("Password updated successfully!");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveArtistProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistStageName.trim()) {
      showToast("Stage name is required.");
      return;
    }
    setSavingArtistProfile(true);
    try {
      const updatedArtist = await authApi.updateMyArtistProfile({
        stageName: artistStageName.trim(),
        bio: artistBio.trim() || null,
        avatar: artistAvatar.trim() || null,
      });
      setProfile((prev) =>
        prev ? { ...prev, artistProfile: updatedArtist } : prev
      );
      showToast("Official Artist Profile updated!");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update artist profile"
      );
    } finally {
      setSavingArtistProfile(false);
    }
  };

  const handleTogglePostLike = async (post: PostDto) => {
    if (!getStoredTokens()?.accessToken) {
      openLoginModal();
      return;
    }
    try {
      const res = await interactionApi.togglePostReaction(post.id);
      const syncPost = (list: PostDto[]) =>
        list.map((p) =>
          p.id === post.id
            ? {
                ...p,
                reactedByMe: res.reacted,
                totalReactions: res.totalReactions,
              }
            : p
        );
      setMyPosts(syncPost);
      setFollowingPosts(syncPost);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to like post");
    }
  };

  const handleOpenReactorsModal = async (postId: number) => {
    setReactorsModalPostId(postId);
    setLoadingReactors(true);
    try {
      const page = await interactionApi.getPostReactors(postId, { size: 50 });
      setReactorsList(page.items ?? page.content ?? []);
    } catch {
      setReactorsList([]);
    } finally {
      setLoadingReactors(false);
    }
  };

  const handleSaveEditPost = async (post: PostDto) => {
    const trimmed = editingPostContent.trim();
    if (!trimmed) return;
    try {
      const updated = await postApi.updatePost(post.id, {
        content: trimmed,
        media: (post.media ?? []).map((m) => ({
          mediaUrl: m.mediaUrl,
          thumbnail: m.thumbnail ?? m.mediaUrl,
        })),
      });
      setMyPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setFollowingPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditingPostId(null);
      showToast("Post updated!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update post");
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await postApi.deletePost(postId);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      setFollowingPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("Post deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete post");
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
    try {
      await interactionApi.createComment(postId, { content: text });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      const page = await interactionApi.getPostComments(postId, { size: 30 });
      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: page.items ?? page.content ?? [],
      }));
      const bump = (list: PostDto[]) =>
        list.map((p) =>
          p.id === postId
            ? { ...p, totalComments: (p.totalComments ?? 0) + 1 }
            : p
        );
      setMyPosts(bump);
      setFollowingPosts(bump);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to post comment");
    }
  };

  const handleSaveLetterEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter || !editingLetterContent.trim()) return;
    setSavingLetterEdit(true);
    try {
      const updated = await fanLetterApi.updateFanLetter(editingLetter.id, {
        templateId: editingLetter.template?.id ?? null,
        content: editingLetterContent.trim(),
        stickerList: editingLetter.stickerList,
        isPublic: editingLetterPublic,
      });
      setMySentLetters((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
      setEditingLetter(null);
      showToast("Fan letter updated!");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update fan letter"
      );
    } finally {
      setSavingLetterEdit(false);
    }
  };

  const handleDeleteLetter = async (letterId: number) => {
    try {
      await fanLetterApi.deleteFanLetter(letterId);
      setMySentLetters((prev) => prev.filter((l) => l.id !== letterId));
      setArtistInbox((prev) => prev.filter((l) => l.id !== letterId));
      showToast("Fan letter deleted");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete fan letter"
      );
    }
  };

  const renderPostItem = (post: PostDto, isFollowingFeedBadge = false) => {
    const canManage = Boolean(
      user &&
        (post.author?.id === user.id ||
          post.author?.id === profile?.id ||
          user.role?.toUpperCase() === "ADMIN")
    );
    const commentsOpen = openCommentsPostId === post.id;
    const postComments = commentsByPostId[post.id] ?? [];
    const fandomSlug = resolveSlugForFandomName(post.fandomName || "illit");

    return (
      <article
        key={post.id}
        className={`rounded-[16px] border bg-white p-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${
          isFollowingFeedBadge
            ? "border-[#00cbd5]/60"
            : "border-black/[0.06]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <div className="flex min-w-0 items-center gap-[10px]">
            <Link
              href={`/users/${post.author?.id ?? ""}`}
              className="flex items-center gap-[10px] text-black no-underline hover:opacity-85"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  post.author?.avatar ||
                  "/sites/weverse/artists/kep1er-logo.webp"
                }
                alt={post.author?.name || "User"}
                className="h-[38px] w-[38px] shrink-0 rounded-full object-cover"
              />
              <div>
                <div className="flex flex-wrap items-center gap-[6px]">
                  <strong className="text-[14px] font-bold text-black hover:underline">
                    {post.author?.stageName || post.author?.name}
                  </strong>
                  {post.author?.verified && (
                    <VerifiedBadgeIcon className="h-[14px] w-[14px]" />
                  )}
                  {post.artistPost ? (
                    <span className="rounded-[4px] bg-[#dffafb] px-[6px] py-[2px] text-[10px] font-extrabold text-[#009ba3]">
                      ARTIST
                    </span>
                  ) : (
                    <span className="rounded-[4px] bg-[#f3e8ff] px-[6px] py-[2px] text-[10px] font-bold text-[#7c3aed]">
                      FAN
                    </span>
                  )}
                </div>
                <span className="block text-[11px] text-[#8e8e8e]">
                  {formatDateTime(post.createdAt)}
                </span>
              </div>
            </Link>

            {post.fandomName && (
              <Link
                href={`/${fandomSlug}`}
                className="rounded-full bg-[#f2f4f8] px-[10px] py-[3px] text-[11px] font-bold text-[#009ba3] no-underline hover:bg-[#dffafb]"
              >
                in {post.fandomName} →
              </Link>
            )}
          </div>

          {canManage && (
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                onClick={() => {
                  setEditingPostId(post.id);
                  setEditingPostContent(post.content || "");
                }}
                className="rounded-[8px] bg-[#f2f4f8] px-[10px] py-[5px] text-[11px] font-bold text-[#333333] hover:bg-[#e5e8ef]"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDeletePost(post.id)}
                className="rounded-[8px] bg-[#fff2f2] px-[10px] py-[5px] text-[11px] font-bold text-[#d63333] hover:bg-[#ffe3e3]"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {post.artistInteractions?.highlightText && (
          <div className="mt-[10px] inline-flex items-center gap-[6px] rounded-full bg-[#dffafb] px-[12px] py-[4px] text-[11px] font-extrabold text-[#008b94]">
            <SparkleIcon className="h-[12px] w-[12px]" />
            <span>{post.artistInteractions.highlightText}</span>
          </div>
        )}

        {editingPostId === post.id ? (
          <div className="mt-[12px] space-y-[8px]">
            <textarea
              rows={3}
              value={editingPostContent}
              onChange={(e) => setEditingPostContent(e.target.value)}
              className="w-full rounded-[10px] border border-[#00cbd5] bg-[#f7f8fa] p-[10px] text-[14px] text-black outline-none"
            />
            <div className="flex justify-end gap-[8px]">
              <button
                type="button"
                onClick={() => setEditingPostId(null)}
                className="rounded-full border border-black/10 bg-white px-[14px] py-[6px] text-[12px] font-bold text-[#484848]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEditPost(post)}
                className="rounded-full bg-[#00cbd5] px-[16px] py-[6px] text-[12px] font-bold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-0 mt-[12px] whitespace-pre-line text-[14px] leading-[21px] text-[#222222]">
            {post.content}
          </p>
        )}

        {post.media && post.media.length > 0 && (
          <div className="mt-[12px] grid grid-cols-2 gap-[8px] max-[600px]:grid-cols-1">
            {post.media.map((m) => (
              <div
                key={m.id}
                className="max-h-[260px] overflow-hidden rounded-[12px] bg-[#f2f3f7]"
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

        <div className="mt-[14px] flex flex-wrap items-center gap-[16px] border-t border-black/[0.05] pt-[10px]">
          <div className="inline-flex items-center gap-[6px]">
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
                className="h-[18px] w-[18px]"
              />
              <span>{post.totalReactions ?? 0}</span>
            </button>
            {(post.totalReactions ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => void handleOpenReactorsModal(post.id)}
                className="bg-transparent p-0 text-[11px] font-semibold text-[#8e8e8e] underline hover:text-black"
              >
                View reactors
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleToggleComments(post.id)}
            className="inline-flex items-center gap-[5px] bg-transparent p-0 text-[13px] font-bold text-[#666666] hover:text-black"
          >
            <CommentIcon className="h-[18px] w-[18px]" />
            <span>{post.totalComments ?? 0} Comments</span>
          </button>
        </div>

        {commentsOpen && (
          <div className="mt-[12px] rounded-[12px] bg-[#f7f8fa] p-[12px]">
            {postComments.length === 0 ? (
              <p className="m-0 text-[12px] text-[#8e8e8e]">
                No comments yet. Leave the first comment!
              </p>
            ) : (
              <ul className="m-0 list-none space-y-[8px] p-0">
                {postComments.map((c) => (
                  <li
                    key={c.id}
                    className={`rounded-[8px] p-[8px] text-[13px] ${
                      c.artistComment
                        ? "border border-[#00cbd5]/40 bg-[#dffafb]/40"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-[6px]">
                      <Link
                        href={`/users/${c.author?.id ?? ""}`}
                        className="font-bold text-black no-underline hover:underline"
                      >
                        {c.author?.stageName || c.author?.name}
                      </Link>
                      {c.artistComment && (
                        <VerifiedBadgeIcon className="h-[13px] w-[13px]" />
                      )}
                      <span className="text-[11px] text-[#8e8e8e]">
                        {formatDateTime(c.createdAt)}
                      </span>
                    </div>
                    <p className="mb-0 mt-[3px] text-[#222222]">{c.content}</p>
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={(e) => void handleCreateComment(post.id, e)}
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
                placeholder="Write a comment..."
                className="h-[34px] flex-1 rounded-full border border-black/10 bg-white px-[12px] text-[13px] text-black outline-none focus:border-[#00cbd5]"
              />
              <button
                type="submit"
                className="h-[34px] rounded-full bg-black px-[14px] text-[12px] font-bold text-white"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </article>
    );
  };

  const displayName =
    profile?.artistProfile?.stageName ||
    profile?.name ||
    user?.nickname ||
    "Weverse Fan";
  const displayEmail = profile?.email || user?.email || "fan@weverse.local";
  const displayAvatar =
    profile?.artistProfile?.avatar ||
    profile?.avatar ||
    user?.avatar ||
    null;
  const displayTier =
    profile?.memberProfile?.membershipTier ||
    user?.membershipTier ||
    "GLLIT MEMBERSHIP";
  const displayLoyalty =
    profile?.memberProfile?.totalLoyaltyPoints ?? user?.jellyBalance ?? 350;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-black">
      {/* Fixed Top Global Header */}
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
          <span className="rounded-full bg-[#dffafb] px-[12px] py-[4px] text-[11px] font-extrabold text-[#009ba3] max-[600px]:hidden">
            MY PROFILE &amp; SETTINGS
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setSearchDrawerOpen((prev) => !prev)}
            className="rounded-full bg-[#f2f4f8] px-[14px] py-[7px] text-[12px] font-bold text-[#333333] hover:bg-[#e5e8ef]"
          >
            Search Communities
          </button>
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

      {/* Main Layout matching Figma Screen 1 & Screen 2 */}
      <div className="mx-auto flex max-w-[1440px] pt-[56px]">
        {/* Left Global Sidebar (Desktop) */}
        <aside className="sticky top-[56px] h-[calc(100vh-56px)] w-[248px] shrink-0 overflow-y-auto border-r border-black/[0.06] bg-white p-[16px] max-[960px]:hidden">
          {user ? (
            <div className="rounded-[14px] bg-[#f7f8fa] p-[14px]">
              <strong className="block truncate text-[15px] font-extrabold text-black">
                {displayName}
              </strong>
              <span className="mt-[2px] block truncate text-[12px] text-[#8e8e8e]">
                {displayEmail}
              </span>
              <span className="mt-[8px] inline-block rounded-full bg-[#f3e8ff] px-[9px] py-[3px] text-[10px] font-extrabold text-[#7c3aed]">
                👑 {displayTier}
              </span>
            </div>
          ) : (
            <div className="rounded-[14px] bg-[#f7f8fa] p-[14px]">
              <p className="m-0 text-[13px] text-[#666666]">
                Sign in to manage your Weverse profile &amp; follow artists.
              </p>
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="mt-[10px] h-[36px] w-full rounded-[8px] bg-[#00cbd5] text-[13px] font-bold text-white"
              >
                Sign In
              </button>
            </div>
          )}

          <nav className="mt-[16px] space-y-[4px]">
            <Link
              href="/"
              className="flex h-[42px] items-center gap-[10px] rounded-[10px] px-[12px] text-[13px] font-semibold text-[#484848] no-underline hover:bg-black/[0.04]"
            >
              <span>🏠 Discover Home</span>
            </Link>
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`flex h-[42px] w-full items-center gap-[10px] rounded-[10px] px-[12px] text-left text-[13px] font-extrabold ${
                activeTab === "posts"
                  ? "bg-[#dffafb] text-[#008b94]"
                  : "bg-transparent text-[#484848] hover:bg-black/[0.04]"
              }`}
            >
              <span>👤 My Profile &amp; Posts</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("following-feed")}
              className={`flex h-[42px] w-full items-center gap-[10px] rounded-[10px] px-[12px] text-left text-[13px] font-extrabold ${
                activeTab === "following-feed"
                  ? "bg-[#dffafb] text-[#008b94]"
                  : "bg-transparent text-[#484848] hover:bg-black/[0.04]"
              }`}
            >
              <span>✨ Following Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fan-letters")}
              className={`flex h-[42px] w-full items-center gap-[10px] rounded-[10px] px-[12px] text-left text-[13px] font-extrabold ${
                activeTab === "fan-letters"
                  ? "bg-[#dffafb] text-[#008b94]"
                  : "bg-transparent text-[#484848] hover:bg-black/[0.04]"
              }`}
            >
              <span>💌 My Sent Fan Letters</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("artist-studio")}
              className={`flex h-[42px] w-full items-center gap-[10px] rounded-[10px] px-[12px] text-left text-[13px] font-extrabold ${
                activeTab === "artist-studio"
                  ? "bg-[#fce8ee] text-[#d6335a]"
                  : "bg-transparent text-[#484848] hover:bg-black/[0.04]"
              }`}
            >
              <span>🎤 Artist Studio &amp; Inbox</span>
            </button>
            <Link
              href="/jelly"
              className="flex h-[42px] items-center justify-between rounded-[10px] px-[12px] text-[13px] font-semibold text-[#484848] no-underline hover:bg-black/[0.04]"
            >
              <span className="flex items-center gap-[8px]">
                <JellySquircleIcon className="h-[18px] w-[18px] text-[#00cbd5]" />
                <span>Jelly Shop</span>
              </span>
              <span className="font-bold text-[#00b8c1]">
                {displayLoyalty} J
              </span>
            </Link>
            <Link
              href="/shop"
              className="flex h-[42px] items-center gap-[8px] rounded-[10px] px-[12px] text-[13px] font-semibold text-[#484848] no-underline hover:bg-black/[0.04]"
            >
              <ShopSquircleIcon className="h-[18px] w-[18px] text-[#666666]" />
              <span>Weverse Shop</span>
            </Link>
          </nav>

          {/* My Communities in Sidebar */}
          <div className="mt-[20px] border-t border-black/[0.06] pt-[14px]">
            <strong className="mb-[8px] block px-[6px] text-[11px] font-extrabold uppercase tracking-wider text-[#8e8e8e]">
              My Communities ({joinedArtists.length})
            </strong>
            <ul className="m-0 list-none space-y-[4px] p-0">
              {joinedArtists.map((a) => (
                <li key={`prof-side-${a.slug}`}>
                  <Link
                    href={`/${a.slug}`}
                    className="flex h-[38px] items-center gap-[10px] rounded-[8px] px-[8px] text-[13px] font-semibold text-black no-underline hover:bg-black/[0.04]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.logoImage}
                      alt={a.name}
                      className="h-[22px] w-[22px] rounded-full object-cover"
                    />
                    <span className="truncate">{a.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setSearchDrawerOpen(true)}
                  className="mt-[4px] flex h-[38px] w-full items-center gap-[10px] rounded-[8px] px-[8px] text-left text-[13px] font-semibold text-[#009ba3] hover:bg-[#dffafb]/40"
                >
                  <AddCommunityIcon className="h-[20px] w-[20px]" />
                  <span>+ Discover More</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Profile Workspace */}
        <div className="min-w-0 flex-1 px-[28px] py-[24px] max-[673px]:px-[16px]">
          {!user && !loadingProfile ? (
            <div className="rounded-[20px] border border-black/[0.06] bg-white p-[40px] text-center shadow-sm">
              <UserGuestIcon className="mx-auto h-[48px] w-[48px] text-[#00cbd5]" />
              <h1 className="m-0 mt-[14px] text-[22px] font-extrabold text-black">
                Sign in to view your Weverse Profile
              </h1>
              <p className="mx-auto mb-0 mt-[8px] max-w-[460px] text-[14px] text-[#666666]">
                Log in with your Weverse account to edit your profile, manage
                your password, view your Followers &amp; Following network, and
                browse your Following Feed.
              </p>
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="mt-[20px] h-[44px] rounded-full bg-[#00cbd5] px-[28px] text-[14px] font-bold text-white hover:bg-[#00b8c1]"
              >
                Sign In / Sign Up
              </button>
            </div>
          ) : (
            <div className="space-y-[20px]">
              {/* Profile Hero Identity Card */}
              <section className="rounded-[20px] border border-black/[0.06] bg-white p-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                {/* Dark Navy Banner Strip */}
                <div className="flex flex-wrap items-center justify-between gap-[12px] rounded-[14px] bg-[#121c2e] px-[20px] py-[16px] text-white">
                  <div>
                    <span className="block text-[12px] font-extrabold uppercase tracking-wider text-[#00cbd5]">
                      WEVERSE PERSONAL PROFILE
                    </span>
                    <span className="mt-[2px] block text-[12px] text-white/75">
                      Manage your personal profile, community posts, fan letters,
                      and artist connections
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className="rounded-full bg-[#00cbd5] px-[12px] py-[4px] text-[11px] font-extrabold text-white">
                      {isArtistRole ? "OFFICIAL ARTIST" : "WEVERSE MEMBER"}
                    </span>
                    {profile?.id && (
                      <Link
                        href={`/users/${profile.id}`}
                        className="rounded-full bg-white/15 px-[12px] py-[4px] text-[11px] font-bold text-white no-underline hover:bg-white/25"
                      >
                        View Public Profile →
                      </Link>
                    )}
                  </div>
                </div>

                {/* Identity Row */}
                <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[16px]">
                  <div className="flex items-center gap-[18px]">
                    <div className="relative h-[84px] w-[84px] shrink-0">
                      {displayAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="h-full w-full rounded-full border-2 border-[#00cbd5] object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#00cbd5] text-[30px] font-extrabold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 rounded-full bg-black px-[8px] py-[2px] text-[10px] font-bold text-white shadow"
                      >
                        📷 Edit
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleAvatarFileSelect(e)}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-[8px]">
                        <h1 className="m-0 text-[24px] font-extrabold text-black">
                          {displayName}
                        </h1>
                        {isArtistRole && (
                          <VerifiedBadgeIcon className="h-[18px] w-[18px]" />
                        )}
                        <span className="rounded-full bg-[#f3e8ff] px-[10px] py-[3px] text-[11px] font-extrabold text-[#7c3aed]">
                          👑 {displayTier}
                        </span>
                        {profile?.artistProfile?.company?.name && (
                          <span className="rounded-full bg-[#dffafb] px-[10px] py-[3px] text-[11px] font-extrabold text-[#008b94]">
                            {profile.artistProfile.company.name}
                          </span>
                        )}
                      </div>
                      <p className="mb-0 mt-[6px] text-[13px] text-[#666666]">
                        {displayEmail} · Joined{" "}
                        {profile?.createdAt
                          ? formatDateTime(profile.createdAt)
                          : "Nov 2026"}
                        {profile?.artistProfile?.bio
                          ? ` · "${profile.artistProfile.bio}"`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-[8px]">
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="h-[36px] rounded-full bg-[#f2f4f8] px-[14px] text-[12px] font-bold text-[#222222] hover:bg-[#e5e8ef]"
                    >
                      {uploadingAvatar ? "Uploading..." : "📷 Upload Avatar"}
                    </button>
                    {isArtistRole && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("artist-studio")}
                        className="h-[36px] rounded-full bg-[#e9687e] px-[16px] text-[12px] font-bold text-white hover:opacity-90"
                      >
                        🎤 Artist Studio
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={logoutDemo}
                      className="h-[36px] rounded-full border border-black/15 bg-white px-[14px] text-[12px] font-bold text-[#484848] hover:bg-[#f7f8fa]"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* 4 Interactive Stat Counter Cards */}
                <div className="mt-[20px] grid grid-cols-4 gap-[12px] max-[800px]:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("posts")}
                    className="rounded-[12px] bg-[#f7f8fa] p-[14px] text-left transition-colors hover:bg-[#ebedf2]"
                  >
                    <strong className="block text-[20px] font-extrabold text-black">
                      {myPosts.length}
                    </strong>
                    <span className="text-[11px] font-semibold text-[#666666]">
                      Published Posts
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void openFollowModal("followers")}
                    className="rounded-[12px] bg-[#f7f8fa] p-[14px] text-left transition-colors hover:bg-[#dffafb]/60"
                  >
                    <strong className="block text-[20px] font-extrabold text-black">
                      {(profile?.totalFollower ?? 0).toLocaleString()}
                    </strong>
                    <span className="text-[11px] font-semibold text-[#008b94]">
                      Followers
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void openFollowModal("following")}
                    className="rounded-[12px] bg-[#f7f8fa] p-[14px] text-left transition-colors hover:bg-[#dffafb]/60"
                  >
                    <strong className="block text-[20px] font-extrabold text-black">
                      {(profile?.totalFollowing ?? 0).toLocaleString()}
                    </strong>
                    <span className="text-[11px] font-semibold text-[#008b94]">
                      Following
                    </span>
                  </button>

                  <Link
                    href="/jelly"
                    className="rounded-[12px] bg-[#f7f8fa] p-[14px] text-left no-underline transition-colors hover:bg-[#ebedf2]"
                  >
                    <strong className="block text-[20px] font-extrabold text-[#00b8c1]">
                      {displayLoyalty} J
                    </strong>
                    <span className="text-[11px] font-semibold text-[#666666]">
                      Loyalty Points
                    </span>
                  </Link>
                </div>

                {/* 5-Tab Bar */}
                <div className="mt-[18px] flex flex-wrap items-center gap-[8px] border-t border-black/[0.05] pt-[14px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("posts")}
                    className={`rounded-full px-[16px] py-[8px] text-[12px] font-bold transition-colors ${
                      activeTab === "posts"
                        ? "bg-black text-white"
                        : "bg-[#f2f4f8] text-[#484848] hover:bg-[#e4e7ee]"
                    }`}
                  >
                    📝 My Posts ({myPosts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("following-feed")}
                    className={`rounded-full px-[16px] py-[8px] text-[12px] font-bold transition-colors ${
                      activeTab === "following-feed"
                        ? "bg-black text-white"
                        : "bg-[#f2f4f8] text-[#484848] hover:bg-[#e4e7ee]"
                    }`}
                  >
                    ✨ Following Feed ({followingPosts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("fan-letters")}
                    className={`rounded-full px-[16px] py-[8px] text-[12px] font-bold transition-colors ${
                      activeTab === "fan-letters"
                        ? "bg-black text-white"
                        : "bg-[#f2f4f8] text-[#484848] hover:bg-[#e4e7ee]"
                    }`}
                  >
                    💌 My Sent Fan Letters ({mySentLetters.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("communities")}
                    className={`rounded-full px-[16px] py-[8px] text-[12px] font-bold transition-colors ${
                      activeTab === "communities"
                        ? "bg-black text-white"
                        : "bg-[#f2f4f8] text-[#484848] hover:bg-[#e4e7ee]"
                    }`}
                  >
                    🏛️ Joined Communities ({myCommunities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("artist-studio")}
                    className={`rounded-full px-[16px] py-[8px] text-[12px] font-bold transition-colors ${
                      activeTab === "artist-studio"
                        ? "bg-[#e9687e] text-white"
                        : "bg-[#fce8ee] text-[#d6335a] hover:opacity-90"
                    }`}
                  >
                    🎤 Artist Studio &amp; Inbox
                  </button>
                </div>
              </section>

              {/* 2-Column Workspace Grid */}
              <div className="grid grid-cols-[1fr_400px] items-start gap-[20px] max-[1120px]:grid-cols-1">
                {/* LEFT COLUMN: Active Tab Content */}
                <div className="min-w-0 space-y-[16px]">
                  {activeTab === "posts" && (
                    <>
                      <div className="flex items-center justify-between rounded-[14px] bg-white px-[18px] py-[14px] shadow-sm">
                        <h2 className="m-0 text-[16px] font-extrabold text-black">
                          My Published Posts ({myPosts.length})
                        </h2>
                      </div>

                      {myPosts.length === 0 ? (
                        <div className="rounded-[16px] bg-white p-[32px] text-center text-[14px] text-[#8e8e8e]">
                          You haven&apos;t published any community posts yet.
                          Visit a community like{" "}
                          <Link
                            href="/illit"
                            className="font-bold text-[#00b8c1]"
                          >
                            ILLIT
                          </Link>{" "}
                          to share your first post!
                        </div>
                      ) : (
                        <div className="space-y-[14px]">
                          {myPosts.map((post) => renderPostItem(post))}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "following-feed" && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-[10px] rounded-[14px] bg-white px-[18px] py-[14px] shadow-sm">
                        <div>
                          <h2 className="m-0 text-[16px] font-extrabold text-black">
                            ✨ Following Feed
                          </h2>
                          <span className="text-[11px] text-[#8e8e8e]">
                            Latest posts from artists and fans you follow
                          </span>
                        </div>
                        <div className="flex items-center gap-[6px]">
                          <button
                            type="button"
                            onClick={() => {
                              setFollowingArtistOnly(false);
                              setFollowingMediaOnly(false);
                            }}
                            className={`rounded-full px-[10px] py-[5px] text-[11px] font-bold ${
                              !followingArtistOnly && !followingMediaOnly
                                ? "bg-black text-white"
                                : "bg-[#f2f4f8] text-[#484848]"
                            }`}
                          >
                            All Posts
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFollowingArtistOnly((prev) => !prev)
                            }
                            className={`rounded-full px-[10px] py-[5px] text-[11px] font-bold ${
                              followingArtistOnly
                                ? "bg-[#00cbd5] text-white"
                                : "bg-[#f2f4f8] text-[#484848]"
                            }`}
                          >
                            Artist Only
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFollowingMediaOnly((prev) => !prev)
                            }
                            className={`rounded-full px-[10px] py-[5px] text-[11px] font-bold ${
                              followingMediaOnly
                                ? "bg-[#00cbd5] text-white"
                                : "bg-[#f2f4f8] text-[#484848]"
                            }`}
                          >
                            Media Only
                          </button>
                        </div>
                      </div>

                      {followingPosts.length === 0 ? (
                        <div className="rounded-[16px] bg-white p-[32px] text-center text-[14px] text-[#8e8e8e]">
                          No posts in your Following Feed yet. Follow artists or
                          fans from{" "}
                          <Link
                            href="/illit"
                            className="font-bold text-[#00b8c1]"
                          >
                            ILLIT
                          </Link>{" "}
                          to see their updates here!
                        </div>
                      ) : (
                        <div className="space-y-[14px]">
                          {followingPosts.map((post) =>
                            renderPostItem(post, true)
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === "fan-letters" && (
                    <div className="rounded-[16px] bg-white p-[20px] shadow-sm">
                      <div className="mb-[14px] flex items-center justify-between">
                        <h2 className="m-0 text-[16px] font-extrabold text-black">
                          💌 My Sent Fan Letters ({mySentLetters.length})
                        </h2>
                      </div>

                      {mySentLetters.length === 0 ? (
                        <p className="m-0 py-[24px] text-center text-[14px] text-[#8e8e8e]">
                          You haven&apos;t sent any fan letters yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-[12px] max-[700px]:grid-cols-1">
                          {mySentLetters.map((letter, idx) => (
                            <div
                              key={letter.id}
                              className="flex flex-col rounded-[14px] border border-black/[0.06] p-[14px]"
                              style={{
                                backgroundColor:
                                  idx % 2 === 0 ? "#fce8ee" : "#e3f2fd",
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <Link
                                  href={`/users/${letter.recipient?.userId ?? ""}`}
                                  className="text-[13px] font-extrabold text-black no-underline hover:underline"
                                >
                                  To. {letter.recipient?.stageName}
                                </Link>
                                <span className="rounded-[4px] bg-white/80 px-[6px] py-[2px] text-[10px] font-bold text-[#333333]">
                                  {letter.isPublic
                                    ? "🌐 PUBLIC"
                                    : "🔒 PRIVATE"}
                                </span>
                              </div>

                              <p className="mb-0 mt-[10px] whitespace-pre-line text-[13px] leading-[19px] text-[#222222]">
                                {letter.content}
                              </p>

                              {letter.stickerList?.length > 0 && (
                                <div className="mt-[8px] flex gap-[4px] text-[14px]">
                                  {letter.stickerList.map((st, sIdx) => (
                                    <span key={`${st.id}-${sIdx}`}>
                                      {STICKER_EMOJI_MAP[st.id] || "✨"}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="mt-auto flex items-center justify-between pt-[12px]">
                                <span className="text-[11px] text-[#666666]">
                                  {formatDateTime(letter.createdAt)}
                                </span>
                                <div className="flex items-center gap-[6px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingLetter(letter);
                                      setEditingLetterContent(letter.content);
                                      setEditingLetterPublic(letter.isPublic);
                                    }}
                                    className="rounded-[6px] bg-white px-[8px] py-[4px] text-[11px] font-bold text-black shadow-sm"
                                  >
                                    ✏️ Edit Letter
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleDeleteLetter(letter.id)
                                    }
                                    className="rounded-[6px] bg-[#fff2f2] px-[8px] py-[4px] text-[11px] font-bold text-[#d63333]"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "communities" && (
                    <div className="rounded-[16px] bg-white p-[20px] shadow-sm">
                      <div className="mb-[14px] flex items-center justify-between">
                        <h2 className="m-0 text-[16px] font-extrabold text-black">
                          🏛️ My Joined Communities ({myCommunities.length})
                        </h2>
                      </div>

                      {myCommunities.length === 0 ? (
                        <p className="m-0 py-[24px] text-center text-[14px] text-[#8e8e8e]">
                          You haven&apos;t joined any communities yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-[12px] max-[700px]:grid-cols-1">
                          {myCommunities.map((comm) => {
                            const slug = resolveSlugForFandomName(
                              comm.fandomName
                            );
                            return (
                              <div
                                key={comm.fandomId}
                                className="flex items-center justify-between gap-[12px] rounded-[12px] border border-black/[0.06] bg-[#f7f8fa] p-[14px]"
                              >
                                <Link
                                  href={`/${slug}`}
                                  className="flex min-w-0 items-center gap-[12px] text-black no-underline"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={
                                      comm.bannerUrl ||
                                      "/sites/weverse/artists/kep1er-logo.webp"
                                    }
                                    alt={comm.fandomName}
                                    className="h-[44px] w-[44px] shrink-0 rounded-[10px] object-cover"
                                  />
                                  <div className="min-w-0">
                                    <strong className="block truncate text-[15px] font-extrabold text-black">
                                      {comm.fandomName}
                                    </strong>
                                    <span className="block text-[11px] text-[#666666]">
                                      Role: {comm.myRole} ·{" "}
                                      {comm.memberCount.toLocaleString()}{" "}
                                      members
                                    </span>
                                  </div>
                                </Link>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    await toggleJoinCommunity(slug);
                                    void loadAllProfileData();
                                  }}
                                  className="shrink-0 rounded-full border border-black/15 bg-white px-[12px] py-[6px] text-[11px] font-bold text-[#484848] hover:bg-[#fff2f2] hover:text-[#d63333]"
                                >
                                  Leave
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "artist-studio" && (
                    <div className="space-y-[16px]">
                      {/* Edit Artist Profile Form */}
                      <div className="rounded-[16px] border border-[#e9687e]/40 bg-white p-[22px] shadow-sm">
                        <div className="flex items-center justify-between">
                          <h2 className="m-0 text-[17px] font-extrabold text-black">
                            🎤 Edit Official Artist Profile
                          </h2>
                          {isArtistRole && (
                            <span className="rounded-full bg-[#fce8ee] px-[10px] py-[3px] text-[10px] font-extrabold text-[#d6335a]">
                              OFFICIAL ARTIST
                            </span>
                          )}
                        </div>
                        <p className="mb-0 mt-[4px] text-[12px] text-[#666666]">
                          {isArtistRole
                            ? "Update your official Weverse Artist stage name, biography, and profile picture."
                            : "Switch to an official Artist account to customize your artist profile and read fan letters."}
                        </p>

                        <form
                          onSubmit={(e) => void handleSaveArtistProfile(e)}
                          className="mt-[14px] space-y-[12px]"
                        >
                          <div>
                            <label className="block text-[12px] font-bold text-[#484848]">
                              Stage Name
                            </label>
                            <input
                              type="text"
                              value={artistStageName}
                              onChange={(e) =>
                                setArtistStageName(e.target.value)
                              }
                              placeholder="e.g. YUNAH"
                              className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[12px] font-bold text-[#484848]">
                              Artist Biography
                            </label>
                            <textarea
                              rows={3}
                              value={artistBio}
                              onChange={(e) => setArtistBio(e.target.value)}
                              placeholder="Share your official artist introduction..."
                              className="mt-[5px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] p-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[12px] font-bold text-[#484848]">
                              Official Artist Avatar URL
                            </label>
                            <input
                              type="text"
                              value={artistAvatar}
                              onChange={(e) => setArtistAvatar(e.target.value)}
                              placeholder="/sites/weverse/community/illit/member-yunah.webp"
                              className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={savingArtistProfile || !isArtistRole}
                            className="h-[42px] w-full rounded-[10px] bg-[#e9687e] text-[13px] font-extrabold text-white hover:opacity-90 disabled:opacity-50"
                          >
                            {savingArtistProfile
                              ? "Saving Artist Profile..."
                              : "Save Artist Profile"}
                          </button>
                        </form>
                      </div>

                      {/* Artist Fan Letter Inbox */}
                      <div className="rounded-[16px] bg-white p-[22px] shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-[10px]">
                          <div>
                            <h3 className="m-0 text-[16px] font-extrabold text-black">
                              📬 Artist Fan Letter Inbox ({artistInbox.length})
                            </h3>
                            <span className="text-[11px] text-[#8e8e8e]">
                              Read public and private fan letters sent to you
                            </span>
                          </div>
                          <div className="flex items-center gap-[6px]">
                            {(["ALL", "PUBLIC", "PRIVATE"] as const).map(
                              (vis) => (
                                <button
                                  key={vis}
                                  type="button"
                                  onClick={() => setInboxVisibility(vis)}
                                  className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                                    inboxVisibility === vis
                                      ? "bg-black text-white"
                                      : "bg-[#f2f4f8] text-[#484848]"
                                  }`}
                                >
                                  {vis === "ALL"
                                    ? "All Letters"
                                    : vis === "PUBLIC"
                                      ? "Public"
                                      : "Private"}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {!isArtistRole ? (
                          <p className="m-0 mt-[14px] rounded-[12px] bg-[#f7f8fa] p-[16px] text-[13px] text-[#666666]">
                            Sign in with an official Artist account to view fan
                            letters in your Artist Inbox.
                          </p>
                        ) : artistInbox.length === 0 ? (
                          <p className="m-0 mt-[14px] py-[20px] text-center text-[13px] text-[#8e8e8e]">
                            No fan letters found in this filter.
                          </p>
                        ) : (
                          <div className="mt-[14px] grid grid-cols-2 gap-[12px] max-[700px]:grid-cols-1">
                            {artistInbox.map((l) => (
                              <div
                                key={l.id}
                                className="rounded-[14px] bg-[#fce8ee] p-[14px]"
                              >
                                <div className="flex items-center justify-between">
                                  <Link
                                    href={`/users/${l.sender?.id ?? ""}`}
                                    className="text-[12px] font-extrabold text-black no-underline hover:underline"
                                  >
                                    From: {l.sender?.name}
                                  </Link>
                                  <span className="rounded-[4px] bg-white/85 px-[6px] py-[2px] text-[10px] font-bold text-[#d6335a]">
                                    {l.isPublic
                                      ? "🌐 PUBLIC"
                                      : "🔒 PRIVATE LETTER"}
                                  </span>
                                </div>
                                <p className="mb-0 mt-[8px] text-[13px] leading-[19px] text-[#222222]">
                                  {l.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Edit Personal Profile & Change Password Forms */}
                <div className="space-y-[16px]">
                  {/* Form 1: Edit Personal Profile */}
                  <section className="rounded-[16px] border border-black/[0.06] bg-white p-[20px] shadow-sm">
                    <h2 className="m-0 text-[16px] font-extrabold text-black">
                      ✏️ Edit Personal Profile
                    </h2>
                    <span className="mt-[2px] block text-[11px] font-semibold text-[#666666]">
                      Update your display name and profile picture
                    </span>

                    <form
                      onSubmit={(e) => void handleSavePersonalProfile(e)}
                      className="mt-[14px] space-y-[12px]"
                    >
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Nickname / Display Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter display name"
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Avatar Image URL
                        </label>
                        <input
                          type="text"
                          value={editAvatar}
                          onChange={(e) => setEditAvatar(e.target.value)}
                          placeholder="/sites/weverse/artists/kep1er-logo.webp"
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Account Email
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={displayEmail}
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#ebedf2] bg-[#f2f4f8] px-[12px] text-[14px] text-[#666666] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="h-[42px] w-full rounded-[10px] bg-[#00cbd5] text-[13px] font-extrabold text-white transition-colors hover:bg-[#00b8c1] disabled:opacity-60"
                      >
                        {savingProfile
                          ? "Saving Changes..."
                          : "Save Profile Changes"}
                      </button>
                    </form>
                  </section>

                  {/* Form 2: Change Password */}
                  <section className="rounded-[16px] border border-black/[0.06] bg-white p-[20px] shadow-sm">
                    <h2 className="m-0 text-[16px] font-extrabold text-black">
                      🔒 Change Password
                    </h2>
                    <span className="mt-[2px] block text-[11px] font-semibold text-[#666666]">
                      Keep your account secure by updating your password
                    </span>

                    <form
                      onSubmit={(e) => void handleChangePassword(e)}
                      className="mt-[14px] space-y-[12px]"
                    >
                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[#484848]">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          placeholder="Re-enter new password"
                          className="mt-[5px] h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-[#f7f8fa] px-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5] focus:bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="h-[42px] w-full rounded-[10px] bg-[#141418] text-[13px] font-extrabold text-white transition-colors hover:bg-[#2a2a30] disabled:opacity-60"
                      >
                        {savingPassword
                          ? "Updating Password..."
                          : "Update Password"}
                      </button>
                    </form>
                  </section>
                </div>
              </div>
            </div>
          )}

          <div className="mt-[48px]">
            <WeverseFooter onOpenCookieSettings={openCookieModal} />
          </div>
        </div>
      </div>

      {/* Followers & Following Network Modal (Figma Screen 2 Right Panel) */}
      {followModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Followers and Following Network"
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/50 px-[16px]"
          onClick={() => setFollowModalOpen(false)}
        >
          <div
            className="max-h-[86vh] w-full max-w-[480px] overflow-y-auto rounded-[20px] border-2 border-[#00cbd5] bg-white p-[22px] shadow-[0_16px_48px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="m-0 text-[18px] font-extrabold text-black">
                  👥 Followers &amp; Following
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFollowModalOpen(false)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-black hover:bg-black/[0.05]"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="mt-[14px] flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => setFollowModalTab("followers")}
                className={`rounded-full px-[16px] py-[7px] text-[12px] font-extrabold ${
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
                className={`rounded-full px-[16px] py-[7px] text-[12px] font-extrabold ${
                  followModalTab === "following"
                    ? "bg-black text-white"
                    : "bg-[#f2f4f8] text-[#484848]"
                }`}
              >
                Following ({followingList.length})
              </button>
            </div>

            <div className="mt-[14px] space-y-[10px]">
              {loadingFollowList ? (
                <p className="m-0 py-[24px] text-center text-[13px] text-[#8e8e8e]">
                  Loading follow network...
                </p>
              ) : (followModalTab === "followers"
                  ? followersList
                  : followingList
                ).length === 0 ? (
                <p className="m-0 py-[24px] text-center text-[13px] text-[#8e8e8e]">
                  No users in this list yet.
                </p>
              ) : (
                (followModalTab === "followers"
                  ? followersList
                  : followingList
                ).map((item) => (
                  <div
                    key={item.userId}
                    className="flex items-center justify-between gap-[10px] rounded-[12px] bg-[#f7f8fa] px-[12px] py-[10px]"
                  >
                    <Link
                      href={`/users/${item.userId}`}
                      onClick={() => setFollowModalOpen(false)}
                      className="flex min-w-0 items-center gap-[10px] text-black no-underline"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.avatar ||
                          "/sites/weverse/artists/kep1er-logo.webp"
                        }
                        alt={item.stageName || item.name}
                        className="h-[40px] w-[40px] shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-[4px]">
                          <strong className="truncate text-[14px] font-bold text-black hover:underline">
                            {item.stageName || item.name}
                          </strong>
                          {item.verified && (
                            <VerifiedBadgeIcon className="h-[13px] w-[13px] shrink-0" />
                          )}
                          <span className="rounded-[4px] bg-white px-[5px] py-[1px] text-[9px] font-extrabold text-[#008b94]">
                            {item.role}
                          </span>
                        </div>
                        <span className="block text-[11px] text-[#8e8e8e]">
                          {(item.totalFollower ?? 0).toLocaleString()} followers
                        </span>
                      </div>
                    </Link>

                    {item.userId !== profile?.id && (
                      <button
                        type="button"
                        onClick={() => void handleToggleFollowInModal(item)}
                        className={`shrink-0 rounded-full px-[14px] py-[6px] text-[12px] font-bold transition-colors ${
                          item.followedByMe
                            ? "border border-[#00cbd5] bg-white text-[#008b94] hover:bg-[#fff2f2] hover:text-[#d63333]"
                            : "bg-[#00cbd5] text-white hover:bg-[#00b8c1]"
                        }`}
                      >
                        {item.followedByMe ? "✓ Following" : "+ Follow"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Fan Letter Modal (PUT /api/v1/fan-letters/{id}) */}
      {editingLetter && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit Fan Letter"
          className="fixed inset-0 z-[175] flex items-center justify-center bg-black/50 px-[16px]"
          onClick={() => setEditingLetter(null)}
        >
          <div
            className="w-full max-w-[440px] rounded-[20px] bg-white p-[24px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-extrabold text-black">
                ✏️ Edit Fan Letter to {editingLetter.recipient?.stageName}
              </h2>
              <button
                type="button"
                onClick={() => setEditingLetter(null)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-black hover:bg-black/[0.05]"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <form
              onSubmit={(e) => void handleSaveLetterEdit(e)}
              className="mt-[14px] space-y-[12px]"
            >
              <div>
                <span className="mb-[6px] block text-[12px] font-bold text-[#484848]">
                  Visibility
                </span>
                <div className="grid grid-cols-2 gap-[8px]">
                  <button
                    type="button"
                    onClick={() => setEditingLetterPublic(true)}
                    className={`h-[36px] rounded-[8px] border text-[12px] font-bold ${
                      editingLetterPublic
                        ? "border-[#00cbd5] bg-[#dffafb] text-[#008b94]"
                        : "border-black/10 bg-white text-[#666666]"
                    }`}
                  >
                    🌐 Public Wall
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLetterPublic(false)}
                    className={`h-[36px] rounded-[8px] border text-[12px] font-bold ${
                      !editingLetterPublic
                        ? "border-[#00cbd5] bg-[#dffafb] text-[#008b94]"
                        : "border-black/10 bg-white text-[#666666]"
                    }`}
                  >
                    🔒 Private
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-[6px] block text-[12px] font-bold text-[#484848]">
                  Letter Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingLetterContent}
                  onChange={(e) => setEditingLetterContent(e.target.value)}
                  className="w-full rounded-[12px] border border-[#dcdee4] bg-[#fce8ee]/60 p-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5]"
                />
              </div>

              <button
                type="submit"
                disabled={savingLetterEdit}
                className="h-[42px] w-full rounded-full bg-[#00cbd5] text-[13px] font-extrabold text-white hover:bg-[#00b8c1]"
              >
                {savingLetterEdit ? "Saving..." : "Save Letter Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Post Reactors Modal (GET /api/v1/posts/{id}/reactions) */}
      {reactorsModalPostId != null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Post Reactors"
          className="fixed inset-0 z-[175] flex items-center justify-center bg-black/50 px-[16px]"
          onClick={() => setReactorsModalPostId(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-[400px] overflow-y-auto rounded-[18px] bg-white p-[20px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[16px] font-extrabold text-black">
                ❤️ People Who Liked This Post
              </h2>
              <button
                type="button"
                onClick={() => setReactorsModalPostId(null)}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-black hover:bg-black/[0.05]"
              >
                <CloseIcon className="h-[16px] w-[16px]" />
              </button>
            </div>
            <div className="mt-[12px] space-y-[8px]">
              {loadingReactors ? (
                <p className="m-0 py-[16px] text-center text-[13px] text-[#8e8e8e]">
                  Loading reactors...
                </p>
              ) : reactorsList.length === 0 ? (
                <p className="m-0 py-[16px] text-center text-[13px] text-[#8e8e8e]">
                  No reactions yet.
                </p>
              ) : (
                reactorsList.map((r) => (
                  <Link
                    key={r.userId}
                    href={`/users/${r.userId}`}
                    onClick={() => setReactorsModalPostId(null)}
                    className="flex items-center gap-[10px] rounded-[10px] bg-[#f7f8fa] p-[8px] text-black no-underline hover:bg-[#ebedf2]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        r.avatar || "/sites/weverse/artists/kep1er-logo.webp"
                      }
                      alt={r.stageName || r.name}
                      className="h-[34px] w-[34px] rounded-full object-cover"
                    />
                    <div className="flex items-center gap-[5px]">
                      <strong className="text-[13px] font-bold">
                        {r.stageName || r.name}
                      </strong>
                      {r.verified && (
                        <VerifiedBadgeIcon className="h-[13px] w-[13px]" />
                      )}
                      <span className="rounded-[4px] bg-white px-[5px] py-[1px] text-[9px] font-bold text-[#008b94]">
                        {r.role}
                      </span>
                    </div>
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
