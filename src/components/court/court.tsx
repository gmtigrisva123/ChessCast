"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Gavel, Scale, ShieldQuestion, Users, Video } from "lucide-react";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatNum } from "@/lib/utils";
import type { HostId } from "@/lib/hosts";
import { HOSTS } from "@/lib/hosts";
import { PageHero } from "../ui/page-hero";
import { MiniBoard } from "../ui/mini-board";
import { HostOrb } from "../ui/orb";
import { Button } from "../ui/button";
import { Reveal, Words } from "../ui/reveal";
import { Kicker } from "../ui/section";
import { Spotlight } from "../ui/spotlight";

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
    no: "0427",
    title: "Cố tình câu giờ khi thắng thế",
    accused: "MãĐiênSG",
    plaintiff: "HậuĐen_VN",
    charge: "Hơn hẳn một Hậu nhưng không chiếu hết, đi vòng vòng 40 nước chờ đối thủ hết giờ.",
    prosecution: "Thưa bồi thẩm đoàn, bị cáo có thế thắng +18 nhưng chọn cách hành hạ đối thủ suốt 40 nước. Đây không phải cờ vua — đây là tra tấn tâm lý có tính toán.",
    defense: "Thân chủ tôi chỉ đang… thưởng thức nghệ thuật. Luật không cấm đi chậm. Đồng hồ là một phần của cờ vua mà!",
    fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 61",
    highlight: ["f7", "g7"],
    penalty: "Chơi ván kế tiếp không có Hậu, trực tiếp trên sóng.",
    base: { guilty: 1284, innocent: 611 },
  },
  {
    id: "c431",
    no: "0431",
    title: "Ăn mừng khi đối thủ blunder",
    accused: "tốt_thí_123",
    plaintiff: "BishopBốc",
    charge: "Gõ “EZ” vào chat ngay sau khi đối thủ đi hớ Hậu.",
    prosecution: "Hai ký tự. E. Z. Hai ký tự đã phá huỷ tinh thần thể thao của cả một cộng đồng. Tôi đề nghị mức án cao nhất.",
    defense: "Thân chủ tôi gõ nhầm. Định gõ “EZ… quá trời là hay”, nhưng mạng lag nên mất phần sau.",
    fen: "r1b1k2r/pppp1ppp/2n2n2/2b1p3/2B1P2q/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 6",
    highlight: ["h4", "f3"],
    penalty: "Đổi tên hiển thị thành “Tôi Xin Lỗi” trong 24 giờ.",
    base: { guilty: 902, innocent: 877 },
  },
  {
    id: "c436",
    no: "0436",
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

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 16);
    return () => clearInterval(t);
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] bg-fg" />}
    </>
  );
}

function Bubble({ host, role, children, side = "left" }: { host: HostId; role: string; children: React.ReactNode; side?: "left" | "right" }) {
  return (
    <div className={cn("flex gap-3", side === "right" && "flex-row-reverse text-right")}>
      <HostOrb id={host} size={38} talking={side === "left"} className="mt-1" />
      <div className={cn("max-w-[85%] rounded-3xl border border-white/[0.07] bg-white/[0.03] px-4 py-3", side === "left" ? "rounded-tl-md" : "rounded-tr-md")}>
        <div className="text-[12px] font-medium" style={{ color: HOSTS[host].color }}>
          {HOSTS[host].name} <span className="font-normal text-fg-3">· {role}</span>
        </div>
        <div className="mt-1 text-[14.5px] leading-relaxed text-fg">{children}</div>
      </div>
    </div>
  );
}

function Verdict({ pct }: { pct: number }) {
  const angle = -90 + (pct / 100) * 180;
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <svg viewBox="0 0 200 112" className="w-full">
        <defs>
          <linearGradient id="v-g" x1="0" x2="1">
            <stop offset="0" stopColor="#3ee6e0" />
            <stop offset="0.5" stopColor="#8b7cff" />
            <stop offset="1" stopColor="#ff6b9a" />
          </linearGradient>
        </defs>
        <path d="M14 102 A86 86 0 0 1 186 102" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" strokeLinecap="round" />
        <motion.path d="M14 102 A86 86 0 0 1 186 102" fill="none" stroke="url(#v-g)" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
        <motion.g animate={{ rotate: angle }} transition={{ type: "spring", stiffness: 50, damping: 10 }} style={{ originX: "100px", originY: "102px" }}>
          <line x1="100" y1="102" x2="100" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="102" r="7" fill="#fff" />
      </svg>
      <div className="-mt-2 flex justify-between font-mono text-[11.5px]">
        <span className="text-teal">Vô tội {100 - pct}%</span>
        <span className="text-rose">Có tội {pct}%</span>
      </div>
    </div>
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
    const share = c.base.guilty / (c.base.guilty + c.base.innocent);
    const t = setInterval(() => setTally((v) => ({ guilty: v.guilty + Math.round(Math.random() * 12 * share), innocent: v.innocent + Math.round(Math.random() * 12 * (1 - share)) })), 1200);
    return () => clearInterval(t);
  }, [c]);
  const g = tally.guilty + (mine === "guilty" ? 1 : 0);
  const i = tally.innocent + (mine === "innocent" ? 1 : 0);
  const pct = Math.round((g / (g + i)) * 100);
  const guilty = pct >= 50;
  const cast = (v: "guilty" | "innocent") => {
    vote(c.id, v);
    credit(5);
    toast({ title: v === "guilty" ? "Bạn bỏ phiếu: Có tội" : "Bạn bỏ phiếu: Vô tội", body: "+5 coin thưởng làm bồi thẩm.", tone: v === "guilty" ? "pink" : "cyan" });
  };

  return (
    <motion.div key={c.id} initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0, y: -10, filter: "blur(8px)" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Spotlight className="p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-3">
          <span className="rounded-full border border-white/10 px-2.5 py-1">Vụ án #{c.no}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">Bị cáo: {c.accused}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">Nguyên đơn: {c.plaintiff}</span>
        </div>
        <h3 className="display mt-5 text-3xl">{c.title}</h3>
        <p className="mt-2 text-[15px] text-fg-2">{c.charge}</p>
        <div className="mt-7 space-y-4">
          <Bubble host="zugzwang" role="Công tố viên AI">
            <Typewriter text={c.prosecution} />
          </Bubble>
          <Bubble host="blunder" role="Luật sư bào chữa (bất đắc dĩ)" side="right">
            {c.defense}
          </Bubble>
        </div>
      </Spotlight>
      <div className="flex flex-col gap-4">
        <Spotlight className="p-5">
          <div className="kicker text-fg-3">Vật chứng</div>
          <MiniBoard fen={c.fen} highlight={c.highlight} className="mt-3" />
        </Spotlight>
        <Spotlight className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] font-medium">
              <Users size={16} className="text-violet" /> Bồi thẩm đoàn
            </span>
            <span className="font-mono text-[11px] text-fg-3">{formatNum(g + i)} phiếu</span>
          </div>
          <div className="mt-4">
            <Verdict pct={pct} />
          </div>
          {!mine ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="glass" onClick={() => cast("innocent")}>
                <Scale size={15} /> Vô tội
              </Button>
              <Button variant="ember" onClick={() => cast("guilty")}>
                <Gavel size={15} /> Có tội
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="kicker text-fg-3">Phán quyết tạm thời · bạn chọn {mine === "guilty" ? "có tội" : "vô tội"}</div>
              <div className={cn("display mt-2 text-2xl", guilty ? "text-ember" : "text-aurora")}>{guilty ? "Có tội." : "Trắng án."}</div>
              <p className="mt-1 text-[13.5px] text-fg-2">{guilty ? `Hình phạt: ${c.penalty}` : "Bị cáo được tự do… cho tới vụ tiếp theo."}</p>
            </motion.div>
          )}
        </Spotlight>
      </div>
    </motion.div>
  );
}

const STEPS = [
  { icon: ShieldQuestion, title: "Khiếu nại", body: "Người chơi hoặc khán giả gửi khiếu nại về một hành vi gây tranh cãi." },
  { icon: Gavel, title: "AI công tố", body: "GS. Zugzwang dựng hồ sơ từ dữ liệu ván đấu, chat và clip." },
  { icon: Users, title: "Bồi thẩm đoàn", body: "Khán giả bỏ phiếu trong 10 phút. Chaos Lord được ưu tiên ghế bồi thẩm." },
  { icon: Video, title: "Thi hành án", body: "Hình phạt là một thử thách vui trên sóng — không bao giờ là tiền thật." },
];

export function CourtView() {
  const [active, setActive] = useState(CASES[0].id);
  const c = CASES.find((x) => x.id === active)!;
  return (
    <>
      <PageHero kicker="Chess Court" title="Ván cờ gây tranh cãi? *Đưa ra toà.*" tone="ember">
        AI công tố buộc tội, AI bào chữa cãi lại, khán giả làm bồi thẩm đoàn. Mỗi lá phiếu của bạn được thưởng 5 coin.
      </PageHero>

      <section className="shell pb-16">
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="space-y-2">
            <div className="kicker mb-3 px-1 text-fg-3">Đang xét xử</div>
            {CASES.map((x) => (
              <button key={x.id} onClick={() => setActive(x.id)} className={cn("relative w-full rounded-2xl p-4 text-left transition-colors", active !== x.id && "hover:bg-white/[0.03]")}>
                {active === x.id && <motion.span layoutId="case-pill" className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.05]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <div className="relative flex items-center justify-between font-mono text-[10.5px] text-fg-3">
                  <span>#{x.no}</span>
                  <span className="flex items-center gap-1 text-rose">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> đang xử
                  </span>
                </div>
                <div className="relative mt-1.5 text-[14.5px] font-medium">{x.title}</div>
                <div className="relative mt-0.5 text-[12.5px] text-fg-3">Bị cáo {x.accused}</div>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <CaseRoom key={c.id} c={c} />
          </AnimatePresence>
        </div>
      </section>

      <section className="shell py-24">
        <Kicker tone="ember">Quy trình</Kicker>
        <Words text="Từ khiếu nại tới *phán quyết* trong mười phút." className="display mt-5 max-w-2xl text-[clamp(2rem,4vw,3.2rem)]" accentClass="serif-accent text-ember" />
        <div className="relative mt-12 grid gap-3 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="relative">
                  <span className="relative grid h-[76px] w-[76px] place-items-center rounded-full border border-white/10 bg-night">
                    <Icon size={22} className="text-ember" />
                    <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-fg font-mono text-[10px] text-void">{i + 1}</span>
                  </span>
                  <div className="mt-5 font-display text-lg font-semibold tracking-tight">{s.title}</div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-fg-2">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
