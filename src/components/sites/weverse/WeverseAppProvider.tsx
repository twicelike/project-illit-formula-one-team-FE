"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DM_WIDGET_ARTISTS, type DmArtistChip } from "./data";
import {
  BlackFridayModal,
  CookieConsentBar,
  CookieCustomizeModal,
  LoginPromptModal,
} from "./Overlays";
import { WeverseDmWidget, type DmWidgetMode } from "./WeverseDmWidget";

export interface DemoUser {
  nickname: string;
  email: string;
  jellyBalance: number;
}

export interface DmChatMessage {
  id: string;
  sender: "artist" | "user";
  text: string;
  timestamp: string;
}

export interface UserPostComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface UserCreatedPost {
  id: string;
  artistSlug: string;
  authorName: string;
  timestamp: string;
  body: string;
  likes: number;
}

export interface CartItem {
  id: string;
  name: string;
  artistName: string;
  priceUsd: number;
  image: string;
  quantity: number;
}

interface WeverseAppContextValue {
  user: DemoUser | null;
  loginDemo: (nickname?: string) => void;
  logoutDemo: () => void;
  addJelly: (amount: number) => void;

  joinedSlugs: string[];
  toggleJoinCommunity: (slug: string) => void;

  likedPostIds: string[];
  toggleLikePost: (postId: string) => void;

  postComments: Record<string, UserPostComment[]>;
  addPostComment: (postId: string, text: string) => void;

  userPosts: UserCreatedPost[];
  createFanPost: (artistSlug: string, body: string) => void;

  dmMode: DmWidgetMode;
  setDmMode: (mode: DmWidgetMode) => void;
  dmSelectedTab: string;
  setDmSelectedTab: (tab: string) => void;
  activeDmArtistId: string | null;
  openDmHome: () => void;
  openDmArtistList: (tab?: string) => void;
  openDmForChip: (chip: DmArtistChip) => void;
  openDmChat: (artistId: string) => void;
  closeDmChat: () => void;
  dmThreads: Record<string, DmChatMessage[]>;
  sendDmMessage: (artistId: string, text: string) => void;

  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateCartQty: (id: string, delta: number) => void;
  clearCart: () => void;

  openLoginModal: (onSuccess?: () => void) => void;
  openCookieModal: () => void;
  showToast: (message: string) => void;
}

const WeverseAppContext = createContext<WeverseAppContextValue | null>(null);

const STORAGE_KEY = "weverse_local_clone_state_v1";

interface PersistedAppState {
  user: DemoUser | null;
  joinedSlugs: string[];
  likedPostIds: string[];
  postComments: Record<string, UserPostComment[]>;
  userPosts: UserCreatedPost[];
  cart: CartItem[];
  bfDismissed: boolean;
  cookieDismissed: boolean;
}

const DEFAULT_PERSISTED_STATE: PersistedAppState = {
  user: null,
  joinedSlugs: ["illit"],
  likedPostIds: [],
  postComments: {},
  userPosts: [],
  cart: [],
  bfDismissed: false,
  cookieDismissed: false,
};

let cachedClientState: PersistedAppState | null = null;
const storeListeners = new Set<() => void>();

function readClientStore(): PersistedAppState {
  if (cachedClientState) return cachedClientState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedClientState = DEFAULT_PERSISTED_STATE;
      return cachedClientState;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    cachedClientState = {
      user: parsed.user ?? null,
      joinedSlugs: Array.isArray(parsed.joinedSlugs)
        ? parsed.joinedSlugs
        : DEFAULT_PERSISTED_STATE.joinedSlugs,
      likedPostIds: Array.isArray(parsed.likedPostIds)
        ? parsed.likedPostIds
        : [],
      postComments: parsed.postComments ?? {},
      userPosts: Array.isArray(parsed.userPosts) ? parsed.userPosts : [],
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      bfDismissed: Boolean(parsed.bfDismissed),
      cookieDismissed: Boolean(parsed.cookieDismissed),
    };
    return cachedClientState;
  } catch {
    cachedClientState = DEFAULT_PERSISTED_STATE;
    return cachedClientState;
  }
}

function updateClientStore(
  updater: (prev: PersistedAppState) => PersistedAppState
) {
  const prev = readClientStore();
  const next = updater(prev);
  cachedClientState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  storeListeners.forEach((fn) => fn());
}

function subscribeClientStore(listener: () => void) {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
}

function getServerStoreSnapshot(): PersistedAppState {
  return DEFAULT_PERSISTED_STATE;
}

const ARTIST_AUTO_REPLIES = [
  "Thank you so much for messaging me today!! It really made me smile 😊💙",
  "Did you eat well today? Make sure to stay warm and take care of yourself!",
  "Just finished practicing and saw your message right away ✨ Always grateful for your support!",
  "Wait really?! That's so sweet haha 🫶 Let's talk again soon!",
];

function formatCurrentTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function buildInitialDmThreads(): Record<string, DmChatMessage[]> {
  const threads: Record<string, DmChatMessage[]> = {};
  for (const artist of DM_WIDGET_ARTISTS) {
    threads[artist.id] = [
      {
        id: `${artist.id}-welcome-1`,
        sender: "artist",
        text: `Hi! Welcome to ${artist.artistName}'s Weverse DM ✨`,
        timestamp: "12:00",
      },
      {
        id: `${artist.id}-welcome-2`,
        sender: "artist",
        text: `${artist.statusText} — how is your day going today?`,
        timestamp: "12:01",
      },
    ];
  }
  return threads;
}

export function WeverseAppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const persisted = useSyncExternalStore(
    subscribeClientStore,
    readClientStore,
    getServerStoreSnapshot
  );

  const {
    user,
    joinedSlugs,
    likedPostIds,
    postComments,
    userPosts,
    cart,
    bfDismissed,
    cookieDismissed,
  } = persisted;

  const [dmMode, setDmMode] = useState<DmWidgetMode>("closed");
  const [dmSelectedTab, setDmSelectedTab] = useState("Recommended");
  const [activeDmArtistId, setActiveDmArtistId] = useState<string | null>(null);
  const [dmThreads, setDmThreads] = useState<Record<string, DmChatMessage[]>>(
    () => buildInitialDmThreads()
  );

  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingLoginAction, setPendingLoginAction] = useState<
    (() => void) | null
  >(null);
  const [dmAuthNotificationArtistId, setDmAuthNotificationArtistId] = useState<
    string | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 2600);
  }, []);

  const loginDemo = useCallback(
    (nickname = "Weverse Fan") => {
      const nextUser: DemoUser = {
        nickname: nickname.trim() || "Weverse Fan",
        email: "fan@weverse.local",
        jellyBalance: 350,
      };
      updateClientStore((prev) => ({ ...prev, user: nextUser }));
      setShowLoginModal(false);
      showToast(`Signed in as ${nextUser.nickname}`);
      if (pendingLoginAction) {
        const fn = pendingLoginAction;
        setPendingLoginAction(null);
        fn();
      }
    },
    [pendingLoginAction, showToast]
  );

  const logoutDemo = useCallback(() => {
    updateClientStore((prev) => ({ ...prev, user: null }));
    setActiveDmArtistId(null);
    showToast("Signed out");
  }, [showToast]);

  const addJelly = useCallback(
    (amount: number) => {
      updateClientStore((prev) => {
        const base = prev.user ?? {
          nickname: "Weverse Fan",
          email: "fan@weverse.local",
          jellyBalance: 350,
        };
        return {
          ...prev,
          user: { ...base, jellyBalance: base.jellyBalance + amount },
        };
      });
      showToast(`+${amount} Jelly added to your balance!`);
    },
    [showToast]
  );

  const openLoginModal = useCallback((onSuccess?: () => void) => {
    setPendingLoginAction(() => onSuccess ?? null);
    setShowLoginModal(true);
  }, []);

  const toggleJoinCommunity = useCallback(
    (slug: string) => {
      if (!user) {
        openLoginModal(() => {
          updateClientStore((prev) => ({
            ...prev,
            joinedSlugs: prev.joinedSlugs.includes(slug)
              ? prev.joinedSlugs
              : [slug, ...prev.joinedSlugs],
          }));
        });
        return;
      }
      const exists = joinedSlugs.includes(slug);
      updateClientStore((prev) => ({
        ...prev,
        joinedSlugs: exists
          ? prev.joinedSlugs.filter((s) => s !== slug)
          : [slug, ...prev.joinedSlugs],
      }));
      showToast(exists ? "Left community" : "Joined community!");
    },
    [user, joinedSlugs, openLoginModal, showToast]
  );

  const toggleLikePost = useCallback((postId: string) => {
    updateClientStore((prev) => ({
      ...prev,
      likedPostIds: prev.likedPostIds.includes(postId)
        ? prev.likedPostIds.filter((id) => id !== postId)
        : [...prev.likedPostIds, postId],
    }));
  }, []);

  const addPostComment = useCallback(
    (postId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const author = user?.nickname ?? "Weverse Fan";
      const comment: UserPostComment = {
        id: `uc-${Date.now()}`,
        author,
        text: trimmed,
        timestamp: "Just now",
      };
      updateClientStore((prev) => ({
        ...prev,
        postComments: {
          ...prev.postComments,
          [postId]: [...(prev.postComments[postId] ?? []), comment],
        },
      }));
    },
    [user]
  );

  const createFanPost = useCallback(
    (artistSlug: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const newPost: UserCreatedPost = {
        id: `up-${Date.now()}`,
        artistSlug,
        authorName: user?.nickname ?? "Weverse Fan",
        timestamp: "Just now",
        body: trimmed,
        likes: 1,
      };
      updateClientStore((prev) => ({
        ...prev,
        userPosts: [newPost, ...prev.userPosts],
      }));
      showToast("Your fan post has been published!");
    },
    [user, showToast]
  );

  const openDmHome = useCallback(() => {
    setActiveDmArtistId(null);
    setDmMode("home");
  }, []);

  const openDmArtistList = useCallback((tab = "Recommended") => {
    setActiveDmArtistId(null);
    setDmSelectedTab(tab);
    setDmMode("artist-list");
  }, []);

  const openDmForChip = useCallback((chip: DmArtistChip) => {
    setActiveDmArtistId(null);
    setDmSelectedTab(chip.name);
    setDmMode("artist-list");
  }, []);

  const openDmChat = useCallback(
    (artistId: string) => {
      if (!user) {
        setDmAuthNotificationArtistId(artistId);
        return;
      }
      setActiveDmArtistId(artistId);
      setDmMode("chat");
    },
    [user]
  );

  const closeDmChat = useCallback(() => {
    setActiveDmArtistId(null);
    setDmMode("artist-list");
  }, []);

  const sendDmMessage = useCallback((artistId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg: DmChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: formatCurrentTime(),
    };
    setDmThreads((prev) => ({
      ...prev,
      [artistId]: [...(prev[artistId] ?? []), msg],
    }));

    // Simulated friendly artist reply
    window.setTimeout(() => {
      const replyText =
        ARTIST_AUTO_REPLIES[
          Math.floor(Math.random() * ARTIST_AUTO_REPLIES.length)
        ];
      const reply: DmChatMessage = {
        id: `r-${Date.now()}`,
        sender: "artist",
        text: replyText,
        timestamp: formatCurrentTime(),
      };
      setDmThreads((prev) => ({
        ...prev,
        [artistId]: [...(prev[artistId] ?? []), reply],
      }));
    }, 900);
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      updateClientStore((prev) => {
        const existing = prev.cart.find((c) => c.id === item.id);
        const nextCart = existing
          ? prev.cart.map((c) =>
              c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
            )
          : [...prev.cart, { ...item, quantity: 1 }];
        return { ...prev, cart: nextCart };
      });
      showToast(`Added "${item.name}" to your bag`);
    },
    [showToast]
  );

  const updateCartQty = useCallback((id: string, delta: number) => {
    updateClientStore((prev) => ({
      ...prev,
      cart: prev.cart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  const clearCart = useCallback(() => {
    updateClientStore((prev) => ({ ...prev, cart: [] }));
  }, []);

  return (
    <WeverseAppContext.Provider
      value={{
        user,
        loginDemo,
        logoutDemo,
        addJelly,
        joinedSlugs,
        toggleJoinCommunity,
        likedPostIds,
        toggleLikePost,
        postComments,
        addPostComment,
        userPosts,
        createFanPost,
        dmMode,
        setDmMode,
        dmSelectedTab,
        setDmSelectedTab,
        activeDmArtistId,
        openDmHome,
        openDmArtistList,
        openDmForChip,
        openDmChat,
        closeDmChat,
        dmThreads,
        sendDmMessage,
        cart,
        addToCart,
        updateCartQty,
        clearCart,
        openLoginModal,
        openCookieModal: () => setShowCookieModal(true),
        showToast,
      }}
    >
      {children}

      {/* Global Floating Weverse DM Widget */}
      <WeverseDmWidget
        mode={dmMode}
        selectedTab={dmSelectedTab}
        activeArtistId={activeDmArtistId}
        threads={dmThreads}
        isLoggedIn={Boolean(user)}
        onModeChange={setDmMode}
        onSelectTab={setDmSelectedTab}
        onSelectArtistRow={openDmChat}
        onBackFromChat={closeDmChat}
        onSendMessage={sendDmMessage}
      />

      {/* Authentic Weverse DM Notification Modal (steps/761/media_0.png) */}
      {dmAuthNotificationArtistId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Notification"
          className="fixed inset-0 z-[155] flex items-center justify-center bg-black/45 px-[16px]"
          onClick={() => setDmAuthNotificationArtistId(null)}
        >
          <div
            className="w-full max-w-[400px] rounded-[16px] bg-white px-[24px] pb-[24px] pt-[28px] text-center shadow-[0_16px_48px_rgba(0,0,0,0.24)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="m-0 text-[18px] font-bold leading-[24px] text-black">
              Notification
            </h2>
            <p className="mb-0 mt-[14px] text-[14px] leading-[21px] text-[#484848]">
              You need to log in.
              <br />
              Log in now?
            </p>
            <div className="mt-[24px] grid grid-cols-2 gap-[10px]">
              <button
                type="button"
                onClick={() => setDmAuthNotificationArtistId(null)}
                className="h-[46px] rounded-[8px] border border-[#e4e4e4] bg-white text-[14px] font-bold text-[#111111] transition-colors hover:bg-[#f7f8fa]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetArtistId = dmAuthNotificationArtistId;
                  setDmAuthNotificationArtistId(null);
                  openLoginModal(() => {
                    setActiveDmArtistId(targetArtistId);
                    setDmMode("chat");
                  });
                }}
                className="h-[46px] rounded-[8px] bg-[#00cbd5] text-[14px] font-bold text-white transition-colors hover:bg-[#00b8c1]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initial Overlays */}
      <BlackFridayModal
        open={!bfDismissed && pathname === "/"}
        onClose={() =>
          updateClientStore((prev) => ({ ...prev, bfDismissed: true }))
        }
        onDismissForever={() =>
          updateClientStore((prev) => ({ ...prev, bfDismissed: true }))
        }
      />

      <CookieConsentBar
        open={!cookieDismissed}
        onRefuse={() =>
          updateClientStore((prev) => ({ ...prev, cookieDismissed: true }))
        }
        onCustomize={() => setShowCookieModal(true)}
        onAcceptAll={() =>
          updateClientStore((prev) => ({ ...prev, cookieDismissed: true }))
        }
      />

      <CookieCustomizeModal
        open={showCookieModal}
        onClose={() => setShowCookieModal(false)}
        onSave={() => {
          setShowCookieModal(false);
          updateClientStore((prev) => ({ ...prev, cookieDismissed: true }));
        }}
      />

      <LoginPromptModal
        open={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingLoginAction(null);
        }}
        onConfirmLogin={loginDemo}
      />

      {/* Subtle Toast Banner */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-[24px] left-1/2 z-[180] -translate-x-1/2 rounded-full bg-[#111111]/90 px-[20px] py-[10px] text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)]"
        >
          {toastMessage}
        </div>
      )}
    </WeverseAppContext.Provider>
  );
}

export function useWeverseApp(): WeverseAppContextValue {
  const ctx = useContext(WeverseAppContext);
  if (!ctx) {
    throw new Error("useWeverseApp must be used within WeverseAppProvider");
  }
  return ctx;
}
