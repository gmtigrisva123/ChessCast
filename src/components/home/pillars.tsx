"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Gavel, MessageCircle, Users, Zap } from "lucide-react";
import { CHAOS_CARDS } from "@/lib/catalog";
import { HOSTS, type HostId } from "@/lib/hosts";
import { HostAvatar } from "../ui/host-avatar";
import { SectionLabel } from "../ui/reveal";
import { useMedia } from "@/hooks/use-media";
import { cn } from "@/lib/utils";

const CHAT: { host: HostId; text: string }[] = [
  { host: "gambit", text: "THÍ MÃ Ở F7! TÔI KHÔNG TIN NỔI VÀO MẮT MÌNH!" },
  { host: "zugzwang", text: "Đánh giá: -3.2. Một quyết định… dũng cảm theo nghĩa tiêu cực." },
  { host: "blunder", text: "Ối dồi ôi, ai cho bạn này cầm quân vậy?" },
  { host: "gambit", text: "Zugzwang, ông đúng là chẳng biết vui là gì!" },
];

function CommentaryVisual() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v % CHAT.length) + 1), 1700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex h-full flex-col justify-end gap-3">
      <AnimatePresence initial={false}>
        {CHAT.slice(0, n).map((c, i) => (
          <motion.div
            key={i + c.text}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className={cn("flex max-w-[92%] items-start gap-3", i % 2 && "self-end flex-row-reverse")}
          >
            <HostAvatar id={c.host} size={40} talking={i === n - 1} />
            <div className="rounded-2xl bg-ink/70 px-4 py-2.5 text-sm text-cream/90">
              <div className="text-xs font-semibold" style={{ color: HOSTS[c.host].color }}>
                {HOSTS[c.host].name}
              </div>
              {c.text}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function CardsVisual() {
  return (
    <div className="relative grid h-full place-items-center">
      {CHAOS_CARDS.slice(0, 3).map((c, i) => (
        <motion.div
          key={c.id}
          className="absolute flex aspect-[5/7] w-[38%] flex-col justify-between rounded-2xl border bg-ink-2 p-3 shadow-2xl"
          style={{ borderColor: c.accent }}
          initial={{ rotate: 0, x: 0 }}
          whileInView={{ rotate: (i - 1) * 14, x: `${(i - 1) * 55}%`, y: Math.abs(i - 1) * 16 }}
          whileHover={{ y: -20, scale: 1.05, zIndex: 10 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.accent }}>
            {c.short}
          </span>
          <span className="text-center font-display text-5xl" style={{ color: c.accent }}>
            {c.glyph}
          </span>
          <span className="font-display text-sm font-bold uppercase leading-tight">{c.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

function CourtVisual() {
  const [g, setG] = useState(50);
  useEffect(() => {
    const t = setInterval(() => setG(40 + Math.round(Math.random() * 40)), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="flex items-center gap-4">
        <motion.div animate={{ rotate: [0, -28, 0] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }} className="grid h-16 w-16 origin-bottom-right place-items-center rounded-2xl bg-pink text-ink">
          <Gavel size={30} />
        </motion.div>
        <div>
          <div className="text-xs uppercase tracking-widest text-cream/50">Vụ án #0427</div>
          <div className="font-display text-xl font-bold uppercase">“Cố tình câu giờ khi thắng thế”</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-pink">Có tội {g}%</span>
          <span className="text-cyan">Vô tội {100 - g}%</span>
        </div>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-ink">
          <motion.div className="bg-pink" animate={{ width: `${g}%` }} transition={{ type: "spring", stiffness: 80, damping: 15 }} />
          <motion.div className="flex-1 bg-cyan" />
        </div>
        <p className="mt-3 text-sm text-cream/55">Hình phạt dự kiến: chơi ván tiếp theo không có Hậu, trực tiếp trên sóng.</p>
      </div>
    </div>
  );
}

function RoyaleVisual() {
  const [dead, setDead] = useState<Set<number>>(new Set());
  useEffect(() => {
    const t = setInterval(() => {
      setDead((d) => {
        if (d.size > 92) return new Set();
        const n = new Set(d);
        for (let k = 0; k < 4; k++) n.add(Math.floor(Math.random() * 100));
        return n;
      });
    }, 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mx-auto flex h-full w-full max-w-[min(100%,40vh)] flex-col justify-center">
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 100 }, (_, i) => (
          <motion.span
            key={i}
            className="aspect-square rounded-[4px]"
            animate={dead.has(i) ? { scale: [1, 1.6, 0], opacity: [1, 1, 0.12], backgroundColor: "#ff4d6a" } : { scale: 1, opacity: 1, backgroundColor: "#d8ff3c" }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
      <div className="mt-4 flex justify-between font-display text-lg font-bold uppercase">
        <span>Còn lại</span>
        <span className="text-lime tabular-nums">{100 - dead.size}/100</span>
      </div>
    </div>
  );
}

const PILLARS = [
  {
    n: "01",
    icon: MessageCircle,
    title: "AI Bình Luận Có Cá Tính",
    body: "Nhiều host AI với giọng nói và cá tính riêng, có thù hằn và cốt truyện dài hạn giữa các host. Ngay cả ván cờ vô danh cũng có người tường thuật như chung kết thế giới.",
    href: "/live",
    cta: "Nghe họ bình luận",
    color: "#d8ff3c",
    Visual: CommentaryVisual,
  },
  {
    n: "02",
    icon: Zap,
    title: "Chaos Cards",
    body: "Khán giả trả coin để can thiệp trực tiếp: sương mù chiến trường, hoán đổi quân, nước đi ngẫu nhiên. Mỗi lá bài là một cú plot-twist trên sóng.",
    href: "/pricing#coins",
    cta: "Xem bộ bài",
    color: "#ff4d6a",
    Visual: CardsVisual,
  },
  {
    n: "03",
    icon: Gavel,
    title: "Chess Court",
    body: "Sau ván tranh cãi, AI công tố và khán giả làm bồi thẩm đoàn ra phán quyết — hình phạt là thử thách trên livestream.",
    href: "/court",
    cta: "Vào phiên tòa",
    color: "#48e5ff",
    Visual: CourtVisual,
  },
  {
    n: "04",
    icon: Users,
    title: "Chess Royale",
    body: "100 người chơi, một lưới trận đấu, loại trực tiếp — thua là “nổ” khỏi màn hình. Kịch tính kiểu battle royale cho cờ vua.",
    href: "/royale",
    cta: "Đăng ký mùa mới",
    color: "#9b7bff",
    Visual: RoyaleVisual,
  },
];

function PillarCard({ p }: { p: (typeof PILLARS)[number] }) {
  const Icon = p.icon;
  const V = p.Visual;
  return (
    <article className="group relative grid h-full min-h-[560px] overflow-hidden lg:min-h-0 rounded-[32px] border border-cream/10 bg-ink-2 md:grid-cols-[1fr_1.05fr]">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60" style={{ background: p.color }} />
      <div className="relative flex flex-col justify-between p-7 md:p-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl text-ink" style={{ background: p.color }}>
              <Icon size={22} />
            </span>
            <span className="font-display text-5xl font-bold text-cream/10">{p.n}</span>
          </div>
          <h3 className="mt-6 font-display text-4xl font-bold uppercase leading-[0.95] md:text-5xl">{p.title}</h3>
          <p className="mt-4 max-w-md text-cream/65">{p.body}</p>
        </div>
        <Link href={p.href} className="mt-8 inline-flex items-center gap-2 font-semibold" style={{ color: p.color }} data-cursor="hover">
          {p.cta} <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="relative m-3 overflow-hidden rounded-[24px] bg-ink p-6 md:m-4">
        <div className="checker-bg absolute inset-0 opacity-50" />
        <div className="relative h-full min-h-[260px] lg:min-h-0">
          <V />
        </div>
      </div>
    </article>
  );
}

export function Pillars() {
  const ref = useRef<HTMLElement>(null);
  const desktop = useMedia("(min-width: 1024px)", true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "-75%"]);
  const progress = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  if (!desktop) {
    return (
      <section className="container-x py-24" aria-labelledby="pillars-title">
        <SectionLabel>Giải pháp · 4 trụ cột</SectionLabel>
        <h2 id="pillars-title" className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95]">
          ChessCast là gì?
        </h2>
        <div className="mt-10 space-y-5">
          {PILLARS.map((p) => (
            <PillarCard key={p.n} p={p} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[400vh]" aria-labelledby="pillars-title">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-24">
        <div className="container-x flex items-end justify-between gap-8">
          <div>
            <SectionLabel>Giải pháp · 4 trụ cột</SectionLabel>
            <h2 id="pillars-title" className="mt-3 max-w-5xl font-display text-[clamp(2.2rem,4vw,3.8rem)] font-bold uppercase leading-[0.95]">
              Bốn cú hích biến <span className="text-lime">ván cờ vô danh</span> thành nội dung đáng xem.
            </h2>
          </div>
          <div className="mb-3 hidden w-48 shrink-0 xl:block">
            <div className="h-1 overflow-hidden rounded-full bg-cream/10">
              <motion.div className="h-full origin-left bg-lime" style={{ scaleX: progress }} />
            </div>
            <div className="mt-2 text-right text-xs uppercase tracking-widest text-cream/40">Cuộn ngang →</div>
          </div>
        </div>
        <div className="mt-6 min-h-0 flex-1 pb-8">
          <motion.div style={{ x }} className="flex h-full w-[400%] gap-6 pl-[max(16px,calc((100vw-1360px)/2+48px))]">
            {PILLARS.map((p) => (
              <div key={p.n} className="h-full w-[calc(25%-24px)] pr-[12vw]">
                <PillarCard p={p} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
