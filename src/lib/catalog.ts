/**
 * ChessCast product catalog — the single source of truth for prices, plans and items.
 * Every revenue stream is a virtual entertainment mechanic: coins have no cash value
 * and can never be used to bet on the outcome of a game.
 */

/** ISO currency used for checkout (Stripe expects lowercase). Prices below are in minor units (cents). */
export const CURRENCY = "usd" as const;

export type ChaosCardId = "fog" | "swap" | "random" | "freeze" | "spotlight" | "earthquake";

export type ChaosCard = {
  id: ChaosCardId;
  name: string;
  short: string;
  description: string;
  cost: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  accent: string;
  /** Gradient pair used to tint the card */
  tint: [string, string];
  icon: "fog" | "dice" | "swap" | "freeze" | "spotlight" | "quake";
  durationLabel: string;
};

export const CHAOS_CARDS: ChaosCard[] = [
  {
    id: "fog",
    name: "Fog of War",
    short: "Blind spot",
    description: "Three middle ranks vanish under fog for six moves. Both players fight half blind.",
    cost: 50,
    rarity: "Common",
    accent: "#7cc4ff",
    tint: ["#4d8dff", "#3ee6e0"],
    icon: "fog",
    durationLabel: "6 moves",
  },
  {
    id: "random",
    name: "Random Move",
    short: "Fate decides",
    description: "The next move of the side to play is picked at random from every legal move. Pray.",
    cost: 80,
    rarity: "Rare",
    accent: "#b5a8ff",
    tint: ["#8b7cff", "#4d8dff"],
    icon: "dice",
    durationLabel: "1 move",
  },
  {
    id: "swap",
    name: "Piece Swap",
    short: "Shuffle",
    description: "A knight and a bishop of the side to play trade places. Every plan is suddenly wrong.",
    cost: 120,
    rarity: "Epic",
    accent: "#ff8fb4",
    tint: ["#ff6b9a", "#8b7cff"],
    icon: "swap",
    durationLabel: "Instant",
  },
  {
    id: "freeze",
    name: "Time Freeze",
    short: "Clock drain",
    description: "Steals 15 seconds from the clock of the side to play. Time pressure, maximum.",
    cost: 60,
    rarity: "Common",
    accent: "#9ff3ff",
    tint: ["#3ee6e0", "#c7fff7"],
    icon: "freeze",
    durationLabel: "−15 sec",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    short: "All eyes",
    description: "Forces all three AI hosts to go all-in on the next move. The hype meter doubles.",
    cost: 30,
    rarity: "Common",
    accent: "#ffd28a",
    tint: ["#ffc56b", "#ff8a4c"],
    icon: "spotlight",
    durationLabel: "1 move",
  },
  {
    id: "earthquake",
    name: "Earthquake",
    short: "Board shake",
    description: "The board quakes — a random pawn of the side to play is shoved one square forward.",
    cost: 200,
    rarity: "Legendary",
    accent: "#ffa877",
    tint: ["#ff8a4c", "#ff6b9a"],
    icon: "quake",
    durationLabel: "Instant",
  },
];

export const TIP_PRESETS = [20, 50, 100, 500] as const;

export type CoinPackId = "starter" | "fan" | "chaos" | "overlord";
export type CoinPack = {
  id: CoinPackId;
  name: string;
  coins: number;
  bonus: number;
  /** Price in cents */
  price: number;
  tag?: string;
};

export const COIN_PACKS: CoinPack[] = [
  { id: "starter", name: "Opening", coins: 120, bonus: 0, price: 99 },
  { id: "fan", name: "Middlegame", coins: 600, bonus: 50, price: 499, tag: "Popular" },
  { id: "chaos", name: "Chaos", coins: 1_250, bonus: 200, price: 999, tag: "Best value" },
  { id: "overlord", name: "Overlord", coins: 2_600, bonus: 600, price: 1_999 },
];

export type PlanId = "free" | "pro" | "lord";
export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in cents */
  monthly: number;
  /** Yearly price in cents */
  yearly: number;
  monthlyCoins: number;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Spectator",
    tagline: "Watch everything. Taste the chaos.",
    monthly: 0,
    yearly: 0,
    monthlyCoins: 0,
    features: [
      "Unlimited live matches",
      "One core AI host",
      "3 highlight clips per day",
      "Buy Chaos Cards with coins",
      "Sit on the Chess Court jury",
    ],
  },
  {
    id: "pro",
    name: "Fan Pro",
    tagline: "Premium voices, endless clips.",
    monthly: 399,
    yearly: 3_799,
    monthlyCoins: 200,
    highlight: true,
    features: [
      "Everything in Spectator",
      "Every premium AI host voice",
      "Unlimited clips, 1080p export",
      "200 Chaos Coins every month",
      "10% off every Chaos Card",
      "Fan Pro badge in chat",
    ],
  },
  {
    id: "lord",
    name: "Chaos Lord",
    tagline: "For people who want to run the show.",
    monthly: 899,
    yearly: 8_599,
    monthlyCoins: 600,
    features: [
      "Everything in Fan Pro",
      "600 Chaos Coins every month",
      "Write custom roasts for the hosts",
      "Priority Chess Court jury seat",
      "Early access to Chess Royale seasons",
      "No ads, legendary avatar frame",
    ],
  },
];

export type B2BPlan = {
  id: string;
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  cta: string;
};

export const B2B_PLANS: B2BPlan[] = [
  {
    id: "sponsor",
    name: "Tournament sponsorship",
    price: "From $2,500",
    unit: "/ event",
    description: "Put your brand on an amateur tournament — with an AI host that speaks in your brand's voice.",
    features: ["Custom AI host in your brand voice", "Logo on the 3D board and overlays", "Branded Chaos Cards", "Reach and viral-clip reporting"],
    cta: "Book a call",
  },
  {
    id: "api",
    name: "License / API",
    price: "From $499",
    unit: "/ month",
    description: "Plug the ChessCast entertainment layer into your chess platform with a few lines of code.",
    features: ["Real-time AI commentary API", "Chaos Cards engine + webhooks", "Automatic highlight clipping", "99.9% SLA, dedicated support"],
    cta: "Get a trial API key",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    unit: "",
    description: "Federations, esports leagues and broadcasters — full white-label rollout with revenue share.",
    features: ["Full white-label experience", "Chaos Cards revenue share", "Dedicated or regional deployment", "Embedded content production team"],
    cta: "Talk to the team",
  },
];

export function getCoinPack(id: string) {
  return COIN_PACKS.find((p) => p.id === id);
}
export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}
