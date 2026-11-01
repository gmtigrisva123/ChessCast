/**
 * Danh mục sản phẩm của ChessCast — nguồn duy nhất cho giá, gói và vật phẩm.
 * Mọi nguồn thu đều là cơ chế giải trí ảo: coin không có giá trị quy đổi
 * thành tiền và không dùng để đặt cược kết quả trận đấu.
 */

export type ChaosCardId = "fog" | "swap" | "random" | "freeze" | "spotlight" | "earthquake";

export type ChaosCard = {
  id: ChaosCardId;
  name: string;
  short: string;
  description: string;
  cost: number;
  rarity: "Thường" | "Hiếm" | "Sử thi" | "Huyền thoại";
  accent: string;
  glyph: string;
  durationLabel: string;
};

export const CHAOS_CARDS: ChaosCard[] = [
  {
    id: "fog",
    name: "Sương Mù Chiến Trường",
    short: "Fog of War",
    description: "Phủ sương 3 hàng giữa bàn cờ trong 4 nước. Cả hai kỳ thủ phải đánh trong mù mịt.",
    cost: 50,
    rarity: "Thường",
    accent: "#48e5ff",
    glyph: "☁",
    durationLabel: "4 nước",
  },
  {
    id: "random",
    name: "Nước Đi Ngẫu Nhiên",
    short: "Random Move",
    description: "Nước kế tiếp của bên đang đi bị chọn ngẫu nhiên trong các nước hợp lệ. Định mệnh quyết định.",
    cost: 80,
    rarity: "Hiếm",
    accent: "#d8ff3c",
    glyph: "⚄",
    durationLabel: "1 nước",
  },
  {
    id: "swap",
    name: "Hoán Đổi Quân",
    short: "Piece Swap",
    description: "Đổi chỗ một Mã và một Tượng của bên đang đi. Thế trận lộn tùng phèo trong tích tắc.",
    cost: 120,
    rarity: "Sử thi",
    accent: "#ff4d6a",
    glyph: "⇄",
    durationLabel: "Tức thì",
  },
  {
    id: "freeze",
    name: "Đóng Băng Đồng Hồ",
    short: "Time Freeze",
    description: "Trừ 15 giây trên đồng hồ của bên đang đi. Áp lực thời gian lên tột đỉnh.",
    cost: 60,
    rarity: "Thường",
    accent: "#9b7bff",
    glyph: "❄",
    durationLabel: "-15 giây",
  },
  {
    id: "spotlight",
    name: "Đèn Sân Khấu",
    short: "Spotlight",
    description: "Ép cả dàn host AI dồn toàn lực bình luận nước tiếp theo. Hype meter nhân đôi.",
    cost: 30,
    rarity: "Thường",
    accent: "#ffd23c",
    glyph: "✦",
    durationLabel: "1 nước",
  },
  {
    id: "earthquake",
    name: "Động Đất",
    short: "Earthquake",
    description: "Rung chuyển bàn cờ — một tốt ngẫu nhiên của bên đang đi bị đẩy lên một ô nếu còn trống.",
    cost: 200,
    rarity: "Huyền thoại",
    accent: "#ff8a3c",
    glyph: "≋",
    durationLabel: "Tức thì",
  },
];

export const TIP_PRESETS = [20, 50, 100, 500] as const;

export type CoinPackId = "starter" | "fan" | "chaos" | "overlord";
export type CoinPack = {
  id: CoinPackId;
  name: string;
  coins: number;
  bonus: number;
  price: number; // VND
  tag?: string;
};

export const COIN_PACKS: CoinPack[] = [
  { id: "starter", name: "Khởi Động", coins: 120, bonus: 0, price: 25_000 },
  { id: "fan", name: "Fan Cứng", coins: 600, bonus: 50, price: 119_000, tag: "Phổ biến" },
  { id: "chaos", name: "Hỗn Loạn", coins: 1_250, bonus: 200, price: 239_000, tag: "Lời nhất" },
  { id: "overlord", name: "Chúa Tể", coins: 2_600, bonus: 600, price: 479_000 },
];

export type PlanId = "free" | "pro" | "lord";
export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number; // VND
  yearly: number; // VND / năm
  monthlyCoins: number;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Khán Giả",
    tagline: "Xem mọi trận, chơi thử hỗn loạn.",
    monthly: 0,
    yearly: 0,
    monthlyCoins: 0,
    features: [
      "Xem không giới hạn trận live",
      "1 host AI bình luận cơ bản",
      "3 clip cao trào mỗi ngày",
      "Mua Chaos Cards bằng coin",
      "Tham gia bồi thẩm đoàn Chess Court",
    ],
  },
  {
    id: "pro",
    name: "Fan Pro",
    tagline: "Giọng bình luận cao cấp, clip vô hạn.",
    monthly: 79_000,
    yearly: 759_000,
    monthlyCoins: 200,
    highlight: true,
    features: [
      "Mọi quyền lợi gói Khán Giả",
      "Mở khóa toàn bộ giọng host AI cao cấp",
      "Clip cao trào không giới hạn, xuất 1080p",
      "Tặng 200 Chaos Coins mỗi tháng",
      "Giảm 10% mọi Chaos Card",
      "Huy hiệu Fan Pro trong chat",
    ],
  },
  {
    id: "lord",
    name: "Chaos Lord",
    tagline: "Cho người muốn điều khiển cả show.",
    monthly: 199_000,
    yearly: 1_899_000,
    monthlyCoins: 600,
    features: [
      "Mọi quyền lợi gói Fan Pro",
      "Tặng 600 Chaos Coins mỗi tháng",
      "Đặt lời “cà khịa” riêng cho host AI",
      "Ưu tiên ghế bồi thẩm Chess Court",
      "Vào sớm Chess Royale mùa mới",
      "Không quảng cáo, khung avatar Huyền thoại",
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
    name: "Tài Trợ Giải Đấu",
    price: "Từ $2,500",
    unit: "/ giải",
    description: "Thương hiệu của bạn đứng tên một giải nghiệp dư — có host AI riêng mang giọng thương hiệu.",
    features: [
      "Host AI tùy biến theo brand voice",
      "Logo trên bàn cờ 3D & overlay",
      "Chaos Card mang thương hiệu",
      "Báo cáo lượt xem & clip viral",
    ],
    cta: "Đặt lịch tư vấn",
  },
  {
    id: "api",
    name: "License / API",
    price: "Từ $499",
    unit: "/ tháng",
    description: "Gắn lớp giải trí của ChessCast vào nền tảng cờ vua của bạn chỉ với vài dòng code.",
    features: [
      "API bình luận AI thời gian thực",
      "Chaos Cards engine + webhook",
      "Bộ cắt clip cao trào tự động",
      "SLA 99.9%, hỗ trợ kỹ thuật riêng",
    ],
    cta: "Lấy API key dùng thử",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Tùy chỉnh",
    unit: "",
    description: "Liên đoàn, giải đấu esports, nhà đài — triển khai trọn gói và chia sẻ doanh thu.",
    features: [
      "White-label toàn bộ trải nghiệm",
      "Chia sẻ doanh thu Chaos Cards",
      "Triển khai on-prem / riêng vùng",
      "Đội ngũ sản xuất nội dung đi kèm",
    ],
    cta: "Liên hệ đội ngũ",
  },
];

export const PRODUCT_SKUS = {
  coin: COIN_PACKS,
  plan: PLANS,
};

export function getCoinPack(id: string) {
  return COIN_PACKS.find((p) => p.id === id);
}
export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}
