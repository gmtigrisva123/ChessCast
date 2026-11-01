import type { PieceSymbol } from "chess.js";
import type { ChaosCardId } from "./catalog";
import { pick } from "./utils";

export type HostId = "gambit" | "zugzwang" | "blunder";

export type Host = {
  id: HostId;
  name: string;
  handle: string;
  role: string;
  bio: string;
  color: string;
  catchphrase: string;
  voice: { pitch: number; rate: number };
  rival: HostId;
  stats: { label: string; value: string }[];
};

export const HOSTS: Record<HostId, Host> = {
  gambit: {
    id: "gambit",
    name: "Captain Gambit",
    handle: "@captgambit",
    role: "Host chính · Cuồng thí quân",
    bio: "Giọng hét có thể làm vỡ kính. Tin rằng mọi quân cờ sinh ra là để hy sinh. Đang có mối thù 3 mùa với GS. Zugzwang.",
    color: "#d8ff3c",
    catchphrase: "THÍ ĐI! THÍ HẾT ĐI!",
    voice: { pitch: 1.1, rate: 1.12 },
    rival: "zugzwang",
    stats: [
      { label: "Độ hype", value: "11/10" },
      { label: "Quân đã thí", value: "∞" },
    ],
  },
  zugzwang: {
    id: "zugzwang",
    name: "GS. Zugzwang",
    handle: "@gs.zugzwang",
    role: "Chuyên gia phân tích · Lạnh lùng",
    bio: "Tiến sĩ khoa học thế cờ. Nói bằng con số, khinh bỉ bằng ánh mắt. Chưa bao giờ cười kể từ năm 1997.",
    color: "#48e5ff",
    catchphrase: "Về mặt kỹ thuật, đây là một thảm họa.",
    voice: { pitch: 0.75, rate: 0.95 },
    rival: "gambit",
    stats: [
      { label: "Độ chính xác", value: "99.7%" },
      { label: "Lần mỉm cười", value: "0" },
    ],
  },
  blunder: {
    id: "blunder",
    name: "MC Blunder",
    handle: "@mc.blunder",
    role: "Chuyên gia cà khịa · Hỗn loạn",
    bio: "Sống vì những nước đi sai. Nhận tip để “cà khịa” kỳ thủ theo yêu cầu. Bị cấm ở 4 giải đấu vì nói quá thật.",
    color: "#ff4d6a",
    catchphrase: "Ối dồi ôi, toang thật rồi!",
    voice: { pitch: 1.3, rate: 1.18 },
    rival: "zugzwang",
    stats: [
      { label: "Lượt cà khịa", value: "48.2K" },
      { label: "Lần bị report", value: "312" },
    ],
  },
};

export const HOST_LIST = Object.values(HOSTS);

export const PIECE_NAME: Record<PieceSymbol, string> = {
  p: "tốt",
  n: "mã",
  b: "tượng",
  r: "xe",
  q: "hậu",
  k: "vua",
};

export type Line = { host: HostId; text: string; hype: number };

export type MoveContext = {
  san: string;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  to: string;
  player: string;
  opponent: string;
  check: boolean;
  mate: boolean;
  castle: boolean;
  promotion: boolean;
  /** Chênh lệch điểm theo góc nhìn người vừa đi (centipawn). Âm = tệ đi. */
  swing: number;
  /** Điểm thế cờ sau nước đi theo góc nhìn người vừa đi. */
  evalAfter: number;
  ply: number;
  forced?: boolean;
  spotlight?: boolean;
};

const fill = (s: string, c: MoveContext) =>
  s
    .replaceAll("{p}", c.player)
    .replaceAll("{o}", c.opponent)
    .replaceAll("{piece}", PIECE_NAME[c.piece])
    .replaceAll("{cap}", c.captured ? PIECE_NAME[c.captured] : "")
    .replaceAll("{sq}", c.to)
    .replaceAll("{san}", c.san)
    .replaceAll("{ev}", (Math.abs(c.evalAfter) / 100).toFixed(1));

const T = {
  mate: {
    gambit: [
      "CHIẾU HẾT! {san}! {p} KẾT LIỄU TRẬN ĐẤU! TÔI KHÔNG THỞ ĐƯỢC NỮA!",
      "HẾT CỜ! {p} vừa viết tên mình lên bầu trời đêm nay!",
    ],
    zugzwang: ["Chiếu hết. Kết quả tất yếu của một chuỗi quyết định đáng ngờ từ {o}.", "{san}. Hết cờ. Tôi đã dự đoán điều này từ 9 nước trước."],
    blunder: ["{o} ơi, về nhà thôi con, mẹ gọi về ăn cơm rồi!", "Toang! Toang thật sự! {o} chính thức bị xóa sổ!"],
  },
  bigCapture: {
    gambit: ["ĂN {cap}! {p} vừa nuốt trọn quân {cap} ở {sq}!", "BÙM! {cap} của {o} bay màu! Khán giả dậy sóng!"],
    zugzwang: ["{piece} ăn {cap} tại {sq}. Cán cân vật chất nghiêng hẳn, khoảng {ev} tốt.", "Bắt {cap}. Đúng như sách vở. Nhàm chán nhưng hiệu quả."],
    blunder: ["Mất {cap} rồi {o} ơi, đau như bị người yêu cũ block!", "{o} tặng {cap} như phát lì xì Tết vậy á?"],
  },
  capture: {
    gambit: ["{p} ăn quân ở {sq}! Trận đấu nóng lên rồi!", "Đổi quân! Máu đã đổ trên bàn cờ!"],
    zugzwang: ["{san}. Một trao đổi hợp lý.", "Bắt quân ở {sq}. Không có gì để bàn thêm."],
    blunder: ["Ăn qua ăn lại như hai đứa giành đồ ăn vặt.", "Cái {cap} đó tội nghiệp, chưa kịp làm gì đã ra đi."],
  },
  check: {
    gambit: ["CHIẾU! {p} đang dí vua {o} chạy khắp bàn!", "CHIẾU TƯỚNG! Vua {o} đổ mồ hôi hột!"],
    zugzwang: ["Chiếu. Câu hỏi là: {p} có kế hoạch tiếp theo không, hay chỉ chiếu cho vui?", "{san}. Một nước chiếu… thiếu chiều sâu."],
    blunder: ["Vua {o} đang chạy như bị đòi nợ!", "Chiếu kìa! {o} ơi bình tĩnh, hít thở sâu nào!"],
  },
  castle: {
    gambit: ["Nhập thành! {p} xây pháo đài, chuẩn bị tổng tấn công!"],
    zugzwang: ["Nhập thành. Quyết định đầu tiên tôi đồng ý trong trận này.", "An toàn vua. Ít nhất {p} có đọc chương 1."],
    blunder: ["Vua trốn vào góc như né deadline vậy đó.", "Nhập thành rồi, giờ ai cũng giả vờ an toàn."],
  },
  promotion: {
    gambit: ["PHONG HẬU! Tốt nhỏ thành nữ hoàng! CỔ TÍCH CÓ THẬT!"],
    zugzwang: ["Phong cấp. Lợi thế quyết định, khoảng +{ev}."],
    blunder: ["Tốt lên đời rồi kìa, giờ đi đâu cũng có người chào!"],
  },
  blunder: {
    gambit: ["KHOAN! {san}?! {p} vừa làm gì vậy?! Đây là thí quân hay thí… sự nghiệp?!", "Một nước đi táo bạo! Hoặc là thiên tài, hoặc là… không!"],
    zugzwang: ["{san}. Đánh giá: sai lầm nghiêm trọng. Thế cờ tụt khoảng {ev} tốt.", "Tôi cần một phút để chấp nhận rằng {p} thật sự vừa đi {san}."],
    blunder: ["ỐI DỒI ÔI! {p} vừa blunder trên sóng trực tiếp!", "Clip này lên TikTok chắc chắn triệu view, {p} ơi là {p}!"],
  },
  great: {
    gambit: ["NƯỚC ĐI ĐẸP NHƯ TRANH! {san}! {p} đang bay!", "Đó mới là cờ! {p} đọc bàn cờ như đọc truyện tranh!"],
    zugzwang: ["{san}. Chính xác. Tôi miễn cưỡng công nhận.", "Nước tốt nhất trong thế cờ. Hiếm thấy ở trình độ này."],
    blunder: ["Ơ kìa, {p} hôm nay ăn gì mà đánh hay thế?", "Ủa ai cho {p} đánh hay vậy? Không cho phép!"],
  },
  quiet: {
    gambit: ["{p} đi {san}! Từng nước một, áp lực đang dâng!", "{piece} lên {sq}! Tôi cảm nhận được một cơn bão sắp tới!", "{san}! Mọi người chuẩn bị Chaos Card đi là vừa!"],
    zugzwang: ["{san}. Hợp lý.", "{piece} về {sq}. Thế cờ cân bằng, khoảng {ev} tốt.", "Một nước chờ. Thú vị như xem sơn khô."],
    blunder: ["{p} đi {san}, nhìn tự tin vậy chứ chắc đang run.", "{piece} đi dạo tới {sq} thôi à, chill ghê.", "Trận này mà không ai ném Chaos Card thì tôi ngủ mất."],
  },
  opening: {
    gambit: ["Trận đấu bắt đầu! {p} mở màn với {san}! KHÁN GIẢ ƠI CHUẨN BỊ!"],
    zugzwang: ["{san}. Khai cuộc kinh điển. Hãy xem họ phá hỏng nó nhanh thế nào."],
    blunder: ["{p} mở bằng {san}, chưa gì đã thấy mùi drama."],
  },
  forced: {
    gambit: ["CHAOS CARD! Nước đi bị định mệnh chọn: {san}! KHÔNG AI ĐOÁN ĐƯỢC!"],
    zugzwang: ["Nước đi ngẫu nhiên: {san}. Đây là lý do tôi phản đối Chaos Cards."],
    blunder: ["Khán giả chọn giùm {p} nước {san} luôn rồi, khỏi cần nghĩ!"],
  },
};

const banter: Record<HostId, string[]> = {
  gambit: ["Zugzwang, ông có biết “vui” là gì không?", "Đừng nghe ông giáo sư, ông ấy chưa thí quân bao giờ!"],
  zugzwang: ["Gambit, la hét không làm nước đi hay hơn.", "Như mọi khi, Gambit đã sai về mặt toán học."],
  blunder: ["Hai ông già cãi nhau kìa, tôi đi pha mì đây.", "Theo dõi drama của Gambit với Zugzwang mùa 3 trên kênh tụi tui nha!"],
};

function hostOrder(primary: HostId): HostId[] {
  const others = (["gambit", "zugzwang", "blunder"] as HostId[]).filter((h) => h !== primary);
  return [primary, pick(others)];
}

/** Sinh 1–2 câu bình luận cho một nước đi. */
export function commentMove(c: MoveContext): Line[] {
  let bucket: keyof typeof T = "quiet";
  let hype = 8;
  if (c.mate) {
    bucket = "mate";
    hype = 100;
  } else if (c.forced) {
    bucket = "forced";
    hype = 55;
  } else if (c.swing < -180) {
    bucket = "blunder";
    hype = 70;
  } else if (c.promotion) {
    bucket = "promotion";
    hype = 65;
  } else if (c.captured && (c.captured === "q" || c.captured === "r")) {
    bucket = "bigCapture";
    hype = 50;
  } else if (c.check) {
    bucket = "check";
    hype = 35;
  } else if (c.castle) {
    bucket = "castle";
    hype = 12;
  } else if (c.captured) {
    bucket = c.captured === "n" || c.captured === "b" ? "bigCapture" : "capture";
    hype = c.captured === "p" ? 18 : 30;
  } else if (c.swing > 120) {
    bucket = "great";
    hype = 30;
  } else if (c.ply <= 1) {
    bucket = "opening";
    hype = 20;
  }

  const primary: HostId =
    bucket === "blunder" ? "blunder" : bucket === "quiet" ? pick(["gambit", "zugzwang", "blunder"] as HostId[]) : bucket === "great" ? "zugzwang" : "gambit";
  const order = hostOrder(primary);
  const lines: Line[] = [{ host: order[0], text: fill(pick(T[bucket][order[0]]), c), hype }];
  const twoHosts = c.spotlight || hype >= 30 || Math.random() < 0.25;
  if (twoHosts) lines.push({ host: order[1], text: fill(pick(T[bucket][order[1]]), c), hype: Math.round(hype * 0.6) });
  if (c.spotlight) {
    const third = (["gambit", "zugzwang", "blunder"] as HostId[]).find((h) => !order.includes(h))!;
    lines.push({ host: third, text: fill(pick(T[bucket][third]), c), hype: Math.round(hype * 0.5) });
  } else if (Math.random() < 0.08) {
    const h = pick(["gambit", "zugzwang", "blunder"] as HostId[]);
    lines.push({ host: h, text: pick(banter[h]), hype: 4 });
  }
  return lines;
}

export const CHAOS_LINES: Record<ChaosCardId, Record<HostId, string[]>> = {
  fog: {
    gambit: ["SƯƠNG MÙ PHỦ KÍN CHIẾN TRƯỜNG! {u} vừa ném Fog of War!"],
    zugzwang: ["Sương mù. Cảm ơn {u}, giờ không ai thấy gì, kể cả tôi."],
    blunder: ["{u} bật chế độ đánh cờ trong phòng xông hơi luôn rồi!"],
  },
  random: {
    gambit: ["{u} kích hoạt NƯỚC ĐI NGẪU NHIÊN! ĐỊNH MỆNH NẮM QUYỀN!"],
    zugzwang: ["Nước đi ngẫu nhiên. {u}, anh/chị có biết mình vừa làm gì không?"],
    blunder: ["{u} vừa bảo kỳ thủ: thôi để vũ trụ quyết định đi em!"],
  },
  swap: {
    gambit: ["HOÁN ĐỔI QUÂN! Mã và Tượng đổi chỗ! {u} ĐÚNG LÀ ĐIÊN!"],
    zugzwang: ["Mã và Tượng hoán đổi. Toàn bộ phân tích của tôi vừa thành rác. Cảm ơn {u}."],
    blunder: ["{u} xáo bàn cờ như xáo bài Tiến Lên, kỳ thủ đứng hình!"],
  },
  freeze: {
    gambit: ["ĐÓNG BĂNG! {u} lấy mất 15 giây! ĐỒNG HỒ ĐANG GÀO THÉT!"],
    zugzwang: ["Trừ 15 giây. Áp lực thời gian làm tăng 34% xác suất sai lầm."],
    blunder: ["{u} rút 15 giây như rút tiền lương cuối tháng!"],
  },
  spotlight: {
    gambit: ["ĐÈN SÂN KHẤU BẬT! Cả dàn host dồn mắt vào nước tiếp theo!"],
    zugzwang: ["Spotlight. Tôi buộc phải tập trung. Miễn cưỡng."],
    blunder: ["{u} bật đèn rồi, ai blunder giờ là lên sóng toàn quốc!"],
  },
  earthquake: {
    gambit: ["ĐỘNG ĐẤT!!! BÀN CỜ RUNG CHUYỂN! {u} LÀ HUYỀN THOẠI!"],
    zugzwang: ["Một con tốt vừa bị đẩy lên bởi… địa chất. Tôi từ chức."],
    blunder: ["{u} đạp bàn luôn rồi mọi người ơi! Động đất 9 độ richter!"],
  },
};

export function commentChaos(card: ChaosCardId, user: string): Line[] {
  const hosts = (["gambit", "zugzwang", "blunder"] as HostId[]).sort(() => Math.random() - 0.5).slice(0, 2);
  return hosts.map((h, i) => ({
    host: h,
    text: pick(CHAOS_LINES[card][h]).replaceAll("{u}", user),
    hype: i === 0 ? 45 : 20,
  }));
}

export function commentTip(user: string, amount: number, target: string, request?: string): Line[] {
  const req = request?.trim();
  return [
    {
      host: "blunder",
      text: req
        ? `Cảm ơn ${user} tip ${amount} coin! Theo yêu cầu: “${req}” — ${target} nghe rõ chưa?!`
        : pick([
            `${user} tip ${amount} coin để tôi cà khịa ${target}: đánh cờ như đang chơi cờ caro vậy đó!`,
            `${amount} coin từ ${user}! ${target} ơi, nước đi của bạn làm Stockfish phải xin nghỉ phép!`,
            `Tip ${amount} coin! ${target}, nhìn bạn suy nghĩ mà tôi thấy cái đồng hồ cũng mệt!`,
          ]),
      hype: Math.min(60, 10 + amount / 10),
    },
  ];
}

export function speak(text: string, host: HostId, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const vi = voices.find((v) => v.lang?.toLowerCase().startsWith("vi"));
    if (vi) u.voice = vi;
    u.lang = vi?.lang ?? "vi-VN";
    u.pitch = HOSTS[host].voice.pitch;
    u.rate = HOSTS[host].voice.rate;
    window.speechSynthesis.speak(u);
  } catch {
    /* bỏ qua */
  }
}
