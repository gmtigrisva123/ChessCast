export const site = {
  name: "ChessCast",
  tagline: "Biến mỗi ván cờ thành một show giải trí sống.",
  description:
    "ChessCast biến mỗi ván cờ thành một show giải trí sống: AI bình luận có cá tính tường thuật trận đấu, và khán giả can thiệp trực tiếp bằng Chaos Cards.",
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
  { href: "/royale", label: "Chess Royale" },
  { href: "/court", label: "Chess Court" },
  { href: "/pricing", label: "Bảng giá" },
  { href: "/partners", label: "Đối tác" },
  { href: "/investors", label: "Nhà đầu tư" },
] as const;
