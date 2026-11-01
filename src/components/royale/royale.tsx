"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Flame, Play, RotateCcw, Shield, Swords, Timer, Trophy, Zap } from "lucide-react";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, pick } from "@/lib/utils";
import { Button } from "../ui/button";
import { PageHero } from "../ui/page-hero";
import { Reveal, SectionLabel } from "../ui/reveal";
import { HostAvatar } from "../ui/host-avatar";
import { Tilt } from "../ui/tilt";

const PREFIX = ["Tốt", "Mã", "Xe", "Hậu", "Vua", "Tượng", "Gambit", "Blitz", "Pawn", "Knight"];
const SUFFIX = ["Điên", "SG", "HN", "Đen", "Trắng", "VN", "99", "Pro", "Chill", "Nổ", "Ninja", "Bá"];

function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeField(me: string | null, rng: () => number = Math.random) {
  const names = new Set<string>();
  const pk = <T,>(a: readonly T[]) => a[Math.floor(rng() * a.length)];
  while (names.size < 100) names.add(`${pk(PREFIX)}${pk(SUFFIX)}${Math.floor(rng() * 90 + 10)}`);
  const list = [...names].map((n, i) => ({ id: i, name: n, rating: 1100 + Math.round(rng() * 900) }));
  if (me) list[37] = { id: 37, name: me, rating: 1500 };
  return list;
}

const ROUND_NAMES = ["Vòng 1 · 100 → 50", "Vòng 2 · 50 → 25", "Vòng 3 · 25 → 13", "Vòng 4 · 13 → 7", "Tứ kết · 7 → 4", "Bán kết · 4 → 2", "Chung kết"];
const QUIPS = [
  "{a} vừa tiễn {b} ra khỏi màn hình!",
  "{b} nổ tung! {a} đi tiếp!",
  "Chaos Card định mệnh: {b} bị loại bởi {a}!",
  "{a} chiếu hết {b} chỉ trong 19 nước!",
  "{b} hết giờ. Đồng hồ không chờ ai, kể cả {b}.",
];

function nextSaturday() {
  const d = new Date();
  const day = d.getDay();
  const add = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + add);
  d.setHours(20, 0, 0, 0);
  return d;
}

function Countdown() {
  const target = useMemo(() => nextSaturday().getTime(), []);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - (now ?? target));
  const parts = [
    ["Ngày", Math.floor(diff / 86400000)],
    ["Giờ", Math.floor(diff / 3600000) % 24],
    ["Phút", Math.floor(diff / 60000) % 60],
    ["Giây", Math.floor(diff / 1000) % 60],
  ] as const;
  return (
    <div className="grid grid-cols-4 gap-2">
      {parts.map(([l, v]) => (
        <div key={l} className="rounded-2xl bg-ink/70 p-3 text-center ring-1 ring-cream/10">
          <AnimatePresence mode="popLayout">
            <motion.div key={v} initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="font-display text-3xl font-bold tabular-nums md:text-4xl">
              {now === null ? "--" : String(v).padStart(2, "0")}
            </motion.div>
          </AnimatePresence>
          <div className="text-[10px] uppercase tracking-widest text-cream/45">{l}</div>
        </div>
      ))}
    </div>
  );
}

type Tile = { id: number; name: string; rating: number };

function Simulator() {
  const username = useWallet((s) => s.username);
  const registered = useWallet((s) => s.royaleRegistered);
  const mounted = useMounted();
  const me = mounted && registered ? username : null;
  const [field, setField] = useState<Tile[]>(() => makeField(null, seeded(2026)));
  const [alive, setAlive] = useState<Set<number>>(() => new Set(Array.from({ length: 100 }, (_, i) => i)));
  const [booming, setBooming] = useState<Set<number>>(new Set());
  const [round, setRound] = useState(-1);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldRef = useRef(field);
  fieldRef.current = field;

  useEffect(() => {
    if (me) setField(makeField(me, seeded(2026)));
  }, [me]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const resetState = () => {
    if (timer.current) clearTimeout(timer.current);
    setAlive(new Set(Array.from({ length: 100 }, (_, i) => i)));
    setBooming(new Set());
    setRound(-1);
    setLog([]);
    setRunning(false);
  };
  const reset = () => {
    resetState();
    setField(makeField(me));
  };

  const step = (aliveNow: Set<number>, r: number) => {
    const ids = [...aliveNow].sort(() => Math.random() - 0.5);
    const next = new Set<number>();
    const dead = new Set<number>();
    const lines: string[] = [];
    if (ids.length % 2 === 1) next.add(ids.pop()!); // bye
    for (let i = 0; i < ids.length; i += 2) {
      const a = fieldRef.current[ids[i]];
      const b = fieldRef.current[ids[i + 1]];
      const pa = 1 / (1 + Math.pow(10, (b.rating - a.rating) / 400));
      const aWins = Math.random() < pa;
      const w = aWins ? a : b;
      const l = aWins ? b : a;
      next.add(w.id);
      dead.add(l.id);
      if (lines.length < 3) lines.push(pick(QUIPS).replace("{a}", w.name).replace("{b}", l.name));
    }
    setBooming(dead);
    setRound(r);
    setLog((lg) => [...lines.map((l) => `${ROUND_NAMES[r] ?? "Vòng"} — ${l}`), ...lg].slice(0, 12));
    timer.current = setTimeout(() => {
      setAlive(next);
      setBooming(new Set());
      if (next.size > 1) timer.current = setTimeout(() => step(next, r + 1), 900);
      else {
        setRunning(false);
        const champ = fieldRef.current[[...next][0]];
        setLog((lg) => [`👑 ${champ.name} là VUA ROYALE mùa này!`, ...lg]);
      }
    }, 900);
  };

  const start = () => {
    resetState();
    setRunning(true);
    const all = new Set(Array.from({ length: 100 }, (_, i) => i));
    timer.current = setTimeout(() => step(all, 0), 500);
  };

  const champion = alive.size === 1 ? field[[...alive][0]] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="relative overflow-hidden rounded-[28px] border border-cream/10 bg-ink-2 p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-cream/45">{round >= 0 ? ROUND_NAMES[round] : "Sẵn sàng"}</div>
            <div className="font-display text-3xl font-bold uppercase">
              Còn lại <span className="text-lime tabular-nums">{alive.size}</span>/100
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={start} disabled={running} size="sm">
              <Play size={14} fill="currentColor" /> {round >= 0 ? "Chạy lại" : "Mô phỏng mùa đấu"}
            </Button>
            <Button onClick={reset} variant="outline" size="sm" aria-label="Đặt lại">
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
        <div className="mx-auto grid max-w-[600px] grid-cols-10 gap-1.5 md:gap-2">
          {field.map((p) => {
            const isAlive = alive.has(p.id);
            const boom = booming.has(p.id);
            const isMe = me && p.name === me;
            return (
              <div key={p.id} className="relative aspect-square">
                <motion.div
                  title={p.name}
                  className={cn(
                    "absolute inset-0 grid place-items-center rounded-lg text-[9px] font-bold md:rounded-xl md:text-[11px]",
                    isMe ? "bg-pink text-ink" : "bg-lime text-ink",
                  )}
                  animate={
                    boom
                      ? { scale: [1, 1.4, 0], rotate: [0, 20, -40], opacity: [1, 1, 0] }
                      : isAlive
                        ? { scale: champion?.id === p.id ? 1.15 : 1, opacity: 1, rotate: 0 }
                        : { scale: 0.55, opacity: 0.08, rotate: 0 }
                  }
                  transition={{ duration: boom ? 0.75 : 0.4, ease: "easeOut" }}
                >
                  {p.name.slice(0, 2)}
                </motion.div>
                <AnimatePresence>
                  {boom &&
                    Array.from({ length: 6 }).map((_, k) => (
                      <motion.span
                        key={k}
                        className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-pink"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{ x: Math.cos((k / 6) * Math.PI * 2) * 26, y: Math.sin((k / 6) * Math.PI * 2) * 26, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                      />
                    ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <AnimatePresence>
          {champion && !running && (
            <motion.div className="absolute inset-0 grid place-items-center bg-ink/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="text-center">
                <motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-lime text-ink">
                  <Crown size={40} />
                </motion.div>
                <div className="mt-4 text-xs uppercase tracking-[0.3em] text-cream/60">Vua Royale</div>
                <div className="font-display text-5xl font-bold uppercase text-lime">{champion.name}</div>
                <Button className="mt-5" variant="outline" size="sm" onClick={reset}>
                  Xem lại lưới đấu
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex-1 rounded-[28px] border border-cream/10 bg-ink-2 p-5">
          <div className="flex items-center gap-3">
            <HostAvatar id="gambit" size={40} talking={running} />
            <div>
              <div className="font-semibold text-lime">Captain Gambit</div>
              <div className="text-xs text-cream/45">Bình luận Chess Royale</div>
            </div>
          </div>
          <div className="mt-4 space-y-2" aria-live="polite">
            {log.length === 0 && <p className="text-sm text-cream/45">Bấm “Mô phỏng mùa đấu” để xem 100 kỳ thủ nổ tung từng vòng.</p>}
            <AnimatePresence initial={false}>
              {log.map((l, i) => (
                <motion.p key={l + i} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1 - i * 0.07, x: 0 }} className="rounded-xl bg-ink-3/70 px-3 py-2 text-sm text-cream/85">
                  {l}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const FORMAT = [
  { icon: Swords, title: "Loại trực tiếp", body: "100 kỳ thủ, bốc cặp ngẫu nhiên mỗi vòng. Thua một ván là nổ khỏi màn hình." },
  { icon: Timer, title: "Blitz 3+0", body: "Mỗi ván 3 phút. 7 vòng trong khoảng 45 phút — vừa một tập show." },
  { icon: Zap, title: "Chaos từ khán giả", body: "Từ tứ kết, khán giả được ném Chaos Cards vào các bàn đấu đang phát sóng." },
  { icon: Shield, title: "Fair-play", body: "Chống gian lận bằng engine phát hiện, và mọi tranh cãi được đưa ra Chess Court." },
];

const BOARD = [
  { name: "MãĐiênSG", pts: 2140, wins: 3 },
  { name: "HậuĐen_VN", pts: 1985, wins: 2 },
  { name: "Zwischenzug_", pts: 1720, wins: 2 },
  { name: "tốt_thí_123", pts: 1504, wins: 1 },
  { name: "EnPassantEm", pts: 1390, wins: 1 },
];

export function RoyaleView() {
  const registered = useWallet((s) => s.royaleRegistered);
  const register = useWallet((s) => s.registerRoyale);
  const toast = useUI((s) => s.toast);
  const mounted = useMounted();
  return (
    <>
      <PageHero
        label="Chess Royale · Mùa 1"
        title="100 người."
        accent="1 người sống sót."
        aside={
          <Tilt max={8} className="rounded-[28px]">
            <div className="relative overflow-hidden rounded-[28px] bg-violet p-6 text-ink">
              <div className="checker-bg absolute inset-0 opacity-30 mix-blend-multiply" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-ink/70">Khai mạc tối thứ Bảy · 20:00</span>
                  <Trophy size={22} />
                </div>
                <div className="mt-4 [&_div.rounded-2xl]:bg-ink [&_div.rounded-2xl]:text-cream">
                  <Countdown />
                </div>
                <ul className="mt-4 space-y-1 text-sm font-medium">
                  <li>✦ Phí tham gia: Miễn phí</li>
                  <li>✦ Phần thưởng: danh hiệu Vua Royale, khung avatar Huyền thoại, 5.000 Chaos Coins</li>
                </ul>
                <Button
                  variant="dark"
                  className="mt-5 w-full"
                  disabled={mounted && registered}
                  onClick={() => {
                    register();
                    toast({ title: "Đã giữ chỗ Chess Royale!", body: "Bạn sẽ xuất hiện trong lưới 100 người. Thử mô phỏng bên dưới nhé.", tone: "lime" });
                  }}
                >
                  {mounted && registered ? "✓ Đã giữ chỗ" : "Giữ chỗ miễn phí"}
                </Button>
              </div>
            </div>
          </Tilt>
        }
      >
        Lưới đấu loại trực tiếp kiểu battle royale cho cờ vua. Mỗi vòng có host AI riêng, mỗi lần thua là một vụ nổ trên livestream.
      </PageHero>

      <section className="container-x py-12">
        <SectionLabel>Thử ngay · Mô phỏng</SectionLabel>
        <h2 className="mb-8 mt-3 font-display text-4xl font-bold uppercase md:text-6xl">Lưới đấu sống</h2>
        <Simulator />
      </section>

      <section className="container-x py-20">
        <SectionLabel>Thể thức</SectionLabel>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FORMAT.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="h-full rounded-[24px] border border-cream/10 bg-ink-2 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet text-ink">
                    <Icon size={20} />
                  </span>
                  <div className="mt-5 font-display text-2xl font-bold uppercase">{f.title}</div>
                  <p className="mt-2 text-sm text-cream/60">{f.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionLabel>Bảng xếp hạng</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase md:text-6xl">
              Mùa <span className="text-lime">beta</span>
            </h2>
            <p className="mt-4 max-w-md text-cream/60">Kết quả các mùa thử nghiệm nội bộ với cộng đồng cờ vua đầu tiên. Mùa 1 chính thức tính điểm từ tối thứ Bảy.</p>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-cream/10">
            {BOARD.map((b, i) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className={cn("flex items-center gap-4 border-b border-cream/5 px-5 py-4 last:border-0", i === 0 ? "bg-lime text-ink" : "bg-ink-2")}
              >
                <span className="w-8 font-display text-3xl font-bold">{i + 1}</span>
                <span className="flex-1 font-semibold">{b.name}</span>
                <span className={cn("flex items-center gap-1 text-sm", i === 0 ? "text-ink/70" : "text-cream/50")}>
                  <Flame size={14} /> {b.wins} lần vô địch
                </span>
                <span className="font-display text-2xl font-bold tabular-nums">{b.pts}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
