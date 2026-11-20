import { FEATURED_ARTISTS, type FeaturedArtist } from "./data";

export interface CommunityMemberProfile {
  name: string;
  birthday: string;
  avatar: string;
  bio: string;
}

export interface CommunityPost {
  id: string;
  type: "artist" | "fan";
  authorName: string;
  authorAvatar: string;
  verified?: boolean;
  membershipBadge?: boolean;
  timestamp: string;
  body: string;
  images?: string[];
  likes: number;
  comments: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }>;
}

export interface CommunityNotice {
  id: string;
  artistSlug: string;
  artistName: string;
  title: string;
  date: string;
  shortDate: string;
  isNew?: boolean;
  intro: string;
  sections: Array<{
    heading: string;
    lines: string[];
  }>;
  notes: string[];
  ctaLabel: string;
  ctaType: "dm" | "shop" | "community";
}

export interface CommunityMerchItem {
  id: string;
  artistSlug: string;
  artistName: string;
  name: string;
  priceUsd: number;
  image: string;
  badges: Array<"EXCLUSIVE" | "PRE-ORDER" | "GIFT" | "BLACK FRIDAY">;
  description: string;
}

export interface CommunityMediaItem {
  id: string;
  kind: "video" | "live";
  title: string;
  authorName: string;
  authorAvatar: string;
  thumbnail: string;
  duration: string;
  date: string;
  views: string;
  likes: string;
  description: string;
}

export interface CommunityFanLetter {
  id: string;
  toName: string;
  fromName: string;
  image: string;
  note: string;
  accentBg: string;
}

export interface CommunityDetailBundle {
  artist: FeaturedArtist;
  accentColor: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  memberCountLabel: string;
  members: CommunityMemberProfile[];
  artistPosts: CommunityPost[];
  fanPosts: CommunityPost[];
  notices: CommunityNotice[];
  merch: CommunityMerchItem[];
  media: CommunityMediaItem[];
  fanLetters: CommunityFanLetter[];
}

const ACCENT_COLORS: Record<string, string> = {
  illit: "#E9687E",
  bts: "#7B42F6",
  seventeen: "#5E9EA0",
  lesserafim: "#111111",
  enhypen: "#D83B3B",
  tws: "#4D9DE0",
  boynextdoor: "#2563EB",
  p1harmony: "#4E89A6",
  pixxie: "#D9468F",
  katseye: "#E05A97",
  redvelvet: "#D6335A",
  stayc: "#E871A2",
  kep1er: "#D9383A",
  jvke: "#2B7A9E",
  jd1: "#3E94C4",
  lngshot: "#1C1C1E",
  leesungkyoung: "#D95D4E",
  hanbin: "#222222",
  marklee: "#333333",
};

export const GLOBAL_NOTICES: CommunityNotice[] = [
  {
    id: "40731",
    artistSlug: "illit",
    artistName: "ILLIT",
    title: "[EVENT] ILLIT Weverse DM Special Event!",
    date: "Nov 10, 12:00",
    shortDate: "2026.11.10",
    intro:
      "Hello from BELIFT LAB.\nTo thank everyone for the love and support for ILLIT 5th Mini Album ‘Break Even’, we're hosting an exclusive Weverse DM unreleased image giveaway event!\n\nSend a message using Weverse DM to the artist right now and get an unreleased exclusive image!",
    sections: [
      {
        heading: "[Event Period]",
        lines: ["Tue. November 10, 2026, 2:00 PM - Mon. November 30, 2026, 11:59 PM (KST)"],
      },
      {
        heading: "[Event Prize]",
        lines: [
          "An unreleased exclusive image of the ILLIT member",
          "※ The images will be sent via each member's Weverse DM.",
        ],
      },
      {
        heading: "[Event Prize Distribution Date (KST)]",
        lines: ["Fri. December 4, 2026"],
      },
      {
        heading: "[How to Participate in the Event]",
        lines: [
          "Send a DM to any ILLIT member at least once during the event period to be automatically entered!",
        ],
      },
    ],
    notes: [
      "1. Sending messages that are irrelevant to the artist or violating the Weverse Community Guideline will result in penalties.",
      "2. Participating in the event with messages using fraudulent methods, such as spamming and other abusive actions, will result in exclusion from the draw or cancellation of the prize.",
      "3. You must have a valid Weverse DM subscription on the event prize distribution date to receive the event prize.",
    ],
    ctaLabel: "Go to Weverse DM",
    ctaType: "dm",
  },
  {
    id: "41154",
    artistSlug: "illit",
    artistName: "ILLIT",
    title: "[NOTICE] ILLIT Members’ Health and Upcoming Music Show Schedule",
    date: "Nov 18, 15:00",
    shortDate: "2026.11.18",
    isNew: true,
    intro:
      "Hello.\nThis is BELIFT LAB.\n\nWe would like to share an update regarding ILLIT members' health condition and upcoming broadcast schedule this week.",
    sections: [
      {
        heading: "[Schedule Update]",
        lines: [
          "All five members have recovered steadily and will participate in this week's live music broadcasts as planned.",
          "Pre-recording check-in times will be announced separately to confirmed participants.",
        ],
      },
      {
        heading: "[Support Guidelines]",
        lines: [
          "Please bring your official light stick and check the fan cheer guide prior to arrival.",
        ],
      },
    ],
    notes: [
      "1. Schedule details are subject to change based on on-site broadcast conditions.",
      "2. We sincerely thank GLLIT for the continuous warmth and encouragement.",
    ],
    ctaLabel: "Visit ILLIT Community",
    ctaType: "community",
  },
  {
    id: "40364",
    artistSlug: "illit",
    artistName: "ILLIT",
    title: "[GUIDE] '체포하겠어 (You’re Under Arrest)' 응원법",
    date: "Nov 08, 18:00",
    shortDate: "2026.11.08",
    intro:
      "Hello from BELIFT LAB.\nHere is the official fanchant guide for ILLIT's title track '체포하겠어 (You’re Under Arrest)'. Shout along with ILLIT on every music show stage!",
    sections: [
      {
        heading: "[Intro Fanchant]",
        lines: [
          "YUNAH! MINJU! MOKA! WONHEE! IROHA! ILLIT!",
          "Repeat with the beat during the pre-chorus countdown.",
        ],
      },
      {
        heading: "[Chorus Highlight]",
        lines: [
          "Match the clap rhythm right before the drop and cheer loudly on the bridge.",
        ],
      },
    ],
    notes: [
      "1. Please respect fellow fans' sightlines when raising official light sticks.",
    ],
    ctaLabel: "Visit ILLIT Community",
    ctaType: "community",
  },
  {
    id: "40947",
    artistSlug: "boynextdoor",
    artistName: "BOYNEXTDOOR",
    title: "[EVENT] BOYNEXTDOOR Weverse DM Special Gift Event!",
    date: "Nov 14, 14:00",
    shortDate: "2026.11.14",
    isNew: true,
    intro:
      "Hello from KOZ ENTERTAINMENT.\nCelebrate BOYNEXTDOOR's Weverse DM anniversary with an exclusive behind-the-scenes voice & selfie gift event!",
    sections: [
      {
        heading: "[Event Period]",
        lines: ["Nov 14, 2026, 2:00 PM - Nov 30, 2026, 11:59 PM (KST)"],
      },
      {
        heading: "[How to Participate]",
        lines: [
          "Send a cheerful message via Weverse DM to any BOYNEXTDOOR member during the event period.",
        ],
      },
    ],
    notes: [
      "1. Active Weverse DM subscription is required at prize distribution.",
    ],
    ctaLabel: "Open Weverse DM",
    ctaType: "dm",
  },
  {
    id: "40946",
    artistSlug: "enhypen",
    artistName: "ENHYPEN",
    title: "[EVENT] ENHYPEN Weverse DM Special Gift Event!",
    date: "Nov 13, 14:00",
    shortDate: "2026.11.13",
    intro:
      "Hello from BELIFT LAB.\nSend a message to ENHYPEN on Weverse DM during the promotion window to receive an unreleased backstage photo card image!",
    sections: [
      {
        heading: "[Event Period]",
        lines: ["Nov 13, 2026, 2:00 PM - Nov 30, 2026, 11:59 PM (KST)"],
      },
      {
        heading: "[Event Prize]",
        lines: ["Unreleased member selfie image delivered directly in Weverse DM."],
      },
    ],
    notes: [
      "1. Only messages sent within the event window qualify.",
    ],
    ctaLabel: "Open Weverse DM",
    ctaType: "dm",
  },
  {
    id: "40439",
    artistSlug: "seventeen",
    artistName: "SEVENTEEN",
    title: '[EVENT] DK & JEONGHAN\'S "NO-CLUE" TRIP VOD X PHOTOBOOK',
    date: "Nov 12, 11:00",
    shortDate: "2026.11.12",
    intro:
      'Hello from PLEDIS Entertainment.\nCelebrate the launch of DK & JEONGHAN\'S "NO-CLUE" TRIP VOD & Photobook edition with a special Weverse Shop pre-order gift event!',
    sections: [
      {
        heading: "[Pre-order Schedule]",
        lines: ["Thu. November 12, 2026, 11:00 AM - Wed. November 25, 2026, 11:59 PM (KST)"],
      },
      {
        heading: "[Special Gifts]",
        lines: [
          "1 unreleased duo mini-poster + 2 selfie photocards included with every VOD + Photobook bundle.",
        ],
      },
    ],
    notes: [
      "1. Special gifts may run out early while supplies last.",
    ],
    ctaLabel: "Browse Merch in Local Shop",
    ctaType: "shop",
  },
  {
    id: "black-friday-2026",
    artistSlug: "illit",
    artistName: "Weverse Shop",
    title: "[CAMPAIGN] 2026 BLACK FRIDAY — UP TO 90% OFF!",
    date: "Nov 20, 00:00",
    shortDate: "2026.11.20",
    isNew: true,
    intro:
      "Weverse Shop's biggest annual event is here! From Nov 20 to Dec 04, enjoy up to 90% OFF official artist albums, tour merch, Season's Greetings, and daily flash drops.",
    sections: [
      {
        heading: "[Campaign Period]",
        lines: ["Nov 20, 2026, 11:00 AM - Dec 04, 2026, 6:00 PM (KST)"],
      },
      {
        heading: "[Highlights]",
        lines: [
          "• Daily 11 AM Flash Deals across BTS, SEVENTEEN, ILLIT, ENHYPEN, TWS, BOYNEXTDOOR & more",
          "• Extra 10% coupon bundle on Season's Greetings pre-orders",
          "• Free special emblem sticker pack on orders over $50",
        ],
      },
    ],
    notes: [
      "1. Discount rates vary by item and region.",
      "2. Explore all featured items directly in our local Shop view below.",
    ],
    ctaLabel: "Shop 2026 Black Friday Deals",
    ctaType: "shop",
  },
];

export const LOCAL_SHOP_ITEMS: CommunityMerchItem[] = [
  {
    id: "illit-blanket",
    artistSlug: "illit",
    artistName: "ILLIT",
    name: "'DEARLIT' Winter Fairy Blanket",
    priceUsd: 27.9,
    image: "/sites/weverse/hero/slide-07.webp",
    badges: ["EXCLUSIVE", "PRE-ORDER", "GIFT"],
    description:
      "Cozy pastel fleece blanket featuring ILLIT's 'Dear My Winter Fairy' original character artwork.",
  },
  {
    id: "illit-hairpin",
    artistSlug: "illit",
    artistName: "ILLIT",
    name: "'DEARLIT' Character Hairpin Set",
    priceUsd: 11.45,
    image: "/sites/weverse/community/illit/fan-letter-1.webp",
    badges: ["EXCLUSIVE", "PRE-ORDER", "GIFT"],
    description:
      "Collectible 5-piece Winter Fairy plush hairpin set crafted for everyday styling.",
  },
  {
    id: "illit-cape",
    artistSlug: "illit",
    artistName: "ILLIT",
    name: "'DEARLIT' Mini Plush Cape",
    priceUsd: 11.45,
    image: "/sites/weverse/community/illit/fan-letter-2.webp",
    badges: ["EXCLUSIVE", "PRE-ORDER", "GIFT"],
    description:
      "Soft baby-blue ribbon cape tailored for ILLIT mini plush keyrings.",
  },
  {
    id: "svt-sg-2027",
    artistSlug: "seventeen",
    artistName: "SEVENTEEN",
    name: "SEVENTEEN 2027 SEASON'S GREETINGS",
    priceUsd: 42.0,
    image: "/sites/weverse/hero/slide-04.webp",
    badges: ["PRE-ORDER", "GIFT"],
    description:
      "Desk calendar, photobook, digital code making video, and 13-member photocard pack.",
  },
  {
    id: "tws-sg-2027",
    artistSlug: "tws",
    artistName: "TWS",
    name: "TWS 2027 SEASON'S GREETINGS (TWS AIRWAYS)",
    priceUsd: 39.5,
    image: "/sites/weverse/hero/slide-06.webp",
    badges: ["EXCLUSIVE", "PRE-ORDER"],
    description:
      "Aviation-themed collector tin case including luggage tags, boarding pass cards, and calendar.",
  },
  {
    id: "bnd-sg-2027",
    artistSlug: "boynextdoor",
    artistName: "BOYNEXTDOOR",
    name: "BOYNEXTDOOR 2027 SEASON'S GREETINGS",
    priceUsd: 39.5,
    image: "/sites/weverse/hero/slide-05.webp",
    badges: ["PRE-ORDER", "GIFT"],
    description:
      "Complete 2027 package with diary, poster set, and special Weverse Shop pre-order photo frame.",
  },
  {
    id: "bts-kaohsiung-hoodie",
    artistSlug: "bts",
    artistName: "BTS",
    name: "BTS WORLD TOUR ARIRANG Zip-Up Hoodie",
    priceUsd: 78.0,
    image: "/sites/weverse/hero/slide-12.webp",
    badges: ["EXCLUSIVE"],
    description:
      "Washed olive heavyweight tour zip-up hoodie with embroidered '26' crest & Kaohsiung back print.",
  },
  {
    id: "p1h-sg-2027",
    artistSlug: "p1harmony",
    artistName: "P1Harmony",
    name: "P1Harmony 2027 SEASON'S GREETINGS",
    priceUsd: 38.0,
    image: "/sites/weverse/hero/slide-10.webp",
    badges: ["PRE-ORDER"],
    description:
      "[Wishing You a Bright Future!] edition with photobook, desk calendar, and postcard set.",
  },
  {
    id: "marklee-billboard",
    artistSlug: "marklee",
    artistName: "Mark Lee",
    name: "Billboard Korea Artist Magazine x Mark Lee",
    priceUsd: 24.0,
    image: "/sites/weverse/hero/slide-08.webp",
    badges: ["PRE-ORDER", "GIFT"],
    description:
      "Collector cover edition featuring exclusive interview, studio pictorial, and folded poster.",
  },
  {
    id: "bf-mystery-box",
    artistSlug: "illit",
    artistName: "BLACK FRIDAY",
    name: "2026 Black Friday Random Photocard Pack",
    priceUsd: 6.9,
    image: "/sites/weverse/popup/black-friday.png",
    badges: ["BLACK FRIDAY", "EXCLUSIVE"],
    description:
      "Limited Black Friday 90% OFF special promo drop available Nov 20 – Dec 04.",
  },
];

export const JELLY_PACKS = [
  { id: "jelly-20", amount: 20, bonus: 0, priceUsd: 4.99, popular: false },
  { id: "jelly-50", amount: 50, bonus: 3, priceUsd: 11.99, popular: false },
  { id: "jelly-100", amount: 100, bonus: 8, priceUsd: 22.99, popular: true },
  { id: "jelly-250", amount: 250, bonus: 25, priceUsd: 54.99, popular: false },
  { id: "jelly-500", amount: 500, bonus: 60, priceUsd: 104.99, popular: false },
] as const;

export function getArtistBySlug(slug: string): FeaturedArtist | undefined {
  return FEATURED_ARTISTS.find(
    (item) => item.slug.toLowerCase() === slug.toLowerCase()
  );
}

export function getCommunityDetail(slug: string): CommunityDetailBundle {
  const artist: FeaturedArtist = getArtistBySlug(slug) ?? {
    id: 999,
    name: slug.replace(/-/g, " ").toUpperCase(),
    slug: slug.toLowerCase(),
    headerImage: "/sites/weverse/hero/slide-15.webp",
    logoImage: "/sites/weverse/artists/kep1er-logo.webp",
    members: [slug.replace(/-/g, " ").toUpperCase()],
    category: "Group",
  };
  const accentColor = ACCENT_COLORS[artist.slug] ?? "#00CBD5";

  if (artist.slug === "illit") {
    return {
      artist,
      accentColor,
      heroDesktopImage: "/sites/weverse/community/illit/hero-desktop.jpg",
      heroMobileImage: "/sites/weverse/community/illit/hero-mobile.webp",
      memberCountLabel: "1,482,910 GLLIT",
      members: [
        {
          name: "YUNAH",
          birthday: "Jan 15, 2004",
          avatar: "/sites/weverse/community/illit/member-yunah.webp",
          bio: "Leader energy, bold stage charisma & endless laughs with GLLIT.",
        },
        {
          name: "MINJU",
          birthday: "May 11, 2004",
          avatar: "/sites/weverse/community/illit/member-minju.webp",
          bio: "Dreamy vocal tone and late-night music recommendations.",
        },
        {
          name: "MOKA",
          birthday: "Oct 08, 2004",
          avatar: "/sites/weverse/community/illit/member-moka.webp",
          bio: "Detailed stage expressions, café diaries & warm smiles.",
        },
        {
          name: "WONHEE",
          birthday: "Jun 26, 2007",
          avatar: "/sites/weverse/community/illit/member-wonhee.webp",
          bio: "Bright charm and spontaneous behind-the-scenes moments.",
        },
        {
          name: "IROHA",
          birthday: "Feb 04, 2008",
          avatar: "/sites/weverse/community/illit/member-iroha.webp",
          bio: "Sharp choreography & cozy late-night LIVE chats.",
        },
      ],
      artistPosts: [
        {
          id: "illit-artist-1",
          type: "artist",
          authorName: "이로 하.. 저 혹시 조장하실 분?",
          authorAvatar: "/sites/weverse/community/illit/artist-iroha-avatar.webp",
          verified: true,
          timestamp: "Nov 17, 09:12",
          body: "(  ｰ̀֊ｰ́ )☆\nGLLIT did you watch today's behind photos? Sending lots of cozy winter energy!!",
          images: [
            "/sites/weverse/community/illit/post-1.webp",
            "/sites/weverse/community/illit/post-2.webp",
            "/sites/weverse/community/illit/post-3.webp",
          ],
          likes: 29744,
          comments: [
            {
              id: "c1",
              author: "GLLIT_star",
              text: "IROHA these photos are unreal!! Stay warm this week 💖",
              timestamp: "Nov 17, 09:14",
            },
            {
              id: "c2",
              author: "moka_latte",
              text: "Best styling ever ☆ see you on Music Bank!",
              timestamp: "Nov 17, 09:19",
            },
          ],
        },
        {
          id: "illit-artist-2",
          type: "artist",
          authorName: "WONHEE",
          authorAvatar: "/sites/weverse/community/illit/member-wonhee.webp",
          verified: true,
          timestamp: "Nov 15, 21:05",
          body: "Winter Fairy merch preview just dropped ❄️ Which plush is your favorite GLLIT?!",
          images: ["/sites/weverse/hero/slide-07.webp"],
          likes: 24180,
          comments: [
            {
              id: "c3",
              author: "winter_fairy",
              text: "Getting the blanket + plush cape immediately!!",
              timestamp: "Nov 15, 21:08",
            },
          ],
        },
      ],
      fanPosts: [
        {
          id: "illit-fan-1",
          type: "fan",
          authorName: "Moon • 샤 넬 ☕",
          authorAvatar: "/sites/weverse/community/illit/fan-avatar-1.jpg",
          membershipBadge: true,
          timestamp: "Nov 18, 19:40",
          body: "Thinking about you ☕❤️❤️ Counting down every single day until the weekend fan meeting! Everyone stay healthy!",
          images: ["/sites/weverse/community/illit/fan-post-1.jpg"],
          likes: 141,
          comments: [
            {
              id: "fc1",
              author: "gllit_cloud",
              text: "Have the best time at the fan meeting!!",
              timestamp: "Nov 18, 19:52",
            },
          ],
        },
        {
          id: "illit-fan-2",
          type: "fan",
          authorName: "アイリットStan",
          authorAvatar: "/sites/weverse/community/illit/member-moka.webp",
          timestamp: "Nov 20, 08:15",
          body: "ベッコちゃんの完成イラストだよ！！🥰💕 Spent all night painting this for the comeback celebration! Hope ILLIT sees it!",
          images: ["/sites/weverse/community/illit/fan-post-2.png"],
          likes: 189,
          comments: [
            {
              id: "fc2",
              author: "minju_bunnies",
              text: "So talented!! The colors match DEARLIT perfectly ✨",
              timestamp: "Nov 20, 08:40",
            },
          ],
        },
        {
          id: "illit-fan-3",
          type: "fan",
          authorName: "DearMyGLLIT",
          authorAvatar: "/sites/weverse/community/illit/member-yunah.webp",
          membershipBadge: true,
          timestamp: "Nov 19, 14:22",
          body: "Just practiced the full 'You're Under Arrest' fanchant ten times in a row — my voice is ready for Saturday's stage 🔥",
          likes: 64,
          comments: [],
        },
        {
          id: "illit-fan-4",
          type: "fan",
          authorName: "pastel_ribbon",
          authorAvatar: "/sites/weverse/community/illit/member-minju.webp",
          timestamp: "Nov 19, 11:03",
          body: "Rewatching Iroha's 1.5 hour UFO LIVE while drinking hot cocoa 🛸☕ Best comfort stream ever.",
          likes: 92,
          comments: [],
        },
      ],
      notices: GLOBAL_NOTICES.filter((n) => n.artistSlug === "illit"),
      merch: LOCAL_SHOP_ITEMS.filter((m) => m.artistSlug === "illit"),
      media: [
        {
          id: "illit-vid-1",
          kind: "video",
          title: "Presented by ILLIT 💌 D-5 #WONHEE #IROHA",
          authorName: "ILLIT",
          authorAvatar: artist.logoImage,
          thumbnail: "/sites/weverse/community/illit/video-thumb.jpg",
          duration: "00:12",
          date: "Nov 19, 18:00",
          views: "184K",
          likes: "38.2K",
          description:
            "Special D-5 countdown invitation from WONHEE and IROHA ahead of ILLIT's winter event.",
        },
        {
          id: "illit-live-1",
          kind: "live",
          title: "롱이 왔지롱🛸",
          authorName: "이로 하.. 저 혹시 조장하실 분?",
          authorAvatar: "/sites/weverse/community/illit/artist-iroha-avatar.webp",
          thumbnail: "/sites/weverse/community/illit/live-thumb.jpg",
          duration: "01:29:00",
          date: "Nov 19, 22:10",
          views: "412K",
          likes: "1.9M",
          description:
            "Full replay of IROHA's late-night chat with GLLIT — sharing rehearsal stories, playlist picks, and Q&A.",
        },
      ],
      fanLetters: [
        {
          id: "fl-1",
          toName: "ILLIT",
          fromName: "Moka_Diary",
          image: "/sites/weverse/community/illit/fan-letter-1.webp",
          note: "Thank you for making every single day brighter this autumn & winter! Always cheering for all 5 of you 💕",
          accentBg: "#fce8ee",
        },
        {
          id: "fl-2",
          toName: "WONHEE",
          fromName: "SkyRibbon",
          image: "/sites/weverse/community/illit/fan-letter-2.webp",
          note: "Wonhee you are so cute and lovely! Good luck on every stage this week ✨",
          accentBg: "#e3f2fd",
        },
        {
          id: "fl-3",
          toName: "IROHA",
          fromName: "StarryGLLIT",
          image: "/sites/weverse/community/illit/post-1.webp",
          note: "Loved your UFO LIVE so much!! Rest well after practice 🛸",
          accentBg: "#f3e8ff",
        },
        {
          id: "fl-4",
          toName: "MINJU",
          fromName: "VelvetNote",
          image: "/sites/weverse/community/illit/post-2.webp",
          note: "Your live vocals during the chorus gave me goosebumps 🎤💗",
          accentBg: "#fff3e0",
        },
      ],
    };
  }

  // Generic rich real-asset community bundle for any of the other 51 artists!
  const memberNames =
    artist.members && artist.members.length > 0 ? artist.members : [artist.name];
  const members: CommunityMemberProfile[] = memberNames.map((name, idx) => ({
    name,
    birthday: ["Mar 14", "Jun 22", "Sep 08", "Nov 19", "Jan 27", "Aug 05"][
      idx % 6
    ],
    avatar: idx === 0 ? artist.logoImage : artist.headerImage,
    bio: `Official ${artist.name} member on Weverse.`,
  }));

  const artistNotices = GLOBAL_NOTICES.filter(
    (n) => n.artistSlug === artist.slug
  );
  const notices: CommunityNotice[] =
    artistNotices.length > 0
      ? artistNotices
      : [
          {
            id: `notice-${artist.slug}-welcome`,
            artistSlug: artist.slug,
            artistName: artist.name,
            title: `[NOTICE] Welcome to the Official ${artist.name} Weverse Community!`,
            date: "Nov 19, 12:00",
            shortDate: "2026.11.19",
            isNew: true,
            intro: `Welcome to ${artist.name}'s official global fandom community on Weverse!\nConnect with ${artist.name} through Artist posts, Fan Feed, Media, LIVE broadcasts, and Weverse DM.`,
            sections: [
              {
                heading: "[Community Guide]",
                lines: [
                  "• Tap 'Join Now' in the banner to add this community to your My Communities sidebar.",
                  "• Share supportive posts and fan letters while following Weverse Community Guidelines.",
                ],
              },
            ],
            notes: [
              "1. Enjoy exclusive behind-the-scenes updates and LIVE replays right here.",
            ],
            ctaLabel: "Open Weverse DM",
            ctaType: "dm",
          },
          GLOBAL_NOTICES[6],
        ];

  const artistMerch = LOCAL_SHOP_ITEMS.filter(
    (m) => m.artistSlug === artist.slug
  );

  return {
    artist,
    accentColor,
    heroDesktopImage: artist.headerImage,
    heroMobileImage: artist.headerImage,
    memberCountLabel: `${(120 + artist.id * 43).toLocaleString()} fans`,
    members,
    artistPosts: [
      {
        id: `${artist.slug}-artist-1`,
        type: "artist",
        authorName: memberNames[0],
        authorAvatar: artist.logoImage,
        verified: true,
        timestamp: "Nov 19, 18:20",
        body: `Hello everyone! Thank you always for cheering for ${artist.name} 💙 Hope you're having a cozy week — can't wait to share what we've been preparing!`,
        images: [artist.headerImage],
        likes: 12480 + artist.id * 130,
        comments: [
          {
            id: `${artist.slug}-ac1`,
            author: `${artist.slug}_fan`,
            text: `So excited!! Always supporting ${artist.name} ✨`,
            timestamp: "Nov 19, 18:24",
          },
        ],
      },
    ],
    fanPosts: [
      {
        id: `${artist.slug}-fan-1`,
        type: "fan",
        authorName: "GlobalFan_26",
        authorAvatar: artist.logoImage,
        membershipBadge: true,
        timestamp: "Nov 20, 10:15",
        body: `Listening to ${artist.name} on repeat all morning!! Who else is counting down to the next comeback & LIVE stream? 🎧✨`,
        images: [artist.headerImage],
        likes: 87,
        comments: [
          {
            id: `${artist.slug}-fc1`,
            author: "mint_wave",
            text: "Me!! Best playlist of the year 🙌",
            timestamp: "Nov 20, 10:21",
          },
        ],
      },
      {
        id: `${artist.slug}-fan-2`,
        type: "fan",
        authorName: "StarlightNotes",
        authorAvatar: artist.headerImage,
        timestamp: "Nov 19, 22:08",
        body: `Sending warm wishes to ${artist.name} from around the world! Thank you for always bringing comfort through your music 💌`,
        likes: 53,
        comments: [],
      },
    ],
    notices,
    merch: artistMerch.length > 0 ? artistMerch : LOCAL_SHOP_ITEMS.slice(0, 4),
    media: [
      {
        id: `${artist.slug}-vid-1`,
        kind: "video",
        title: `[BEHIND] ${artist.name} Special Greeting Video`,
        authorName: artist.name,
        authorAvatar: artist.logoImage,
        thumbnail: artist.headerImage,
        duration: "02:18",
        date: "Nov 18, 18:00",
        views: "94K",
        likes: "19.4K",
        description: `Exclusive greeting & behind-the-scenes clip from ${artist.name} on Weverse.`,
      },
      {
        id: `${artist.slug}-live-1`,
        kind: "live",
        title: `${artist.name} Surprise LIVE ✨`,
        authorName: memberNames[0],
        authorAvatar: artist.logoImage,
        thumbnail: artist.headerImage,
        duration: "42:15",
        date: "Nov 16, 21:30",
        views: "215K",
        likes: "640K",
        description: `Replay of ${artist.name}'s interactive fan Q&A LIVE session.`,
      },
    ],
    fanLetters: [
      {
        id: `${artist.slug}-fl-1`,
        toName: artist.name,
        fromName: "ForeverFan",
        image: artist.headerImage,
        note: `Dear ${artist.name}, thank you for inspiring us every single day!`,
        accentBg: "#edf3ff",
      },
      {
        id: `${artist.slug}-fl-2`,
        toName: memberNames[0],
        fromName: "MintSky",
        image: artist.logoImage,
        note: `Always rooting for you ${memberNames[0]}! Stay happy and healthy 💙`,
        accentBg: "#dffafb",
      },
    ],
  };
}
