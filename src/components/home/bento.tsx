"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clapperboard, Crown, Gavel, Swords } from "lucide-react";
import { Spotlight } from "../ui/spotlight";
import { Kicker } from "../ui/section";
import { Reveal, Words } from "../ui/reveal";
import { Coin } from "../commerce/coin";
import { MiniBoard } from "../ui/mini-board";
import { cn } from "@/lib/utils";

function RoyaleRings() {
  const dots = useMemo(() => {
    const rings = [6, 12, 18, 26, 38];
    const out: { x: number; y: number; i: number }[] = [];
    let i = 0;
    rings.forEach((n, r) => {
      const rad = 14 + r * 15;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r * 0.3;
        out.push({ x: Math.round(Math.cos(a) * rad * 100) / 100, y: Math.round(Math.sin(a) * rad * 100) / 100, i: i++ });
      }
    });
    return out;
  }, []);
  const [dead, setDead] = useState<Set<number>>(new Set());
  useEffect(() => {
    const t = setInterval(() => {
      setDead((d) => {
        if (d.size >= 99) return new Set();
        const n = new Set(d);
        const alive = dots.filter((x) => !n.has(x.i));
        const kill = Math.max(1, Math.floor(alive.length / 3.4));
        for (let k = 0; k < kill && alive.length - k > 1; k++) n.add(alive[Math.floor(Math.random() * alive.length)].i);
        return n;
      });
    }, 1100);
    return () => clearInterval(t);
  }, [dots]);
  return (
    <svg viewBox="-80 -80 160 160" className="h-full w-full">
      <circle r="74" fill="none" stroke="rgba(255,255,255,0.06)" />
      <circle r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
      {dots.map((d) => {
        const off = dead.has(d.i);
        return (
          <motion.circle
            key={d.i}
            cx={d.x}
            cy={d.y}
            r={2.6}
            animate={{ opacity: off ? 0.08 : 1, r: off ? 1.2 : 2.6, fill: off ? "#ff6b9a" : "#c9c2ff" }}
            transition={{ duration: 0.5 }}
          />
        );
      })}
      <circle r="5" fill="url(#rr-g)" />
      <defs>
        <radialGradient id="rr-g">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#8b7cff" />
        </radialGradient>
      </defs>
      <text y="-60" textAnchor="middle" className="font-mono" fontSize="7" fill="rgba(255,255,255,0.45)">
        {100 - dead.size} / 100 còn trụ
      </text>
    </svg>
  );
}

function Gauge() {
  const [v, setV] = useState(64);
  useEffect(() => {
    const t = setInterval(() => setV(30 + Math.round(Math.random() * 45)), 1700);
    return () => clearInterval(t);
  }, []);
  const angle = -90 + (v / 100) * 180;
  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      <svg viewBox="0 0 200 110" className="w-full">
        <defs>
          <linearGradient id="g-gauge" x1="0" x2="1">
            <stop offset="0" stopColor="#3ee6e0" />
            <stop offset="0.5" stopColor="#8b7cff" />
            <stop offset="1" stopColor="#ff6b9a" />
          </linearGradient>
        </defs>
        <path d="M15 100 A85 85 0 0 1 185 100" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
        <path d="M15 100 A85 85 0 0 1 185 100" fill="none" stroke="url(#g-gauge)" strokeWidth="14" strokeLinecap="round" strokeDasharray="4 6" />
        <motion.g animate={{ rotate: angle }} transition={{ type: "spring", stiffness: 60, damping: 10 }} style={{ originX: "100px", originY: "100px" }}>
          <line x1="100" y1="100" x2="100" y2="30" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="100" r="7" fill="#fff" />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[11px]">
        <span className="text-teal">Vô tội {100 - v}%</span>
        <span className="text-rose">Có tội {v}%</span>
      </div>
    </div>
  );
}

function ClipPhone() {
  return (
    <div className="relative mx-auto aspect-[9/16] w-[118px] overflow-hidden rounded-[22px] border border-white/15 bg-[radial-gradient(120%_70%_at_0%_0%,rgba(255,107,154,0.55),transparent_60%),radial-gradient(120%_70%_at_100%_100%,rgba(77,141,255,0.6),transparent_60%)]">
      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 font-mono text-[8px]">
        <span className="h-1 w-1 animate-pulse-soft rounded-full bg-rose" /> 0:15
      </span>
      <div className="absolute inset-x-2 bottom-3">
        <div className="h-1.5 w-3/4 rounded-full bg-white/80" />
        <div className="mt-1 h-1.5 w-1/2 rounded-full bg-white/50" />
        <div className="mt-2 flex h-5 items-end gap-[2px]">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span key={i} className="w-[3px] rounded-full bg-white/80" animate={{ height: ["20%", "100%", "35%"] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.07 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Spotlight className={cn("group h-full", className)}>
      <Link href={href} className="relative flex h-full flex-col p-6 md:p-7">
        {children}
        <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-fg-3 transition-all duration-500 group-hover:rotate-45 group-hover:border-white/30 group-hover:text-fg">
          <ArrowUpRight size={16} />
        </span>
      </Link>
    </Spotlight>
  );
}

export function Bento() {
  return (
    <section className="shell py-24 md:py-36" aria-labelledby="bento-title">
      <div className="max-w-3xl">
        <Kicker tone="teal">Nhiều cách nhập cuộc</Kicker>
        <Words id="bento-title" text="Không chỉ một ván cờ. *Cả một vũ trụ* để quậy." className="display mt-5 text-[clamp(2.3rem,5vw,4.2rem)]" />
      </div>
      <div className="mt-14 grid auto-rows-[minmax(260px,auto)] gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4 md:row-span-2">
          <Card href="/royale" className="bg-[radial-gradient(90%_80%_at_80%_60%,rgba(109,92,255,0.18),transparent_60%)]">
            <div className="flex items-center gap-2 text-[13px] text-fg-2">
              <Crown size={16} className="text-amber" /> Chess Royale
            </div>
            <div className="grid flex-1 items-center gap-6 md:grid-cols-[1fr_1.1fr]">
              <div>
                <h3 className="display mt-4 text-[clamp(2rem,3.6vw,3.2rem)]">
                  100 người vào. <span className="serif-accent text-aurora">Một người</span> bước ra.
                </h3>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-fg-2">Lưới đấu loại trực tiếp, blitz 3 phút. Mỗi lần thua là một vụ nổ trên sóng, mỗi vòng có host AI riêng.</p>
              </div>
              <div className="mx-auto aspect-square w-full max-w-[340px]">
                <RoyaleRings />
              </div>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.08} className="md:col-span-2">
          <Card href="/court">
            <div className="flex items-center gap-2 text-[13px] text-fg-2">
              <Gavel size={16} className="text-rose" /> Chess Court
            </div>
            <h3 className="display mt-4 text-2xl">Khán giả làm bồi thẩm.</h3>
            <div className="mt-auto pt-6">
              <Gauge />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.16} className="md:col-span-2">
          <Card href="/live">
            <div className="flex items-center gap-2 text-[13px] text-fg-2">
              <Clapperboard size={16} className="text-violet" /> Clip tự động
            </div>
            <div className="mt-4 flex flex-1 items-center gap-5">
              <h3 className="display text-2xl">Cao trào thành video dọc trong vài giây.</h3>
              <ClipPhone />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.08} className="md:col-span-3">
          <Card href="/live">
            <div className="flex items-center gap-2 text-[13px] text-fg-2">
              <Swords size={16} className="text-teal" /> Tự cầm quân
            </div>
            <div className="mt-4 grid flex-1 items-center gap-6 sm:grid-cols-[1fr_150px]">
              <div>
                <h3 className="display text-2xl">Đánh với bot. Để host bình luận chính bạn.</h3>
                <p className="mt-3 text-[14.5px] text-fg-2">Mọi nước đi của bạn đều được tường thuật — kể cả những nước không nên đi.</p>
              </div>
              <MiniBoard fen="r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4" highlight={["h5", "f7"]} />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.16} className="md:col-span-3">
          <Card href="/pricing#coins">
            <div className="flex items-center gap-2 text-[13px] text-fg-2">
              <Coin className="h-4 w-4" /> Chaos Coins
            </div>
            <div className="mt-4 flex flex-1 items-center justify-between gap-6">
              <div>
                <h3 className="display text-2xl">Bắt đầu với 300 coin, miễn phí.</h3>
                <p className="mt-3 text-[14.5px] text-fg-2">Đủ để ném sáu lá Sương Mù. Hết thì nạp thêm, không bao giờ là cá cược.</p>
              </div>
              <motion.div animate={{ rotateY: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="shrink-0 [transform-style:preserve-3d]">
                <Coin className="h-24 w-24 drop-shadow-[0_20px_40px_rgba(109,92,255,0.6)]" />
              </motion.div>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
