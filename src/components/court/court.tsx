"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Gavel, Scale, ShieldQuestion, Users, Video } from "lucide-react";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatNum } from "@/lib/utils";
import { PageHero } from "../ui/page-hero";
import { MiniBoard } from "../ui/mini-board";
import { HostAvatar } from "../ui/host-avatar";
import { Button } from "../ui/button";
import { Reveal, SectionLabel } from "../ui/reveal";

type Case = {
  id: string;
  no: string;
  title: string;
  accused: string;
  plaintiff: string;
  charge: string;
  prosecution: string;
  defense: string;
  fen: string;
  highlight: string[];
  penalty: string;
  base: { guilty: number; innocent: number };
};

const CASES: Case[] = [
  {
    id: "c427",
    no: "#0427",
    title: "Cố tình câu giờ khi thắng thế",
    accused: "MãĐiênSG",
    plaintiff: "HậuĐen_VN",
    charge: "Hơn hẳn một Hậu nhưng không chiếu hết, đi vòng vòng 40 nước chờ đối thủ hết giờ.",
    prosecution:
      "Thưa quý bồi thẩm, bị cáo có thế thắng +18 nhưng chọn cách hành hạ đối thủ suốt 40 nước. Đây không phải cờ vua — đây là tra tấn tâm lý có tính toán.",
    defense: "Thân chủ tôi chỉ đang… thưởng thức nghệ thuật. Luật không cấm đi chậm. Đồng hồ là một phần của cờ vua.",
    fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 61",
    highlight: ["f7", "g7"],
    penalty: "Chơi ván kế tiếp không có Hậu, trực tiếp trên sóng.",
    base: { guilty: 1284, innocent: 611 },
  },
  {
    id: "c431",
    no: "#0431",
    title: "Ăn mừng khi đối thủ blunder",
    accused: "tốt_thí_123",
    plaintiff: "BishopBốc",
    charge: "Gõ “EZ” vào chat ngay sau khi đối thủ đi hớ Hậu.",
    prosecution: "Ba ký tự. E. Z. Ba ký tự đã phá hủy tinh thần thể thao của cả một cộng đồng. Tôi đề nghị mức án cao nhất.",
    defense: "Thân chủ tôi gõ nhầm. Anh ấy định gõ “EZ… quá trời là hay”. Mạng lag nên mất phần sau.",
    fen: "r1b1k2r/pppp1ppp/2n2n2/2b1p3/2B1P2q/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 6",
    highlight: ["h4", "f3"],
    penalty: "Đổi tên hiển thị thành “Tôi Xin Lỗi” trong 24 giờ.",
    base: { guilty: 902, innocent: 877 },
  },
  {
    id: "c436",
    no: "#0436",
    title: "Nghi vấn được Chaos Card “dắt tay”",
    accused: "EnPassantEm",
    plaintiff: "Cộng đồng",
    charge: "Thắng 3 ván liên tiếp nhờ khán giả ném Hoán Đổi Quân đúng lúc đối thủ sắp chiếu hết.",
    prosecution: "Ba lần. Ba lá Hoán Đổi Quân. Ba lần đúng thời điểm vàng. Tôi không tin vào trùng hợp — tôi tin vào thống kê.",
    defense: "Thân chủ tôi không kiểm soát khán giả. Nếu khán giả yêu mến thân chủ tôi, đó là tội của sự đẹp trai.",
    fen: "r3k2r/ppp2ppp/2n5/3qp3/1b1P4/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 9",
    highlight: ["b4", "c3"],
    penalty: "Một tuần không được nhận Chaos Card có lợi.",
    base: { guilty: 455, innocent: 1310 },
  },
];

function Typewriter({ text, speed = 18 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(t), v) : v + 1)), speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return (
    <span>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-current align-middle" />}
    </span>
  );
}

function CaseRoom({ c }: { c: Case }) {
  const votes = useWallet((s) => s.courtVotes);
  const vote = useWallet((s) => s.vote);
  const credit = useWallet((s) => s.credit);
  const toast = useUI((s) => s.toast);
  const mounted = useMounted();
  const mine = mounted ? votes[c.id] : undefined;
  const [tally, setTally] = useState(c.base);
  useEffect(() => {
    setTally(c.base);
    const t = setInterval(() => {
      setTally((v) => ({
        guilty: v.guilty + Math.round(Math.random() * 6 * (c.base.guilty / (c.base.guilty + c.base.innocent)) * 2),
        innocent: v.innocent + Math.round(Math.random() * 6 * (c.base.innocent / (c.base.guilty + c.base.innocent)) * 2),
      }));
    }, 1200);
    return () => clearInterval(t);
  }, [c]);
  const g = tally.guilty + (mine === "guilty" ? 1 : 0);
  const i = tally.innocent + (mine === "innocent" ? 1 : 0);
  const pct = Math.round((g / (g + i)) * 100);
  const verdict = pct >= 50 ? "guilty" : "innocent";

  return (
    <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      <div className="rounded-[28px] border border-cream/10 bg-ink-2 p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-cream/45">
          <span>Vật chứng · Thế cờ tranh cãi</span>
          <span>Vụ án {c.no}</span>
        </div>
        <MiniBoard fen={c.fen} highlight={c.highlight} className="mt-4" />
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-ink-3/70 p-3">
            <div className="text-xs text-cream/45">Bị cáo</div>
            <div className="font-semibold text-pink">{c.accused}</div>
          </div>
          <div className="rounded-2xl bg-ink-3/70 p-3">
            <div className="text-xs text-cream/45">Nguyên đơn</div>
            <div className="font-semibold text-cyan">{c.plaintiff}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-[28px] border border-cream/10 bg-ink-2 p-5">
          <div className="eyebrow text-pink">Cáo trạng</div>
          <h3 className="mt-2 font-display text-3xl font-bold uppercase leading-tight">{c.title}</h3>
          <p className="mt-2 text-cream/65">{c.charge}</p>
        </div>
        <div className="rounded-[28px] border border-pink/30 bg-pink/[0.07] p-5">
          <div className="flex items-center gap-3">
            <HostAvatar id="zugzwang" size={40} talking />
            <div>
              <div className="font-semibold text-cyan">GS. Zugzwang</div>
              <div className="text-xs text-cream/45">Công tố viên AI</div>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-cream/90">
            <Typewriter text={c.prosecution} />
          </p>
        </div>
        <div className="rounded-[28px] border border-cream/10 bg-ink-2 p-5">
          <div className="flex items-center gap-3">
            <HostAvatar id="blunder" size={40} />
            <div>
              <div className="font-semibold text-pink">MC Blunder</div>
              <div className="text-xs text-cream/45">Luật sư bào chữa (bất đắc dĩ)</div>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-cream/75">{c.defense}</p>
        </div>
        <div className="rounded-[28px] border border-cream/10 bg-ink-2 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Users size={18} className="text-lime" /> Bồi thẩm đoàn
            </div>
            <span className="text-xs text-cream/45">{formatNum(g + i)} phiếu</span>
          </div>
          <div className="mt-4 flex justify-between text-sm font-semibold">
            <span className="text-pink">Có tội {pct}%</span>
            <span className="text-cyan">Vô tội {100 - pct}%</span>
          </div>
          <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-ink">
            <motion.div className="bg-pink" animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 70, damping: 14 }} />
            <div className="flex-1 bg-cyan" />
          </div>
          {!mine ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="pink"
                onClick={() => {
                  vote(c.id, "guilty");
                  credit(5);
                  toast({ title: "Đã bỏ phiếu: CÓ TỘI", body: "+5 coin thưởng làm bồi thẩm.", tone: "pink" });
                }}
              >
                <Gavel size={16} /> Có tội
              </Button>
              <Button
                variant="cream"
                className="bg-cyan"
                onClick={() => {
                  vote(c.id, "innocent");
                  credit(5);
                  toast({ title: "Đã bỏ phiếu: VÔ TỘI", body: "+5 coin thưởng làm bồi thẩm.", tone: "cyan" });
                }}
              >
                <Scale size={16} /> Vô tội
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("mt-4 rounded-2xl p-4 text-ink", verdict === "guilty" ? "bg-pink" : "bg-cyan")}>
              <div className="eyebrow text-ink/60">Phán quyết tạm thời · bạn chọn {mine === "guilty" ? "Có tội" : "Vô tội"}</div>
              <div className="mt-1 font-display text-2xl font-bold uppercase">{verdict === "guilty" ? "Có tội!" : "Trắng án!"}</div>
              <p className="mt-1 text-sm text-ink/75">{verdict === "guilty" ? `Hình phạt: ${c.penalty}` : "Bị cáo được tự do… cho đến vụ tiếp theo."}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const STEPS = [
  { icon: ShieldQuestion, title: "Khiếu nại", body: "Sau ván đấu, người chơi hoặc khán giả gửi khiếu nại về hành vi gây tranh cãi." },
  { icon: Gavel, title: "AI công tố", body: "GS. Zugzwang dựng hồ sơ từ dữ liệu ván đấu, chat và clip để buộc tội." },
  { icon: Users, title: "Bồi thẩm đoàn", body: "Khán giả bỏ phiếu trong 10 phút. Thành viên Chaos Lord được ưu tiên ghế bồi thẩm." },
  { icon: Video, title: "Thi hành án", body: "Hình phạt là một thử thách vui trên livestream — không bao giờ là tiền thật." },
];

export function CourtView() {
  const [active, setActive] = useState(CASES[0].id);
  const c = CASES.find((x) => x.id === active)!;
  return (
    <>
      <PageHero
        label="Chess Court · Tòa án khán giả"
        title="Ván cờ tranh cãi?"
        accent="Ra tòa."
        tone="pink"
        aside={
          <div className="relative grid aspect-square w-full max-w-sm place-items-center justify-self-end rounded-[32px] bg-pink text-ink">
            <div className="checker-bg absolute inset-0 rounded-[32px] opacity-30 mix-blend-multiply" />
            <motion.div animate={{ rotate: [0, -35, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8, ease: [0.7, 0, 0.3, 1] }} className="origin-bottom-right">
              <Gavel size={150} strokeWidth={1.5} />
            </motion.div>
            <motion.div className="absolute bottom-10 h-2 w-40 rounded-full bg-ink/30" animate={{ scaleX: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }} />
          </div>
        }
      >
        Sau ván tranh cãi, AI công tố và khán giả làm bồi thẩm đoàn ra phán quyết — hình phạt là thử thách trên livestream. Mỗi lá phiếu của bạn được thưởng 5 coin.
      </PageHero>

      <section className="container-x pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionLabel tone="pink">Phiên tòa đang mở</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase md:text-5xl">Danh sách vụ án</h2>
          </div>
        </div>
        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
          {CASES.map((x) => (
            <button
              key={x.id}
              onClick={() => setActive(x.id)}
              className={cn(
                "relative min-w-[260px] rounded-2xl border p-4 text-left transition-colors",
                active === x.id ? "border-pink bg-pink/10" : "border-cream/10 bg-ink-2 hover:border-cream/25",
              )}
            >
              <div className="flex items-center justify-between text-xs text-cream/45">
                <span>Vụ án {x.no}</span>
                <span className="flex items-center gap-1 text-pink">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-pink" /> Đang xử
                </span>
              </div>
              <div className="mt-1 font-semibold">{x.title}</div>
              <div className="mt-1 text-xs text-cream/50">Bị cáo: {x.accused}</div>
            </button>
          ))}
        </div>
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <CaseRoom key={c.id} c={c} />
          </AnimatePresence>
        </div>
      </section>

      <section className="container-x py-20">
        <SectionLabel>Quy trình</SectionLabel>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="relative h-full rounded-[24px] border border-cream/10 bg-ink-2 p-6">
                  <span className="absolute right-5 top-4 font-display text-5xl font-bold text-cream/5">0{i + 1}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pink text-ink">
                    <Icon size={20} />
                  </span>
                  <div className="mt-5 font-display text-2xl font-bold uppercase">{s.title}</div>
                  <p className="mt-2 text-sm text-cream/60">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
