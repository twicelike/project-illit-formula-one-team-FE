import { FEATURED_ARTISTS } from "@/components/sites/weverse/data";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8080/api/v1";

const TOKEN_STORAGE_KEY = "weverse_jwt_tokens_v1";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  items: T[];
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AuthUserSummary {
  id: number;
  email: string;
  name: string;
  avatar?: string | null;
  role: "FAN" | "ARTIST" | "ADMIN" | string;
  verified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUserSummary;
}

export interface MemberProfileDto {
  membershipTier: string;
  totalLoyaltyPoints: number;
}

export interface CompanyDto {
  id: number;
  name: string;
  bio?: string | null;
}

export interface ArtistProfileDto {
  userId: number;
  stageName: string;
  bio?: string | null;
  avatar?: string | null;
  followersCount: number;
  debutDate?: string | null;
  verified: boolean;
  company?: CompanyDto | null;
}

export interface UserProfileDto {
  id: number;
  email?: string | null;
  name: string;
  avatar?: string | null;
  role: string;
  verified?: boolean;
  totalFollower: number;
  totalFollowing: number;
  isActive?: boolean;
  createdAt?: string;
  memberProfile?: MemberProfileDto | null;
  artistProfile?: ArtistProfileDto | null;
}

export interface FollowActionDto {
  targetUserId: number;
  following: boolean;
  targetTotalFollower: number;
  myTotalFollowing: number;
}

export interface FollowStatusDto {
  targetUserId: number;
  following: boolean;
  followedBy: boolean;
  mutual: boolean;
}

export interface FollowUserDto {
  userId: number;
  name: string;
  stageName?: string | null;
  avatar?: string | null;
  role: string;
  verified: boolean;
  totalFollower: number;
  followedByMe: boolean;
  followedAt?: string;
}

export interface ReactorDto {
  userId: number;
  name: string;
  stageName?: string | null;
  avatar?: string | null;
  role: string;
  verified: boolean;
}

export interface FandomSummaryDto {
  id: number;
  name: string;
  status: string;
  bannerUrl?: string | null;
  createdAt?: string;
  company?: CompanyDto | null;
  memberCount: number;
  artistCount: number;
  joined: boolean;
  myRole?: string | null;
}

export interface FandomDetailDto {
  id: number;
  name: string;
  status: string;
  bannerUrl?: string | null;
  createdAt?: string;
  company?: CompanyDto | null;
  memberCount: number;
  artistCount: number;
  joined: boolean;
  myRole?: string | null;
  artists: ArtistProfileDto[];
  availableTabs: string[];
}

export interface MyCommunityDto {
  fandomId: number;
  fandomName: string;
  bannerUrl?: string | null;
  status: string;
  company?: CompanyDto | null;
  memberCount: number;
  artistCount: number;
  myRole: string;
  joinedAt?: string;
}

export interface PostAuthorDto {
  id: number;
  name: string;
  stageName?: string | null;
  avatar?: string | null;
  role: string;
  verified: boolean;
}

export interface MediaDto {
  id: number;
  mediaUrl: string;
  thumbnail?: string | null;
  createdAt?: string;
}

export interface MediaItemInput {
  mediaUrl: string;
  thumbnail?: string;
}

export interface MediaUploadDto {
  mediaUrl: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  bucket: string;
}

export interface ArtistBadgeActorDto {
  userId: number;
  stageName: string;
  avatar?: string | null;
}

export interface ArtistInteractionSummaryDto {
  artistReplied: boolean;
  artistLiked: boolean;
  repliedArtists?: ArtistBadgeActorDto[];
  likedArtists?: ArtistBadgeActorDto[];
  highlightText?: string | null;
}

export interface PostDto {
  id: number;
  fandomId: number;
  fandomName: string;
  author: PostAuthorDto;
  content?: string | null;
  media: MediaDto[];
  totalReactions: number;
  totalComments: number;
  artistPost: boolean;
  reactedByMe: boolean;
  artistInteractions?: ArtistInteractionSummaryDto | null;
  status: string;
  createdAt: string;
}

export interface FandomMediaGalleryItemDto {
  mediaId: number;
  postId: number;
  mediaUrl: string;
  thumbnail?: string | null;
  authorName: string;
  artistPost: boolean;
  createdAt: string;
}

export interface CommentDto {
  id: number;
  postId: number;
  parentId?: number | null;
  author: PostAuthorDto;
  content: string;
  totalReactions: number;
  totalReplies: number;
  reactedByMe: boolean;
  artistComment: boolean;
  artistReplied: boolean;
  previewReplies?: CommentDto[];
  createdAt: string;
}

export interface ReactionToggleDto {
  targetId: number;
  targetType: string;
  reacted: boolean;
  totalReactions: number;
}

export interface LetterTemplateDto {
  id: number;
  imageUrl?: string | null;
  isPremium: boolean;
  price: number;
  isActive: boolean;
}

export interface StickerItemDto {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
}

export interface FanLetterSenderDto {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface FanLetterRecipientDto {
  userId: number;
  stageName: string;
  avatar?: string | null;
  companyName?: string | null;
}

export interface FanLetterDto {
  id: number;
  sender: FanLetterSenderDto;
  recipient: FanLetterRecipientDto;
  template?: LetterTemplateDto | null;
  content: string;
  backgroundImageId?: number | null;
  backgroundImage?: MediaDto | null;
  stickerList: StickerItemDto[];
  isPublic: boolean;
  status: string;
  createdAt: string;
}

export interface GlobalSearchDto {
  query: string;
  fandoms: FandomSummaryDto[];
  artists: ArtistProfileDto[];
  posts: PostDto[];
  totals: {
    fandoms: number;
    artists: number;
    posts: number;
  };
}

export interface SearchSuggestionsDto {
  query: string;
  fandoms: Array<{
    id: number;
    name: string;
    bannerUrl?: string | null;
    memberCount: number;
  }>;
  artists: Array<{
    userId: number;
    stageName: string;
    avatar?: string | null;
    companyName?: string | null;
  }>;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getStoredTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredTokens>;
    if (parsed.accessToken && parsed.refreshToken) {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: StoredTokens | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!tokens) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Maps a backend fandom name (e.g. "LE SSERAFIM", "BAEKHO(KANG DONG HO)")
 * to the canonical frontend artist slug (e.g. "lesserafim", "baekho").
 */
export function resolveSlugForFandomName(fandomName: string): string {
  const normalizedTarget = fandomName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  for (const artist of FEATURED_ARTISTS) {
    const normalizedArtistName = artist.name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    const normalizedSlug = artist.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (
      normalizedArtistName === normalizedTarget ||
      normalizedSlug === normalizedTarget
    ) {
      return artist.slug;
    }
  }

  return (
    fandomName
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "community"
  );
}

let refreshPromise: Promise<StoredTokens | null> | null = null;

async function tryRefreshTokens(): Promise<StoredTokens | null> {
  const current = getStoredTokens();
  if (!current?.refreshToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      if (!res.ok) {
        setStoredTokens(null);
        return null;
      }
      const payload = (await res.json()) as ApiResponse<AuthResponse>;
      if (!payload?.success || !payload.data?.accessToken) {
        setStoredTokens(null);
        return null;
      }
      const next: StoredTokens = {
        accessToken: payload.data.accessToken,
        refreshToken: payload.data.refreshToken || current.refreshToken,
      };
      setStoredTokens(next);
      return next;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<T> {
  const tokens = getStoredTokens();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (tokens?.accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (
    res.status === 401 &&
    allowRetry &&
    tokens?.refreshToken &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh")
  ) {
    const refreshed = await tryRefreshTokens();
    if (refreshed?.accessToken) {
      const retryHeaders = new Headers(options.headers || {});
      if (
        !(options.body instanceof FormData) &&
        !retryHeaders.has("Content-Type")
      ) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
      const retryRes = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: retryHeaders,
      });
      return parseApiResponse<T>(retryRes);
    }
  }

  return parseApiResponse<T>(res);
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON response
  }

  if (!res.ok || (json && json.success === false)) {
    const msg =
      json?.message ||
      (res.status === 429
        ? "Too many requests. Please wait a moment and try again."
        : `Request failed (${res.status})`);
    throw new ApiError(msg, res.status);
  }

  const data = json ? json.data : (undefined as unknown as T);
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Array.isArray((data as unknown as Record<string, unknown>).items) &&
    !Array.isArray((data as unknown as Record<string, unknown>).content)
  ) {
    (data as unknown as Record<string, unknown>).content = (
      data as unknown as Record<string, unknown>
    ).items;
  }

  return data;
}

// ==================== 1. AUTH & USER PROFILE API ====================

export const authApi = {
  async register(input: {
    email: string;
    name: string;
    password: string;
    avatar?: string;
  }): Promise<AuthResponse> {
    const data = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setStoredTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  },

  async login(input: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const data = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setStoredTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  },

  async logout(): Promise<void> {
    const tokens = getStoredTokens();
    try {
      if (tokens?.accessToken) {
        await request<void>(
          "/auth/logout",
          {
            method: "POST",
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          },
          false
        );
      }
    } finally {
      setStoredTokens(null);
    }
  },

  async getMyProfile(): Promise<UserProfileDto> {
    return request<UserProfileDto>("/users/me");
  },

  async updateMyProfile(input: {
    name: string;
    avatar?: string | null;
  }): Promise<UserProfileDto> {
    return request<UserProfileDto>("/users/me", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async changeMyPassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await request<void>("/users/me/password", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async getPublicProfile(userId: number): Promise<UserProfileDto> {
    return request<UserProfileDto>(`/users/${userId}`);
  },

  async getArtistDetail(userId: number): Promise<ArtistProfileDto> {
    return request<ArtistProfileDto>(`/artists/${userId}`);
  },

  async updateMyArtistProfile(input: {
    stageName: string;
    bio?: string | null;
    avatar?: string | null;
  }): Promise<ArtistProfileDto> {
    return request<ArtistProfileDto>("/artists/me", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
};

// ==================== 1B. FOLLOW API ====================

export const followApi = {
  async followUser(targetUserId: number): Promise<FollowActionDto> {
    return request<FollowActionDto>(`/users/${targetUserId}/follow`, {
      method: "POST",
    });
  },

  async unfollowUser(targetUserId: number): Promise<FollowActionDto> {
    return request<FollowActionDto>(`/users/${targetUserId}/follow`, {
      method: "DELETE",
    });
  },

  async getFollowStatus(targetUserId: number): Promise<FollowStatusDto> {
    return request<FollowStatusDto>(`/users/${targetUserId}/follow-status`);
  },

  async getFollowers(
    userId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<FollowUserDto>> {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 40));
    return request<PageResponse<FollowUserDto>>(
      `/users/${userId}/followers?${qs.toString()}`
    );
  },

  async getFollowing(
    userId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<FollowUserDto>> {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 40));
    return request<PageResponse<FollowUserDto>>(
      `/users/${userId}/following?${qs.toString()}`
    );
  },
};

// ==================== 2. COMMUNITY HUB (FANDOMS) API ====================

export const fandomApi = {
  async discoverFandoms(params?: {
    companyId?: number;
    keyword?: string;
    sortBy?: "newest" | "name";
    page?: number;
    size?: number;
  }): Promise<PageResponse<FandomSummaryDto>> {
    const qs = new URLSearchParams();
    if (params?.companyId != null) qs.set("companyId", String(params.companyId));
    if (params?.keyword) qs.set("keyword", params.keyword);
    if (params?.sortBy) qs.set("sortBy", params.sortBy);
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 100));
    return request<PageResponse<FandomSummaryDto>>(`/fandoms?${qs.toString()}`);
  },

  async getMyCommunities(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<MyCommunityDto>> {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 100));
    return request<PageResponse<MyCommunityDto>>(`/fandoms/me?${qs.toString()}`);
  },

  async getFandomDetail(fandomId: number): Promise<FandomDetailDto> {
    return request<FandomDetailDto>(`/fandoms/${fandomId}`);
  },

  async getFandomArtists(fandomId: number): Promise<ArtistProfileDto[]> {
    return request<ArtistProfileDto[]>(`/fandoms/${fandomId}/artists`);
  },

  async joinFandom(fandomId: number): Promise<void> {
    await request(`/fandoms/${fandomId}/join`, { method: "POST" });
  },

  async leaveFandom(fandomId: number): Promise<void> {
    await request(`/fandoms/${fandomId}/leave`, { method: "DELETE" });
  },
};

// ==================== 3. SEARCH API ====================

export const searchApi = {
  async globalSearch(params: {
    q: string;
    fandomId?: number;
    limit?: number;
  }): Promise<GlobalSearchDto> {
    const qs = new URLSearchParams({ q: params.q });
    if (params.fandomId != null) qs.set("fandomId", String(params.fandomId));
    if (params.limit != null) qs.set("limit", String(params.limit));
    return request<GlobalSearchDto>(`/search?${qs.toString()}`);
  },

  async getSuggestions(q: string, limit = 6): Promise<SearchSuggestionsDto> {
    const qs = new URLSearchParams({ q, limit: String(limit) });
    return request<SearchSuggestionsDto>(`/search/suggestions?${qs.toString()}`);
  },
};

// ==================== 4. POSTS & MEDIA API ====================

export const postApi = {
  async getFandomFeed(
    fandomId: number,
    params?: {
      tab?: "FEED" | "FAN" | "ARTIST";
      sortBy?: "latest" | "popular";
      hasMedia?: boolean;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<PostDto>> {
    const qs = new URLSearchParams();
    qs.set("tab", params?.tab ?? "FEED");
    qs.set("sortBy", params?.sortBy ?? "latest");
    if (params?.hasMedia) qs.set("hasMedia", "true");
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 30));
    return request<PageResponse<PostDto>>(
      `/fandoms/${fandomId}/posts?${qs.toString()}`
    );
  },

  async getFandomMediaGallery(
    fandomId: number,
    params?: {
      artistOnly?: boolean;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<FandomMediaGalleryItemDto>> {
    const qs = new URLSearchParams();
    if (params?.artistOnly) qs.set("artistOnly", "true");
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 24));
    return request<PageResponse<FandomMediaGalleryItemDto>>(
      `/fandoms/${fandomId}/media?${qs.toString()}`
    );
  },

  async getUserPosts(
    userId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<PostDto>> {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 30));
    return request<PageResponse<PostDto>>(
      `/users/${userId}/posts?${qs.toString()}`
    );
  },

  async getFollowingFeed(params?: {
    artistOnly?: boolean;
    hasMedia?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<PostDto>> {
    const qs = new URLSearchParams();
    if (params?.artistOnly) qs.set("artistOnly", "true");
    if (params?.hasMedia) qs.set("hasMedia", "true");
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 30));
    return request<PageResponse<PostDto>>(`/feed/following?${qs.toString()}`);
  },

  async createPost(
    fandomId: number,
    input: {
      content?: string;
      media?: MediaItemInput[];
    }
  ): Promise<PostDto> {
    return request<PostDto>(`/fandoms/${fandomId}/posts`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updatePost(
    postId: number,
    input: {
      content?: string;
      media?: MediaItemInput[];
    }
  ): Promise<PostDto> {
    return request<PostDto>(`/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async deletePost(postId: number): Promise<void> {
    await request<void>(`/posts/${postId}`, { method: "DELETE" });
  },

  async uploadMedia(
    file: File,
    folder: "posts" | "avatars" | "banners" | "fan-letters" = "posts"
  ): Promise<MediaUploadDto> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return request<MediaUploadDto>("/media/upload", {
      method: "POST",
      body: formData,
    });
  },
};

// ==================== 5. INTERACTIONS (REACTIONS & NESTED COMMENTS) API ====================

export const interactionApi = {
  async togglePostReaction(postId: number): Promise<ReactionToggleDto> {
    return request<ReactionToggleDto>(`/posts/${postId}/reactions/toggle`, {
      method: "POST",
    });
  },

  async toggleCommentReaction(commentId: number): Promise<ReactionToggleDto> {
    return request<ReactionToggleDto>(
      `/comments/${commentId}/reactions/toggle`,
      {
        method: "POST",
      }
    );
  },

  async getPostReactors(
    postId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<ReactorDto>> {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 40));
    return request<PageResponse<ReactorDto>>(
      `/posts/${postId}/reactions?${qs.toString()}`
    );
  },

  async getPostComments(
    postId: number,
    params?: {
      sortBy?: "latest" | "popular";
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<CommentDto>> {
    const qs = new URLSearchParams();
    qs.set("sortBy", params?.sortBy ?? "latest");
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 30));
    return request<PageResponse<CommentDto>>(
      `/posts/${postId}/comments?${qs.toString()}`
    );
  },

  async getCommentReplies(
    commentId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<CommentDto>> {
    const qs = new URLSearchParams();
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 30));
    return request<PageResponse<CommentDto>>(
      `/comments/${commentId}/replies?${qs.toString()}`
    );
  },

  async createComment(
    postId: number,
    input: { content: string; parentId?: number | null }
  ): Promise<CommentDto> {
    return request<CommentDto>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateComment(
    commentId: number,
    input: { content: string }
  ): Promise<CommentDto> {
    return request<CommentDto>(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async deleteComment(commentId: number): Promise<void> {
    await request<void>(`/comments/${commentId}`, { method: "DELETE" });
  },
};

// ==================== 6. FAN LETTERS API ====================

export const fanLetterApi = {
  async getLetterTemplates(freeOnly = false): Promise<LetterTemplateDto[]> {
    return request<LetterTemplateDto[]>(
      `/letter-templates?freeOnly=${freeOnly ? "true" : "false"}`
    );
  },

  async getFandomFanLetters(
    fandomId: number,
    params?: {
      artistId?: number;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<FanLetterDto>> {
    const qs = new URLSearchParams();
    if (params?.artistId != null) qs.set("artistId", String(params.artistId));
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 24));
    return request<PageResponse<FanLetterDto>>(
      `/fandoms/${fandomId}/fan-letters?${qs.toString()}`
    );
  },

  async getMySentLetters(params?: {
    artistId?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<FanLetterDto>> {
    const qs = new URLSearchParams();
    if (params?.artistId != null) qs.set("artistId", String(params.artistId));
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 24));
    return request<PageResponse<FanLetterDto>>(
      `/fan-letters/me?${qs.toString()}`
    );
  },

  async getArtistInbox(params?: {
    visibility?: "ALL" | "PUBLIC" | "PRIVATE";
    page?: number;
    size?: number;
  }): Promise<PageResponse<FanLetterDto>> {
    const qs = new URLSearchParams();
    qs.set("visibility", params?.visibility ?? "ALL");
    qs.set("page", String(params?.page ?? 0));
    qs.set("size", String(params?.size ?? 24));
    return request<PageResponse<FanLetterDto>>(
      `/artists/me/fan-letters?${qs.toString()}`
    );
  },

  async createFanLetter(input: {
    artistId: number;
    templateId?: number | null;
    content: string;
    backgroundImageId?: number | null;
    backgroundImageUrl?: string | null;
    stickerList?: StickerItemDto[];
    isPublic?: boolean;
  }): Promise<FanLetterDto> {
    return request<FanLetterDto>("/fan-letters", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateFanLetter(
    letterId: number,
    input: {
      templateId?: number | null;
      content: string;
      backgroundImageId?: number | null;
      backgroundImageUrl?: string | null;
      clearBackgroundImage?: boolean;
      stickerList?: StickerItemDto[];
      isPublic?: boolean;
    }
  ): Promise<FanLetterDto> {
    return request<FanLetterDto>(`/fan-letters/${letterId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async deleteFanLetter(letterId: number): Promise<void> {
    await request<void>(`/fan-letters/${letterId}`, { method: "DELETE" });
  },
};
