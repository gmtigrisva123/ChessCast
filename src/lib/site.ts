export const site = {
  name: "ChessCast",
  tagline: "Every game deserves a stage.",
  description:
    "ChessCast turns every chess game into a live show: AI hosts with real personalities call every move, and the audience bends the match with Chaos Cards.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://chesscast.io",
  emails: {
    hello: "hello@chesscast.io",
    partners: "partners@chesscast.io",
    invest: "invest@chesscast.io",
    support: "support@chesscast.io",
  },
  socials: {
    tiktok: "https://www.tiktok.com/@chesscast",
    youtube: "https://www.youtube.com/@chesscast",
    discord: "https://discord.gg/chesscast",
    x: "https://x.com/chesscast",
  },
};

export const nav = [
  { href: "/live", label: "Arena", badge: "LIVE" },
  { href: "/royale", label: "Royale" },
  { href: "/court", label: "Court" },
  { href: "/pricing", label: "Pricing" },
  { href: "/partners", label: "Partners" },
  { href: "/investors", label: "Investors" },
] as const;
