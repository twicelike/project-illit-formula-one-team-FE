"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fandomApi,
  fanLetterApi,
  getStoredTokens,
  interactionApi,
  postApi,
  type ArtistProfileDto,
  type CommentDto,
  type FandomDetailDto,
  type FandomMediaGalleryItemDto,
  type FanLetterDto,
  type LetterTemplateDto,
  type MediaItemInput,
  type PostDto,
  type StickerItemDto,
} from "@/lib/api";
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
  SparkleIcon,
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

const STICKER_PRESETS: Array<{
  id: string;
  emoji: string;
  label: string;
  defaultX: number;
  defaultY: number;
}> = [
  { id: "heart-sparkle", emoji: "💖", label: "Sparkle Heart", defaultX: 20, defaultY: 18 },
  { id: "star-glow", emoji: "✨", label: "Magic Stars", defaultX: 82, defaultY: 16 },
  { id: "ribbon-bow", emoji: "🎀", label: "Pink Ribbon", defaultX: 18, defaultY: 78 },
  { id: "cherry-blossom", emoji: "🌸", label: "Blossom", defaultX: 84, defaultY: 76 },
  { id: "gold-star", emoji: "⭐", label: "Lucky Star", defaultX: 50, defaultY: 14 },
  { id: "music-note", emoji: "🎵", label: "Melody", defaultX: 52, defaultY: 82 },
];

function getStickerEmoji(stickerId: string): string {
  return (
    STICKER_PRESETS.find((s) => s.id === stickerId)?.emoji || "✨"
  );
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommunityPageClient({
  bundle,
}: {
  bundle: CommunityDetailBundle;
}) {
  const {
    user,
    fandomsBySlug,
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
  const beSummary = fandomsBySlug[artist.slug];

  const [fandomDetail, setFandomDetail] = useState<FandomDetailDto | null>(
    null
  );
  const [beFanPosts, setBeFanPosts] = useState<PostDto[]>([]);
  const [beArtistPosts, setBeArtistPosts] = useState<PostDto[]>([]);
  const [beMediaGallery, setBeMediaGallery] = useState<
    FandomMediaGalleryItemDto[]
  >([]);
  const [beFanLetters, setBeFanLetters] = useState<FanLetterDto[]>([]);
  const [mySentLetters, setMySentLetters] = useState<FanLetterDto[]>([]);
  const [artistInboxLetters, setArtistInboxLetters] = useState<FanLetterDto[]>(
    []
  );
  const [letterTemplates, setLetterTemplates] = useState<LetterTemplateDto[]>(
    []
  );

  // Feed filter & sort states
  const [fanSortBy, setFanSortBy] = useState<"latest" | "popular">("latest");
  const [fanHasMediaOnly, setFanHasMediaOnly] = useState(false);
  const [artistSortBy, setArtistSortBy] = useState<"latest" | "popular">(
    "latest"
  );
  const [artistHasMediaOnly, setArtistHasMediaOnly] = useState(false);

  // Post composer & edit states
  const [activeTab, setActiveTab] = useState<CommunityTab>("Highlight");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileScrolled, setMobileScrolled] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(
    bundle.members[0]?.name ?? null
  );

  const [newPostText, setNewPostText] = useState("");
  const [newPostMedia, setNewPostMedia] = useState<MediaItemInput[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [publishingPost, setPublishingPost] = useState(false);
  const [showPostComposer, setShowPostComposer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostText, setEditingPostText] = useState("");

  // Comments & nested replies states (for BE posts + static posts)
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
    null
  );
  const [beCommentsByPostId, setBeCommentsByPostId] = useState<
    Record<number, CommentDto[]>
  >({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<
    number | null
  >(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {}
  );
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null
  );
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Fan letter states
  const [letterViewMode, setLetterViewMode] = useState<
    "wall" | "my-sent" | "artist-inbox"
  >("wall");
  const [letterFilterArtistId, setLetterFilterArtistId] = useState<
    number | null
  >(null);
  const [extraLetters, setExtraLetters] = useState<CommunityFanLetter[]>([]);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterTo, setLetterTo] = useState(artist.name);
  const [selectedRecipientArtistId, setSelectedRecipientArtistId] = useState<
    number | null
  >(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [letterIsPublic, setLetterIsPublic] = useState(true);
  const [selectedStickerIds, setSelectedStickerIds] = useState<string[]>([
    "heart-sparkle",
  ]);
  const [letterBody, setLetterBody] = useState("");
  const [letterBg, setLetterBg] = useState(LETTER_THEMES[0]);
  const [sendingLetter, setSendingLetter] = useState(false);
  const [readingLetter, setReadingLetter] =
    useState<CommunityFanLetter | null>(null);

  const [activeMedia, setActiveMedia] = useState<CommunityMediaItem | null>(
    null
  );
  const [liveHeartCount, setLiveHeartCount] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const resolvedFandomId = fandomDetail?.id ?? beSummary?.id ?? null;

  const isJoined = Boolean(
    user &&
      (fandomDetail?.joined ||
        beSummary?.joined ||
        joinedSlugs.includes(artist.slug))
  );

  useEffect(() => {
    const onScroll = () => {
      setMobileScrolled(window.scrollY > 240);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Load Fandom Detail, Templates & Media Gallery from BE
  const loadCommunityDataFromBe = useCallback(async () => {
    let targetId = beSummary?.id ?? null;
    if (!targetId) {
      try {
        const searchPage = await fandomApi.discoverFandoms({
          keyword: artist.name,
          size: 10,
        });
        const match = searchPage.content.find(
          (f) => f.name.toLowerCase() === artist.name.toLowerCase()
        );
        if (match) targetId = match.id;
      } catch {
        // Backend offline; use static fallback seamlessly
        return;
      }
    }
    if (!targetId) return;

    try {
      const [detail, templates, gallery] = await Promise.all([
        fandomApi.getFandomDetail(targetId),
        fanLetterApi.getLetterTemplates().catch(() => []),
        postApi.getFandomMediaGallery(targetId).catch(() => null),
      ]);
      setFandomDetail(detail);
      setLetterTemplates(templates);
      if (templates.length > 0 && selectedTemplateId == null) {
        setSelectedTemplateId(templates[0].id);
      }
      if (detail.artists.length > 0 && selectedRecipientArtistId == null) {
        setSelectedRecipientArtistId(detail.artists[0].userId);
        setLetterTo(detail.artists[0].stageName);
      }
      if (gallery) {
        setBeMediaGallery(gallery.content);
      }
    } catch {
      // Ignore error when backend is unreachable
    }
  }, [
    artist.name,
    beSummary?.id,
    selectedRecipientArtistId,
    selectedTemplateId,
  ]);

  useEffect(() => {
    void loadCommunityDataFromBe();
  }, [loadCommunityDataFromBe, user?.id]);

  // Load Fan & Artist Feeds from BE whenever sort/filter changes
  const loadFeedsFromBe = useCallback(async () => {
    if (!resolvedFandomId) return;
    try {
      const [fanRes, artistRes] = await Promise.all([
        postApi.getFandomFeed(resolvedFandomId, {
          tab: "FAN",
          sortBy: fanSortBy,
          hasMedia: fanHasMediaOnly,
          size: 30,
        }),
        postApi.getFandomFeed(resolvedFandomId, {
          tab: "ARTIST",
          sortBy: artistSortBy,
          hasMedia: artistHasMediaOnly,
          size: 30,
        }),
      ]);
      setBeFanPosts(fanRes.content);
      setBeArtistPosts(artistRes.content);
    } catch {
      // Keep existing state
    }
  }, [
    resolvedFandomId,
    fanSortBy,
    fanHasMediaOnly,
    artistSortBy,
    artistHasMediaOnly,
  ]);

  useEffect(() => {
    void loadFeedsFromBe();
  }, [loadFeedsFromBe, user?.id]);

  // Load Fan Letters from BE
  const loadLettersFromBe = useCallback(async () => {
    if (!resolvedFandomId) return;
    try {
      const wall = await fanLetterApi.getFandomFanLetters(resolvedFandomId, {
        artistId: letterFilterArtistId ?? undefined,
        size: 30,
      });
      setBeFanLetters(wall.content);

      if (user && getStoredTokens()?.accessToken) {
        const sent = await fanLetterApi
          .getMySentLetters({
            artistId: letterFilterArtistId ?? undefined,
            size: 30,
          })
          .catch(() => null);
        if (sent) setMySentLetters(sent.content);

        if (user.role?.toUpperCase() === "ARTIST") {
          const inbox = await fanLetterApi
            .getArtistInbox({ visibility: "ALL", size: 30 })
            .catch(() => null);
          if (inbox) setArtistInboxLetters(inbox.content);
        }
      }
    } catch {
      // Ignore when offline
    }
  }, [resolvedFandomId, letterFilterArtistId, user]);

  useEffect(() => {
    void loadLettersFromBe();
  }, [loadLettersFromBe]);

  // Combine BE artist members with rich local member metadata
  const displayMembers = useMemo(() => {
    const beArtists: ArtistProfileDto[] = fandomDetail?.artists ?? [];
    if (beArtists.length === 0) {
      return bundle.members.map((m) => ({
        ...m,
        userId: undefined as number | undefined,
        followersCount: undefined as number | undefined,
      }));
    }

    return beArtists.map((beArtist, idx) => {
      const staticMatch = bundle.members.find(
        (m) => m.name.toLowerCase() === beArtist.stageName.toLowerCase()
      );
      return {
        userId: beArtist.userId,
        name: beArtist.stageName,
        birthday:
          staticMatch?.birthday ||
          (beArtist.debutDate
            ? new Date(beArtist.debutDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ["Jan 15", "May 11", "Oct 08", "Jun 26", "Feb 04"][idx % 5]),
        avatar:
          staticMatch?.avatar ||
          beArtist.avatar ||
          artist.logoImage,
        bio:
          staticMatch?.bio ||
          beArtist.bio ||
          `Official ${artist.name} artist on Weverse.`,
        followersCount: beArtist.followersCount,
      };
    });
  }, [fandomDetail?.artists, bundle.members, artist.logoImage, artist.name]);

  const mapBePostToCommunityPost = useCallback(
    (p: PostDto): CommunityPost & { bePost: PostDto } => ({
      id: `be-post-${p.id}`,
      type: p.artistPost ? "artist" : "fan",
      authorName: p.author?.stageName || p.author?.name || "Weverse User",
      authorAvatar:
        p.author?.avatar || artist.logoImage,
      verified: Boolean(p.author?.verified || p.artistPost),
      membershipBadge: !p.artistPost,
      timestamp: formatDateTime(p.createdAt),
      body: p.content || "",
      images: (p.media ?? []).map((m) => m.mediaUrl),
      likes: p.totalReactions ?? 0,
      comments: [],
      bePost: p,
    }),
    [artist.logoImage]
  );

  const combinedFanPosts = useMemo(() => {
    const fromBe = beFanPosts.map(mapBePostToCommunityPost);
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
    return [...fromBe, ...mine, ...bundle.fanPosts];
  }, [
    beFanPosts,
    mapBePostToCommunityPost,
    userPosts,
    artist.slug,
    artist.logoImage,
    bundle.fanPosts,
  ]);

  const combinedArtistPosts = useMemo(() => {
    const fromBe = beArtistPosts.map(mapBePostToCommunityPost);
    return [...fromBe, ...bundle.artistPosts];
  }, [beArtistPosts, mapBePostToCommunityPost, bundle.artistPosts]);

  const mapBeLetterToCard = useCallback(
    (l: FanLetterDto, idx: number): CommunityFanLetter & { beLetter: FanLetterDto } => ({
      id: `be-letter-${l.id}`,
      toName: l.recipient?.stageName || artist.name,
      fromName: l.sender?.name || "Weverse Fan",
      image:
        l.backgroundImage?.mediaUrl ||
        l.template?.imageUrl ||
        l.recipient?.avatar ||
        artist.logoImage,
      note: l.content,
      accentBg: LETTER_THEMES[idx % LETTER_THEMES.length],
      beLetter: l,
    }),
    [artist.name, artist.logoImage]
  );

  const allLetters = useMemo(() => {
    if (letterViewMode === "my-sent") {
      return mySentLetters.map(mapBeLetterToCard);
    }
    if (letterViewMode === "artist-inbox") {
      return artistInboxLetters.map(mapBeLetterToCard);
    }
    const fromBe = beFanLetters.map(mapBeLetterToCard);
    const filteredStatic = letterFilterArtistId
      ? []
      : [...extraLetters, ...bundle.fanLetters];
    return [...fromBe, ...filteredStatic];
  }, [
    letterViewMode,
    mySentLetters,
    artistInboxLetters,
    beFanLetters,
    mapBeLetterToCard,
    letterFilterArtistId,
    extraLetters,
    bundle.fanLetters,
  ]);

  const combinedMedia = useMemo(() => {
    const fromBe: CommunityMediaItem[] = beMediaGallery.map((g) => ({
      id: `be-media-${g.mediaId}`,
      kind: "video",
      title: `${g.authorName}'s Community Photo`,
      authorName: g.authorName,
      authorAvatar: artist.logoImage,
      thumbnail: g.mediaUrl,
      duration: "PHOTO",
      date: formatDateTime(g.createdAt),
      views: "1.2K",
      likes: "240",
      description: `Uploaded in ${artist.name} community feed.`,
    }));
    return [...bundle.media, ...fromBe];
  }, [beMediaGallery, bundle.media, artist.logoImage, artist.name]);

  // Handle file upload for Post Composer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!user) {
      openLoginModal();
      return;
    }

    setUploadingMedia(true);
    try {
      for (const file of Array.from(files)) {
        try {
          const uploaded = await postApi.uploadMedia(file, "posts");
          setNewPostMedia((prev) => [
            ...prev,
            { mediaUrl: uploaded.mediaUrl, thumbnail: uploaded.mediaUrl },
          ]);
        } catch (err) {
          showToast(
            err instanceof Error
              ? err.message
              : "Upload failed. You can also attach an image URL below."
          );
        }
      }
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!/^(https?:\/\/|\/)/.test(trimmed)) {
      showToast("Image URL must start with https://, http://, or /");
      return;
    }
    setNewPostMedia((prev) => [
      ...prev,
      { mediaUrl: trimmed, thumbnail: trimmed },
    ]);
    setImageUrlInput("");
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }
    if (!newPostText.trim() && newPostMedia.length === 0) return;

    if (resolvedFandomId && getStoredTokens()?.accessToken) {
      setPublishingPost(true);
      try {
        if (!isJoined) {
          await toggleJoinCommunity(artist.slug);
        }
        const created = await postApi.createPost(resolvedFandomId, {
          content: newPostText.trim() || undefined,
          media: newPostMedia.length > 0 ? newPostMedia : undefined,
        });
        if (created.artistPost) {
          setBeArtistPosts((prev) => [created, ...prev]);
        } else {
          setBeFanPosts((prev) => [created, ...prev]);
        }
        setNewPostText("");
        setNewPostMedia([]);
        setShowPostComposer(false);
        showToast("Post published to Weverse!");
        if (newPostMedia.length > 0) {
          void loadCommunityDataFromBe();
        }
        return;
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Could not publish post"
        );
        return;
      } finally {
        setPublishingPost(false);
      }
    }

    createFanPost(artist.slug, newPostText);
    setNewPostText("");
    setNewPostMedia([]);
    setShowPostComposer(false);
  };

  const handleSaveEditPost = async (bePost: PostDto) => {
    const trimmed = editingPostText.trim();
    if (!trimmed) return;
    try {
      const updated = await postApi.updatePost(bePost.id, {
        content: trimmed,
        media: (bePost.media ?? []).map((m) => ({
          mediaUrl: m.mediaUrl,
          thumbnail: m.thumbnail ?? m.mediaUrl,
        })),
      });
      setBeFanPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setBeArtistPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditingPostId(null);
      showToast("Post updated!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update post");
    }
  };

  const handleDeleteBePost = async (postId: number) => {
    try {
      await postApi.deletePost(postId);
      setBeFanPosts((prev) => prev.filter((p) => p.id !== postId));
      setBeArtistPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("Post deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const handleTogglePostLike = async (
    post: CommunityPost & { bePost?: PostDto }
  ) => {
    if (post.bePost) {
      if (!user || !getStoredTokens()?.accessToken) {
        openLoginModal(() => {
          void handleTogglePostLike(post);
        });
        return;
      }
      const targetId = post.bePost.id;
      try {
        const res = await interactionApi.togglePostReaction(targetId);
        const updater = (list: PostDto[]) =>
          list.map((p) =>
            p.id === targetId
              ? {
                  ...p,
                  reactedByMe: res.reacted,
                  totalReactions: res.totalReactions,
                }
              : p
          );
        setBeFanPosts(updater);
        setBeArtistPosts(updater);
        return;
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Could not toggle reaction"
        );
        return;
      }
    }
    toggleLikePost(post.id);
  };

  const handleToggleCommentsSection = async (
    post: CommunityPost & { bePost?: PostDto }
  ) => {
    if (openCommentsPostId === post.id) {
      setOpenCommentsPostId(null);
      return;
    }
    setOpenCommentsPostId(post.id);

    if (post.bePost) {
      const beId = post.bePost.id;
      setLoadingCommentsPostId(beId);
      try {
        const page = await interactionApi.getPostComments(beId, {
          sortBy: "latest",
          size: 40,
        });
        setBeCommentsByPostId((prev) => ({
          ...prev,
          [beId]: page.content,
        }));
      } catch {
        // Fallback if offline
      } finally {
        setLoadingCommentsPostId(null);
      }
    }
  };

  const refreshBeCommentsForPost = async (bePostId: number) => {
    try {
      const page = await interactionApi.getPostComments(bePostId, {
        sortBy: "latest",
        size: 40,
      });
      setBeCommentsByPostId((prev) => ({
        ...prev,
        [bePostId]: page.content,
      }));
    } catch {
      // Ignore
    }
  };

  const handleSubmitComment = async (
    post: CommunityPost & { bePost?: PostDto },
    e: React.FormEvent
  ) => {
    e.preventDefault();
    const text = (commentDrafts[post.id] ?? "").trim();
    if (!text) return;

    if (!user) {
      openLoginModal(() => {
        if (!post.bePost) {
          addPostComment(post.id, text);
          setCommentDrafts((prev) => ({ ...prev, [post.id]: "" }));
        }
      });
      return;
    }

    if (post.bePost && getStoredTokens()?.accessToken) {
      const bePostId = post.bePost.id;
      try {
        await interactionApi.createComment(bePostId, { content: text });
        setCommentDrafts((prev) => ({ ...prev, [post.id]: "" }));
        await refreshBeCommentsForPost(bePostId);
        const bumpCount = (list: PostDto[]) =>
          list.map((p) =>
            p.id === bePostId
              ? { ...p, totalComments: (p.totalComments ?? 0) + 1 }
              : p
          );
        setBeFanPosts(bumpCount);
        setBeArtistPosts(bumpCount);
        return;
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Could not post comment"
        );
        return;
      }
    }

    addPostComment(post.id, text);
    setCommentDrafts((prev) => ({ ...prev, [post.id]: "" }));
  };

  const handleSubmitReply = async (
    bePostId: number,
    parentCommentId: number,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    const text = (replyDrafts[parentCommentId] ?? "").trim();
    if (!text) return;
    if (!user || !getStoredTokens()?.accessToken) {
      openLoginModal();
      return;
    }

    try {
      await interactionApi.createComment(bePostId, {
        content: text,
        parentId: parentCommentId,
      });
      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: "" }));
      setReplyingToCommentId(null);
      await refreshBeCommentsForPost(bePostId);
      const bumpCount = (list: PostDto[]) =>
        list.map((p) =>
          p.id === bePostId
            ? { ...p, totalComments: (p.totalComments ?? 0) + 1 }
            : p
        );
      setBeFanPosts(bumpCount);
      setBeArtistPosts(bumpCount);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not post reply");
    }
  };

  const handleLoadAllReplies = async (bePostId: number, commentId: number) => {
    try {
      const res = await interactionApi.getCommentReplies(commentId, {
        size: 50,
      });
      setBeCommentsByPostId((prev) => ({
        ...prev,
        [bePostId]: (prev[bePostId] ?? []).map((c) =>
          c.id === commentId ? { ...c, previewReplies: res.content } : c
        ),
      }));
    } catch {
      // Ignore
    }
  };

  const handleToggleCommentLike = async (
    bePostId: number,
    commentId: number
  ) => {
    if (!user || !getStoredTokens()?.accessToken) {
      openLoginModal();
      return;
    }
    try {
      await interactionApi.toggleCommentReaction(commentId);
      await refreshBeCommentsForPost(bePostId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not like comment");
    }
  };

  const handleSaveEditComment = async (bePostId: number, commentId: number) => {
    const trimmed = editingCommentText.trim();
    if (!trimmed) return;
    try {
      await interactionApi.updateComment(commentId, { content: trimmed });
      setEditingCommentId(null);
      await refreshBeCommentsForPost(bePostId);
      showToast("Comment updated");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update comment"
      );
    }
  };

  const handleDeleteBeComment = async (bePostId: number, commentId: number) => {
    try {
      await interactionApi.deleteComment(commentId);
      await refreshBeCommentsForPost(bePostId);
      showToast("Comment deleted");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete comment"
      );
    }
  };

  const toggleStickerSelection = (stickerId: string) => {
    setSelectedStickerIds((prev) =>
      prev.includes(stickerId)
        ? prev.filter((id) => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }
    if (!letterBody.trim()) return;

    const targetArtistId =
      selectedRecipientArtistId ??
      displayMembers.find((m) => m.userId != null)?.userId ??
      null;

    if (targetArtistId && getStoredTokens()?.accessToken) {
      setSendingLetter(true);
      try {
        const stickerList: StickerItemDto[] = selectedStickerIds.map(
          (id, idx) => {
            const preset = STICKER_PRESETS.find((p) => p.id === id);
            return {
              id,
              x: preset?.defaultX ?? 20 + idx * 15,
              y: preset?.defaultY ?? 20,
              scale: 1.0,
              rotation: 0,
            };
          }
        );

        await fanLetterApi.createFanLetter({
          artistId: targetArtistId,
          templateId: selectedTemplateId,
          content: letterBody.trim(),
          stickerList,
          isPublic: letterIsPublic,
        });

        setLetterBody("");
        setShowLetterModal(false);
        showToast(
          `Fan letter sent to ${letterTo} (${
            letterIsPublic ? "Public Wall" : "Private"
          })!`
        );
        await loadLettersFromBe();
        return;
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Failed to send fan letter"
        );
        return;
      } finally {
        setSendingLetter(false);
      }
    }

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

  const handleDeleteBeLetter = async (letterId: number) => {
    try {
      await fanLetterApi.deleteFanLetter(letterId);
      setReadingLetter(null);
      showToast("Fan letter deleted");
      await loadLettersFromBe();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete fan letter"
      );
    }
  };

  const renderPostCard = (
    post: CommunityPost & { bePost?: PostDto },
    compact = false
  ) => {
    const bePost = post.bePost;
    const isLiked = bePost
      ? bePost.reactedByMe
      : likedPostIds.includes(post.id);
    const totalLikes = bePost
      ? bePost.totalReactions
      : post.likes + (isLiked ? 1 : 0);

    const beComments = bePost ? beCommentsByPostId[bePost.id] ?? [] : [];
    const extraComments = postComments[post.id] ?? [];
    const allStaticComments = [...post.comments, ...extraComments];
    const totalCommentsCount = bePost
      ? bePost.totalComments ?? beComments.length
      : allStaticComments.length;

    const commentsVisible = openCommentsPostId === post.id;
    const isMyBePost = Boolean(
      bePost &&
        user &&
        (bePost.author?.id === user.id || user.role?.toUpperCase() === "ADMIN")
    );
    const artistHighlight = bePost?.artistInteractions?.highlightText;

    return (
      <article
        key={post.id}
        className={`rounded-[14px] border border-black/[0.05] bg-white ${
          compact ? "p-[14px]" : "p-[18px]"
        }`}
      >
        <div className="flex items-center justify-between gap-[10px]">
          <div className="flex min-w-0 items-center gap-[10px]">
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
                {post.verified ? (
                  <span className="inline-flex h-[16px] shrink-0 items-center rounded-[4px] bg-[#dffafb] px-[5px] text-[9px] font-extrabold text-[#009ba3]">
                    ARTIST
                  </span>
                ) : (
                  post.membershipBadge && (
                    <span className="inline-flex h-[16px] shrink-0 items-center rounded-[4px] bg-[#f3e8ff] px-[5px] text-[9px] font-bold text-[#7c3aed]">
                      MEMBERSHIP
                    </span>
                  )
                )}
              </div>
              <span className="block text-[11px] leading-[15px] text-[#8e8e8e]">
                {post.timestamp}
              </span>
            </div>
          </div>

          {isMyBePost && bePost && (
            <div className="flex shrink-0 items-center gap-[6px]">
              <button
                type="button"
                onClick={() => {
                  setEditingPostId(bePost.id);
                  setEditingPostText(bePost.content || "");
                }}
                className="rounded-[6px] bg-[#f7f8fa] px-[8px] py-[4px] text-[11px] font-semibold text-[#484848] hover:bg-[#ebedf2]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteBePost(bePost.id)}
                className="rounded-[6px] bg-[#fff2f2] px-[8px] py-[4px] text-[11px] font-semibold text-[#d63333] hover:bg-[#ffe4e4]"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Special Weverse Highlight Badge when Artist replied or liked */}
        {artistHighlight && (
          <div className="mt-[10px] inline-flex items-center gap-[6px] rounded-full bg-gradient-to-r from-[#dffafb] to-[#fce8ee] px-[11px] py-[4px] text-[11px] font-extrabold text-[#111111]">
            <SparkleIcon className="h-[12px] w-[12px] text-[#00b8c1]" />
            <span>{artistHighlight}</span>
          </div>
        )}

        {bePost && editingPostId === bePost.id ? (
          <div className="mt-[10px] space-y-[8px]">
            <textarea
              rows={3}
              value={editingPostText}
              onChange={(e) => setEditingPostText(e.target.value)}
              className="w-full rounded-[10px] border border-[#00cbd5] bg-[#f7f8fa] p-[10px] text-[13px] text-black outline-none"
            />
            <div className="flex justify-end gap-[6px]">
              <button
                type="button"
                onClick={() => setEditingPostId(null)}
                className="rounded-full border border-black/10 bg-white px-[12px] py-[5px] text-[12px] font-semibold text-[#484848]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEditPost(bePost)}
                className="rounded-full bg-[#00cbd5] px-[14px] py-[5px] text-[12px] font-bold text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-0 mt-[10px] whitespace-pre-line text-[14px] leading-[21px] text-[#222222]">
            {post.body}
          </p>
        )}

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
            onClick={() => void handleTogglePostLike(post)}
            className={`inline-flex items-center gap-[5px] bg-transparent p-0 text-[13px] font-semibold transition-colors ${
              isLiked ? "text-[#fe5b58]" : "text-[#666666] hover:text-black"
            }`}
          >
            <HeartIcon filled={isLiked} className="h-[18px] w-[18px]" />
            <span>{formatCount(totalLikes)}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleToggleCommentsSection(post)}
            className="inline-flex items-center gap-[5px] bg-transparent p-0 text-[13px] font-semibold text-[#666666] transition-colors hover:text-black"
          >
            <CommentIcon className="h-[18px] w-[18px]" />
            <span>{totalCommentsCount}</span>
          </button>
        </div>

        {commentsVisible && (
          <div className="mt-[12px] rounded-[10px] bg-[#f7f8fa] p-[12px]">
            {bePost ? (
              loadingCommentsPostId === bePost.id ? (
                <p className="m-0 text-[12px] text-[#8e8e8e]">
                  Loading comments...
                </p>
              ) : beComments.length === 0 ? (
                <p className="m-0 text-[12px] text-[#8e8e8e]">
                  Be the first to leave a cheering comment!
                </p>
              ) : (
                <ul className="m-0 list-none space-y-[10px] p-0">
                  {beComments.map((c) => {
                    const isMyComment = Boolean(
                      user &&
                        (c.author?.id === user.id ||
                          user.role?.toUpperCase() === "ADMIN")
                    );
                    const replies = c.previewReplies ?? [];

                    return (
                      <li
                        key={c.id}
                        className={`rounded-[10px] p-[10px] text-[13px] leading-[18px] ${
                          c.artistComment
                            ? "border border-[#00cbd5]/40 bg-[#dffafb]/35"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-[8px]">
                          <div className="flex items-center gap-[5px]">
                            <span className="font-bold text-black">
                              {c.author?.stageName || c.author?.name}
                            </span>
                            {c.artistComment && (
                              <>
                                <VerifiedBadgeIcon className="h-[13px] w-[13px]" />
                                <span className="rounded-[4px] bg-[#00cbd5] px-[5px] py-[1px] text-[9px] font-extrabold text-white">
                                  ARTIST
                                </span>
                              </>
                            )}
                            <span className="text-[11px] text-[#8e8e8e]">
                              {formatDateTime(c.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-[8px]">
                            <button
                              type="button"
                              onClick={() =>
                                void handleToggleCommentLike(bePost.id, c.id)
                              }
                              className={`inline-flex items-center gap-[3px] bg-transparent p-0 text-[11px] font-semibold ${
                                c.reactedByMe
                                  ? "text-[#fe5b58]"
                                  : "text-[#666666]"
                              }`}
                            >
                              <HeartIcon
                                filled={c.reactedByMe}
                                className="h-[13px] w-[13px]"
                              />
                              <span>{c.totalReactions || 0}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setReplyingToCommentId(
                                  replyingToCommentId === c.id ? null : c.id
                                )
                              }
                              className="bg-transparent p-0 text-[11px] font-bold text-[#00b8c1] hover:underline"
                            >
                              Reply
                            </button>

                            {isMyComment && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(c.id);
                                    setEditingCommentText(c.content);
                                  }}
                                  className="bg-transparent p-0 text-[11px] font-semibold text-[#666666] hover:text-black"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeleteBeComment(bePost.id, c.id)
                                  }
                                  className="bg-transparent p-0 text-[11px] font-semibold text-[#d63333] hover:underline"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingCommentId === c.id ? (
                          <div className="mt-[6px] flex items-center gap-[6px]">
                            <input
                              type="text"
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                              className="h-[30px] flex-1 rounded-full border border-[#00cbd5] bg-white px-[10px] text-[12px] text-black outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                void handleSaveEditComment(bePost.id, c.id)
                              }
                              className="h-[30px] rounded-full bg-[#00cbd5] px-[12px] text-[11px] font-bold text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="h-[30px] rounded-full bg-[#ebedf2] px-[10px] text-[11px] font-semibold text-[#484848]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="mb-0 mt-[4px] text-[#222222]">
                            {c.content}
                          </p>
                        )}

                        {/* Nested Level-2 Replies */}
                        {replies.length > 0 && (
                          <ul className="m-0 mt-[8px] list-none space-y-[6px] border-l-2 border-[#00cbd5]/30 pl-[10px]">
                            {replies.map((reply) => {
                              const isMyReply = Boolean(
                                user &&
                                  (reply.author?.id === user.id ||
                                    user.role?.toUpperCase() === "ADMIN")
                              );
                              return (
                                <li
                                  key={reply.id}
                                  className={`rounded-[8px] p-[8px] text-[12px] ${
                                    reply.artistComment
                                      ? "bg-[#dffafb]/50"
                                      : "bg-[#f7f8fa]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-[6px]">
                                    <div className="flex items-center gap-[4px]">
                                      <strong className="text-black">
                                        {reply.author?.stageName ||
                                          reply.author?.name}
                                      </strong>
                                      {reply.artistComment && (
                                        <VerifiedBadgeIcon className="h-[12px] w-[12px]" />
                                      )}
                                      <span className="text-[10px] text-[#8e8e8e]">
                                        {formatDateTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-[6px]">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleToggleCommentLike(
                                            bePost.id,
                                            reply.id
                                          )
                                        }
                                        className={`inline-flex items-center gap-[3px] bg-transparent p-0 text-[11px] font-semibold ${
                                          reply.reactedByMe
                                            ? "text-[#fe5b58]"
                                            : "text-[#666666]"
                                        }`}
                                      >
                                        <HeartIcon
                                          filled={reply.reactedByMe}
                                          className="h-[12px] w-[12px]"
                                        />
                                        <span>{reply.totalReactions || 0}</span>
                                      </button>
                                      {isMyReply && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            void handleDeleteBeComment(
                                              bePost.id,
                                              reply.id
                                            )
                                          }
                                          className="bg-transparent p-0 text-[10px] font-semibold text-[#d63333]"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="mb-0 mt-[3px] text-[#333333]">
                                    {reply.content}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {c.totalReplies > replies.length && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleLoadAllReplies(bePost.id, c.id)
                            }
                            className="mt-[6px] bg-transparent p-0 text-[11px] font-bold text-[#00b8c1] hover:underline"
                          >
                            View all {c.totalReplies} replies
                          </button>
                        )}

                        {replyingToCommentId === c.id && (
                          <form
                            onSubmit={(e) =>
                              void handleSubmitReply(bePost.id, c.id, e)
                            }
                            className="mt-[8px] flex items-center gap-[6px]"
                          >
                            <input
                              type="text"
                              value={replyDrafts[c.id] ?? ""}
                              onChange={(e) =>
                                setReplyDrafts((prev) => ({
                                  ...prev,
                                  [c.id]: e.target.value,
                                }))
                              }
                              placeholder={`Reply to ${
                                c.author?.stageName || c.author?.name
                              }...`}
                              className="h-[30px] flex-1 rounded-full border border-black/15 bg-white px-[10px] text-[12px] text-black outline-none focus:border-[#00cbd5]"
                            />
                            <button
                              type="submit"
                              className="h-[30px] rounded-full bg-[#00cbd5] px-[12px] text-[11px] font-bold text-white"
                            >
                              Reply
                            </button>
                          </form>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )
            ) : allStaticComments.length === 0 ? (
              <p className="m-0 text-[12px] text-[#8e8e8e]">
                Be the first to leave a cheering comment!
              </p>
            ) : (
              <ul className="m-0 list-none space-y-[8px] p-0">
                {allStaticComments.map((c) => (
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
              onSubmit={(e) => void handleSubmitComment(post, e)}
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

  const renderAboutCard = () => {
    const memberCountDisplay = fandomDetail
      ? `${fandomDetail.memberCount.toLocaleString()} members`
      : bundle.memberCountLabel;

    return (
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
              {memberCountDisplay}
            </span>
            {fandomDetail?.company?.name && (
              <span className="mt-[2px] inline-block rounded-[4px] bg-[#f2f4f8] px-[6px] py-[2px] text-[10px] font-bold text-[#484848]">
                {fandomDetail.company.name}
              </span>
            )}
          </div>
        </div>

        <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
          <button
            type="button"
            onClick={async () => {
              await toggleJoinCommunity(artist.slug);
              void loadCommunityDataFromBe();
            }}
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
            Artist Members ({displayMembers.length})
          </h3>
          <ul className="m-0 list-none divide-y divide-black/[0.04] p-0">
            {displayMembers.map((member, idx) => {
              const isOpen = expandedMember === member.name;
              return (
                <li
                  key={
                    member.userId != null
                      ? `member-${member.userId}`
                      : `member-${member.name}-${idx}`
                  }
                  className="py-[8px]"
                >
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
                      <span className="flex items-center gap-[4px] truncate text-[14px] font-semibold text-black">
                        <span>{member.name}</span>
                        <VerifiedBadgeIcon className="h-[13px] w-[13px] shrink-0" />
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
                        Birthday / Debut: {member.birthday}
                      </div>
                      {member.followersCount != null && (
                        <div className="mt-[2px] text-[11px] font-bold text-[#00b8c1]">
                          {member.followersCount.toLocaleString()} followers
                        </div>
                      )}
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
  };

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
                onClick={async () => {
                  await toggleJoinCommunity(artist.slug);
                  void loadCommunityDataFromBe();
                }}
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
                  {combinedArtistPosts
                    .slice(0, 1)
                    .map((post) => renderPostCard(post))}
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
                  {combinedFanPosts
                    .slice(0, 2)
                    .map((post) => renderPostCard(post, true))}
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
                  {combinedMedia.slice(0, 4).map((item) => (
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
                          {item.kind === "live" ? "LIVE REPLAY" : "MEDIA"}
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
                  {allLetters.slice(0, 4).map((letter) => {
                    const beL = (letter as { beLetter?: FanLetterDto })
                      .beLetter;
                    return (
                      <button
                        key={letter.id}
                        type="button"
                        onClick={() => setReadingLetter(letter)}
                        className="relative flex flex-col overflow-hidden rounded-[12px] border border-black/[0.06] p-[10px] text-left transition-transform hover:-translate-y-[2px]"
                        style={{ backgroundColor: letter.accentBg }}
                      >
                        <div className="flex items-center justify-between gap-[4px]">
                          <span className="truncate text-[11px] font-extrabold text-[#484848]">
                            To. {letter.toName}
                          </span>
                          {beL && !beL.isPublic && (
                            <span className="rounded-[4px] bg-black/70 px-[4px] py-[1px] text-[8px] font-bold text-white">
                              PRIVATE
                            </span>
                          )}
                        </div>
                        <div className="relative my-[8px] aspect-[4/3] overflow-hidden rounded-[8px] bg-white/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={letter.image}
                            alt={letter.toName}
                            className="h-full w-full object-cover"
                          />
                          {beL && beL.stickerList?.length > 0 && (
                            <div className="mt-[4px] absolute bottom-[4px] right-[4px] flex gap-[2px] rounded-full bg-white/85 px-[5px] py-[2px] text-[11px]">
                              {beL.stickerList.slice(0, 3).map((st, idx) => (
                                <span key={`${st.id}-${idx}`}>
                                  {getStickerEmoji(st.id)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="m-0 line-clamp-3 text-[12px] leading-[16px] text-[#222222]">
                          {letter.note}
                        </p>
                        <span className="mt-auto pt-[6px] text-[10px] font-semibold text-[#666666]">
                          From {letter.fromName}
                        </span>
                      </button>
                    );
                  })}
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
                  <div className="flex flex-wrap items-center justify-between gap-[10px]">
                    <div>
                      <h2 className="m-0 text-[17px] font-bold text-black">
                        Fan Feed ({combinedFanPosts.length})
                      </h2>
                      <div className="mt-[8px] flex flex-wrap items-center gap-[6px]">
                        <button
                          type="button"
                          onClick={() => setFanSortBy("latest")}
                          className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                            fanSortBy === "latest"
                              ? "bg-black text-white"
                              : "bg-[#f2f4f8] text-[#484848]"
                          }`}
                        >
                          Latest
                        </button>
                        <button
                          type="button"
                          onClick={() => setFanSortBy("popular")}
                          className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                            fanSortBy === "popular"
                              ? "bg-black text-white"
                              : "bg-[#f2f4f8] text-[#484848]"
                          }`}
                        >
                          Hot / Popular
                        </button>
                        <button
                          type="button"
                          onClick={() => setFanHasMediaOnly((prev) => !prev)}
                          className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                            fanHasMediaOnly
                              ? "bg-[#00cbd5] text-white"
                              : "bg-[#f2f4f8] text-[#484848]"
                          }`}
                        >
                          Media Only
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPostComposer((prev) => !prev)}
                      className="rounded-full bg-[#00cbd5] px-[16px] py-[8px] text-[13px] font-bold text-white hover:bg-[#00b8c1]"
                    >
                      {showPostComposer ? "Cancel" : "Write a Post"}
                    </button>
                  </div>

                  {showPostComposer && (
                    <form
                      onSubmit={(e) => void handleCreatePost(e)}
                      className="mt-[14px] space-y-[10px]"
                    >
                      <textarea
                        rows={3}
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder={`Share a message with ${artist.name} and fellow fans...`}
                        className="w-full rounded-[12px] border border-[#dcdee4] bg-[#f7f8fa] p-[12px] text-[14px] text-black outline-none focus:border-[#00cbd5]"
                      />

                      {/* Attached Media Previews */}
                      {newPostMedia.length > 0 && (
                        <div className="flex flex-wrap gap-[8px]">
                          {newPostMedia.map((m, idx) => (
                            <div
                              key={`${m.mediaUrl}-${idx}`}
                              className="relative h-[68px] w-[68px] overflow-hidden rounded-[8px] border border-black/10 bg-[#f2f3f7]"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.mediaUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setNewPostMedia((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                className="absolute right-[3px] top-[3px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-black/75 text-[10px] font-bold text-white"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-[10px]">
                        <div className="flex flex-wrap items-center gap-[8px]">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => void handleFileUpload(e)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={uploadingMedia}
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full border border-black/15 bg-white px-[12px] py-[6px] text-[12px] font-bold text-[#222222] hover:bg-[#f7f8fa]"
                          >
                            {uploadingMedia
                              ? "Uploading..."
                              : "📷 Upload Photo"}
                          </button>

                          <div className="flex items-center gap-[4px]">
                            <input
                              type="text"
                              value={imageUrlInput}
                              onChange={(e) => setImageUrlInput(e.target.value)}
                              placeholder="Or paste image URL..."
                              className="h-[32px] w-[180px] rounded-full border border-black/10 bg-white px-[10px] text-[12px] text-black outline-none focus:border-[#00cbd5]"
                            />
                            {imageUrlInput.trim() && (
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="h-[32px] rounded-full bg-[#f2f4f8] px-[10px] text-[11px] font-bold text-black hover:bg-[#e4e7ee]"
                              >
                                Attach
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={publishingPost}
                          className="rounded-full bg-black px-[20px] py-[8px] text-[13px] font-bold text-white hover:bg-[#282828] disabled:opacity-60"
                        >
                          {publishingPost ? "Publishing..." : "Publish Post"}
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
                <div className="wev-community-card flex flex-wrap items-center justify-between gap-[10px] p-[18px]">
                  <div>
                    <h2 className="m-0 text-[18px] font-bold text-black">
                      Artist Posts from {artist.name}
                    </h2>
                    <div className="mt-[8px] flex flex-wrap items-center gap-[6px]">
                      <button
                        type="button"
                        onClick={() => setArtistSortBy("latest")}
                        className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                          artistSortBy === "latest"
                            ? "bg-black text-white"
                            : "bg-[#f2f4f8] text-[#484848]"
                        }`}
                      >
                        Latest
                      </button>
                      <button
                        type="button"
                        onClick={() => setArtistSortBy("popular")}
                        className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                          artistSortBy === "popular"
                            ? "bg-black text-white"
                            : "bg-[#f2f4f8] text-[#484848]"
                        }`}
                      >
                        Hot / Popular
                      </button>
                      <button
                        type="button"
                        onClick={() => setArtistHasMediaOnly((prev) => !prev)}
                        className={`rounded-full px-[10px] py-[4px] text-[11px] font-bold ${
                          artistHasMediaOnly
                            ? "bg-[#00cbd5] text-white"
                            : "bg-[#f2f4f8] text-[#484848]"
                        }`}
                      >
                        Media Only
                      </button>
                    </div>
                  </div>

                  {user?.role?.toUpperCase() === "ARTIST" && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("Fan");
                        setShowPostComposer(true);
                      }}
                      className="rounded-full bg-[#00cbd5] px-[16px] py-[8px] text-[13px] font-bold text-white hover:bg-[#00b8c1]"
                    >
                      + Write Artist Post
                    </button>
                  )}
                </div>

                {combinedArtistPosts.map((post) => renderPostCard(post))}
              </div>
            )}

            {activeTab === "Fan Letter" && (
              <div>
                <div className="mb-[16px] flex flex-wrap items-center justify-between gap-[12px]">
                  <div>
                    <h2 className="m-0 text-[18px] font-bold text-black">
                      Fan Letters to {artist.name} ({allLetters.length})
                    </h2>

                    <div className="mt-[8px] flex flex-wrap items-center gap-[8px]">
                      <button
                        type="button"
                        onClick={() => setLetterViewMode("wall")}
                        className={`rounded-full px-[12px] py-[5px] text-[12px] font-bold ${
                          letterViewMode === "wall"
                            ? "bg-black text-white"
                            : "bg-[#f2f4f8] text-[#484848]"
                        }`}
                      >
                        Community Wall
                      </button>
                      {user && (
                        <button
                          type="button"
                          onClick={() => setLetterViewMode("my-sent")}
                          className={`rounded-full px-[12px] py-[5px] text-[12px] font-bold ${
                            letterViewMode === "my-sent"
                              ? "bg-black text-white"
                              : "bg-[#f2f4f8] text-[#484848]"
                          }`}
                        >
                          My Sent Letters
                        </button>
                      )}
                      {user?.role?.toUpperCase() === "ARTIST" && (
                        <button
                          type="button"
                          onClick={() => setLetterViewMode("artist-inbox")}
                          className={`rounded-full px-[12px] py-[5px] text-[12px] font-bold ${
                            letterViewMode === "artist-inbox"
                              ? "bg-[#00cbd5] text-white"
                              : "bg-[#dffafb] text-[#009ba3]"
                          }`}
                        >
                          Artist Inbox
                        </button>
                      )}

                      {displayMembers.some((m) => m.userId != null) && (
                        <select
                          aria-label="Filter letters by artist member"
                          value={letterFilterArtistId ?? ""}
                          onChange={(e) =>
                            setLetterFilterArtistId(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="h-[30px] rounded-full border border-black/15 bg-white px-[10px] text-[12px] font-semibold text-black outline-none"
                        >
                          <option value="">All Members</option>
                          {displayMembers
                            .filter((m) => m.userId != null)
                            .map((m) => (
                              <option key={m.userId} value={m.userId}>
                                To. {m.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLetterModal(true)}
                    className="rounded-full bg-[#00cbd5] px-[18px] py-[9px] text-[13px] font-bold text-white hover:bg-[#00b8c1]"
                  >
                    + Send Fan Letter
                  </button>
                </div>

                {allLetters.length === 0 ? (
                  <div className="wev-community-card p-[36px] text-center text-[14px] text-[#8e8e8e]">
                    No fan letters found for this view yet. Send the first warm
                    fan letter!
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-[14px] max-[900px]:grid-cols-2">
                    {allLetters.map((letter) => {
                      const beL = (letter as { beLetter?: FanLetterDto })
                        .beLetter;
                      return (
                        <button
                          key={letter.id}
                          type="button"
                          onClick={() => setReadingLetter(letter)}
                          className="flex flex-col overflow-hidden rounded-[16px] border border-black/[0.06] p-[14px] text-left transition-transform hover:-translate-y-[2px]"
                          style={{ backgroundColor: letter.accentBg }}
                        >
                          <div className="flex items-center justify-between gap-[6px]">
                            <span className="truncate text-[12px] font-extrabold text-[#484848]">
                              To. {letter.toName}
                            </span>
                            {beL && !beL.isPublic && (
                              <span className="rounded-[4px] bg-black/75 px-[5px] py-[1px] text-[9px] font-bold text-white">
                                PRIVATE
                              </span>
                            )}
                          </div>
                          <div className="relative my-[10px] aspect-[4/3] overflow-hidden rounded-[10px] bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={letter.image}
                              alt={letter.toName}
                              className="h-full w-full object-cover"
                            />
                            {beL && beL.stickerList?.length > 0 && (
                              <div className="absolute bottom-[6px] right-[6px] flex gap-[3px] rounded-full bg-white/90 px-[7px] py-[2px] text-[13px] shadow-sm">
                                {beL.stickerList.map((st, idx) => (
                                  <span key={`${st.id}-${idx}`}>
                                    {getStickerEmoji(st.id)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="m-0 line-clamp-4 text-[13px] leading-[19px] text-[#222222]">
                            {letter.note}
                          </p>
                          <span className="mt-auto pt-[10px] text-[11px] font-semibold text-[#666666]">
                            From {letter.fromName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {(activeTab === "Media" || activeTab === "LIVE") && (
              <div>
                <h2 className="m-0 mb-[16px] text-[18px] font-bold text-black">
                  {activeTab === "LIVE"
                    ? `${artist.name} LIVE Replays`
                    : `${artist.name} Official Media & Community Gallery`}
                </h2>
                <div className="grid grid-cols-2 gap-[16px] max-[673px]:grid-cols-1">
                  {combinedMedia
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
                            {item.kind === "live" ? "LIVE REPLAY" : "MEDIA"}
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
            className="max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-[20px] bg-white p-[24px] shadow-[0_16px_48px_rgba(0,0,0,0.24)]"
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
              onSubmit={(e) => void handleCreateLetter(e)}
              className="mt-[16px] space-y-[14px]"
            >
              <div>
                <label
                  htmlFor="fan-letter-to"
                  className="mb-[6px] block text-[12px] font-bold text-[#484848]"
                >
                  To Artist Member
                </label>
                <select
                  id="fan-letter-to"
                  value={selectedRecipientArtistId ?? letterTo}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = displayMembers.find(
                      (m) => String(m.userId) === val || m.name === val
                    );
                    if (matched) {
                      setLetterTo(matched.name);
                      setSelectedRecipientArtistId(matched.userId ?? null);
                    } else {
                      setLetterTo(val);
                    }
                  }}
                  className="h-[40px] w-full rounded-[10px] border border-[#dcdee4] bg-white px-[12px] text-[14px] text-black outline-none"
                >
                  {displayMembers.map((m, idx) => (
                    <option
                      key={
                        m.userId != null
                          ? `opt-${m.userId}`
                          : `opt-${m.name}-${idx}`
                      }
                      value={m.userId ?? m.name}
                    >
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="mb-[6px] block text-[12px] font-bold text-[#484848]">
                  Paper Theme &amp; Template
                </span>
                <div className="flex flex-wrap items-center gap-[8px]">
                  {LETTER_THEMES.map((color, idx) => {
                    const tpl = letterTemplates[idx];
                    const isSelected = letterBg === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setLetterBg(color);
                          if (tpl) setSelectedTemplateId(tpl.id);
                        }}
                        aria-label={`Select color ${color}`}
                        className={`h-[30px] w-[30px] rounded-full border-2 ${
                          isSelected ? "border-black" : "border-black/10"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-[6px] block text-[12px] font-bold text-[#484848]">
                  Decorate with Stickers ({selectedStickerIds.length} selected)
                </span>
                <div className="flex flex-wrap gap-[6px]">
                  {STICKER_PRESETS.map((st) => {
                    const active = selectedStickerIds.includes(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleStickerSelection(st.id)}
                        className={`inline-flex items-center gap-[4px] rounded-full border px-[10px] py-[4px] text-[12px] font-semibold transition-colors ${
                          active
                            ? "border-[#00cbd5] bg-[#dffafb] text-black"
                            : "border-black/10 bg-[#f7f8fa] text-[#666666]"
                        }`}
                      >
                        <span>{st.emoji}</span>
                        <span>{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-[6px] block text-[12px] font-bold text-[#484848]">
                  Visibility
                </span>
                <div className="grid grid-cols-2 gap-[8px]">
                  <button
                    type="button"
                    onClick={() => setLetterIsPublic(true)}
                    className={`h-[36px] rounded-[8px] border text-[12px] font-bold ${
                      letterIsPublic
                        ? "border-[#00cbd5] bg-[#dffafb]/50 text-[#009ba3]"
                        : "border-black/10 bg-white text-[#666666]"
                    }`}
                  >
                    🌐 Public Wall
                  </button>
                  <button
                    type="button"
                    onClick={() => setLetterIsPublic(false)}
                    className={`h-[36px] rounded-[8px] border text-[12px] font-bold ${
                      !letterIsPublic
                        ? "border-[#00cbd5] bg-[#dffafb]/50 text-[#009ba3]"
                        : "border-black/10 bg-white text-[#666666]"
                    }`}
                  >
                    🔒 Private (Artist Only)
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="fan-letter-body"
                  className="mb-[6px] block text-[12px] font-bold text-[#484848]"
                >
                  Message
                </label>
                <div className="relative">
                  <textarea
                    id="fan-letter-body"
                    rows={4}
                    value={letterBody}
                    onChange={(e) => setLetterBody(e.target.value)}
                    placeholder={`Write a warm fan letter to ${letterTo}...`}
                    className="w-full rounded-[12px] border border-[#dcdee4] p-[12px] text-[14px] text-black outline-none"
                    style={{ backgroundColor: letterBg }}
                  />
                  {selectedStickerIds.length > 0 && (
                    <div className="pointer-events-none absolute bottom-[10px] right-[10px] flex gap-[4px] rounded-full bg-white/85 px-[8px] py-[2px] text-[14px] shadow-sm">
                      {selectedStickerIds.map((id) => (
                        <span key={id}>{getStickerEmoji(id)}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingLetter}
                className="h-[44px] w-full rounded-full bg-[#00cbd5] text-[14px] font-bold text-white hover:bg-[#00b8c1] disabled:opacity-60"
              >
                {sendingLetter ? "Sending Letter..." : "Send Fan Letter"}
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
            {(() => {
              const beL = (readingLetter as { beLetter?: FanLetterDto })
                .beLetter;
              const canDelete = Boolean(
                beL &&
                  user &&
                  (beL.sender?.id === user.id ||
                    user.role?.toUpperCase() === "ADMIN")
              );

              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[6px]">
                      <strong className="text-[16px] font-extrabold text-black">
                        To. {readingLetter.toName}
                      </strong>
                      {beL && !beL.isPublic && (
                        <span className="rounded-[4px] bg-black/75 px-[6px] py-[2px] text-[10px] font-bold text-white">
                          PRIVATE
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setReadingLetter(null)}
                      aria-label="Close letter"
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/70 text-black"
                    >
                      <CloseIcon className="h-[18px] w-[18px]" />
                    </button>
                  </div>

                  <div className="relative my-[14px] aspect-[4/3] overflow-hidden rounded-[12px] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={readingLetter.image}
                      alt={readingLetter.toName}
                      className="h-full w-full object-cover"
                    />
                    {beL && beL.stickerList?.length > 0 && (
                      <div className="absolute bottom-[8px] right-[8px] flex gap-[4px] rounded-full bg-white/90 px-[10px] py-[4px] text-[16px] shadow">
                        {beL.stickerList.map((st, idx) => (
                          <span key={`${st.id}-${idx}`}>
                            {getStickerEmoji(st.id)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="m-0 whitespace-pre-line text-[15px] leading-[23px] text-[#222222]">
                    {readingLetter.note}
                  </p>

                  <div className="mt-[16px] flex items-center justify-between">
                    {canDelete && beL ? (
                      <button
                        type="button"
                        onClick={() => void handleDeleteBeLetter(beL.id)}
                        className="rounded-full bg-white/80 px-[12px] py-[5px] text-[12px] font-bold text-[#d63333] hover:bg-white"
                      >
                        Delete Letter
                      </button>
                    ) : (
                      <span />
                    )}
                    <div className="text-right text-[13px] font-bold text-[#484848]">
                      — From {readingLetter.fromName}
                    </div>
                  </div>
                </>
              );
            })()}
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
                      : `MEDIA · ${activeMedia.duration}`}
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
