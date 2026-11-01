"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Crown, Play, RotateCcw, Shield, Swords, Timer, Zap } from "lucide-react";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, pick } from "@/lib/utils";
import { Button } from "../ui/button";
import { PageHero } from "../ui/page-hero";
import { Reveal, Words } from "../ui/reveal";
import { Kicker } from "../ui/section";
import { HostOrb, VoiceBars } from "../ui/orb";
import { Spotlight } from "../ui/spotlight";

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
type Tile = { id: number; name: string; rating: number };
function makeField(me: string | null, rng: () => number = Math.random): Tile[] {
  const names = new Set<string>();
  const pk = <T,>(a: readonly T[]) => a[Math.floor(rng() * a.length)];
  while (names.size < 100) names.add(`${pk(PREFIX)}${pk(SUFFIX)}${Math.floor(rng() * 90 + 10)}`);
  const list = [...names].map((n, i) => ({ id: i, name: n, rating: 1100 + Math.round(rng() * 900) }));
  if (me) list[37] = { id: 37, name: me, rating: 1500 };
  return list;
}

const ROUNDS = ["100 → 50", "50 → 25", "25 → 13", "13 → 7", "7 → 4", "4 → 2", "Chung kết"];
const QUIPS = ["{a} tiễn {b} ra khỏi sân khấu!", "{b} nổ tung — {a} đi tiếp!", "Chaos Card định mệnh: {b} bị loại bởi {a}!", "{a} chiếu hết {b} trong 19 nước!", "{b} hết giờ. Đồng hồ không chờ ai."];

/** Toạ độ vòng tròn đồng tâm cho n chấm. */
function layout(n: number) {
  const out: [number, number][] = [];
  if (n === 1) return [[0, 0]] as [number, number][];
  let placed = 0;
  let ring = 0;
  while (placed < n) {
    const r = 22 + ring * 21;
    const cap = Math.max(6, Math.floor((2 * Math.PI * r) / 15));
    const k = Math.min(cap, n - placed);
    for (let j = 0; j < k; j++) {
      const a = (j / k) * Math.PI * 2 + ring * 0.4;
      out.push([Math.round(Math.cos(a) * r * 100) / 100, Math.round(Math.sin(a) * r * 100) / 100]);
    }
    placed += k;
    ring++;
  }
  return out;
}

function nextSaturday() {
  const d = new Date();
  const add = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + add);
  d.setHours(20, 0, 0, 0);
  return d.getTime();
}

function Countdown() {
  const target = useMemo(() => nextSaturday(), []);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - (now ?? target));
  const parts = [
    ["ngày", Math.floor(diff / 86400000)],
    ["giờ", Math.floor(diff / 3600000) % 24],
    ["phút", Math.floor(diff / 60000) % 60],
    ["giây", Math.floor(diff / 1000) % 60],
  ] as const;
  return (
    <div className="grid grid-cols-4 gap-2">
      {parts.map(([l, v]) => (
        <div key={l} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] py-3 text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={v} initial={{ y: -20, opacity: 0, filter: "blur(4px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ y: 20, opacity: 0, filter: "blur(4px)" }} className="font-mono text-3xl tabular-nums">
              {now === null ? "--" : String(v).padStart(2, "0")}
            </motion.div>
          </AnimatePresence>
          <div className="mt-1 text-[10.5px] text-fg-3">{l}</div>
        </div>
      ))}
    </div>
  );
}

function Arena() {
  const username = useWallet((s) => s.username);
  const registered = useWallet((s) => s.royaleRegistered);
  const mounted = useMounted();
  const me = mounted && registered ? username : null;
  const [field, setField] = useState<Tile[]>(() => makeField(null, seeded(2026)));
  const fieldRef = useRef(field);
  fieldRef.current = field;
  const [alive, setAlive] = useState<number[]>(() => Array.from({ length: 100 }, (_, i) => i));
  const [dying, setDying] = useState<Set<number>>(new Set());
  const [round, setRound] = useState(-1);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (me) setField(makeField(me, seeded(2026)));
  }, [me]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setAlive(Array.from({ length: 100 }, (_, i) => i));
    setDying(new Set());
    setRound(-1);
    setLog([]);
    setRunning(false);
  };
  const step = (now: number[], r: number) => {
    const ids = [...now].sort(() => Math.random() - 0.5);
    const next: number[] = [];
    const dead = new Set<number>();
    const lines: string[] = [];
    if (ids.length % 2) next.push(ids.pop()!);
    for (let i = 0; i < ids.length; i += 2) {
      const a = fieldRef.current[ids[i]];
      const b = fieldRef.current[ids[i + 1]];
      const pa = 1 / (1 + Math.pow(10, (b.rating - a.rating) / 400));
      const w = Math.random() < pa ? a : b;
      const l = w === a ? b : a;
      next.push(w.id);
      dead.add(l.id);
      if (lines.length < 2) lines.push(pick(QUIPS).replace("{a}", w.name).replace("{b}", l.name));
    }
    setDying(dead);
    setRound(r);
    setLog((lg) => [...lines, ...lg].slice(0, 9));
    timer.current = setTimeout(() => {
      setAlive(next.sort((x, y) => x - y));
      setDying(new Set());
      if (next.length > 1) timer.current = setTimeout(() => step(next, r + 1), 1000);
      else {
        setRunning(false);
        setLog((lg) => [`👑 ${fieldRef.current[next[0]].name} là Vua Royale!`, ...lg]);
      }
    }, 850);
  };
  const start = () => {
    reset();
    setRunning(true);
    timer.current = setTimeout(() => step(Array.from({ length: 100 }, (_, i) => i), 0), 400);
  };

  const pos = layout(alive.length);
  const champion = alive.length === 1 ? field[alive[0]] : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      <Spotlight className="relative aspect-square max-h-[640px] w-full p-4 sm:aspect-auto sm:h-[600px]">
        <div className="absolute left-5 top-5 z-10">
          <div className="kicker text-fg-3">{round >= 0 ? `Vòng ${round + 1} · ${ROUNDS[round]}` : "Sẵn sàng"}</div>
          <div className="display mt-1 text-3xl tabular-nums">
            {alive.length}
            <span className="text-fg-3">/100</span>
          </div>
        </div>
        <div className="absolute right-5 top-5 z-10 flex gap-2">
          <Button size="sm" onClick={start} disabled={running}>
            <Play size={13} fill="currentColor" /> {round >= 0 ? "Chạy lại" : "Mô phỏng mùa"}
          </Button>
          <Button size="sm" variant="glass" onClick={reset} aria-label="Đặt lại">
            <RotateCcw size={13} />
          </Button>
        </div>
        <svg viewBox="-170 -170 340 340" className="h-full w-full">
          <defs>
            <radialGradient id="ra-center">
              <stop offset="0" stopColor="#8b7cff" stopOpacity="0.5" />
              <stop offset="1" stopColor="#8b7cff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="150" fill="none" stroke="rgba(255,255,255,0.05)" />
          <circle r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 5" />
          <circle r="50" fill="url(#ra-center)" />
          {alive.map((id, i) => {
            const [x, y] = pos[i] ?? [0, 0];
            const t = field[id];
            const isMe = me && t.name === me;
            const boom = dying.has(id);
            return (
              <motion.g key={id} initial={false} animate={{ x, y }} transition={{ type: "spring", stiffness: 70, damping: 14 }}>
                <motion.circle
                  r={champion ? 16 : 5.4}
                  fill={isMe ? "#ff6b9a" : champion ? "#ffc56b" : "#c9c2ff"}
                  animate={boom ? { scale: [1, 2.2, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
                  transition={{ duration: boom ? 0.8 : 0.3 }}
                  style={{ filter: isMe || champion ? "drop-shadow(0 0 6px currentColor)" : undefined }}
                />
                {boom && <motion.circle r={4} fill="none" stroke="#ff6b9a" strokeWidth={1.5} initial={{ scale: 1, opacity: 1 }} animate={{ scale: 5, opacity: 0 }} transition={{ duration: 0.8 }} />}
              </motion.g>
            );
          })}
        </svg>
        <AnimatePresence>
          {champion && !running && (
            <motion.div className="absolute inset-x-0 bottom-8 z-10 flex justify-center" initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0 }}>
              <div className="glass-strong flex items-center gap-3 rounded-full py-2 pl-2 pr-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#ffc56b,#ff8a4c)] text-void">
                  <Crown size={17} />
                </span>
                <div>
                  <div className="kicker text-[9.5px] text-fg-3">Vua Royale</div>
                  <div className="text-[15px] font-medium">{champion.name}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Spotlight>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {ROUNDS.map((r, i) => (
            <span key={r} className={cn("rounded-full border px-3 py-1 font-mono text-[11px] transition-colors", i < round ? "border-transparent bg-white/[0.06] text-fg-3 line-through" : i === round ? "border-violet/50 bg-violet/15 text-fg" : "border-white/10 text-fg-3")}>
              {r}
            </span>
          ))}
        </div>
        <Spotlight className="flex-1 p-5">
          <div className="flex items-center gap-3">
            <HostOrb id="gambit" size={36} talking={running} />
            <div className="flex-1">
              <div className="text-[14px] font-medium">Captain Gambit</div>
              <div className="font-mono text-[10.5px] text-fg-3">bình luận Chess Royale</div>
            </div>
            {running && <VoiceBars color="#ffb36b" />}
          </div>
          <div className="mt-4 space-y-2" aria-live="polite">
            {log.length === 0 && <p className="text-[14px] text-fg-3">Bấm “Mô phỏng mùa” để xem 100 kỳ thủ bị loại dần, vòng này qua vòng khác.</p>}
            <AnimatePresence initial={false}>
              {log.map((l, i) => (
                <motion.p key={l + i} layout initial={{ opacity: 0, x: 16, filter: "blur(6px)" }} animate={{ opacity: 1 - i * 0.09, x: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} className="rounded-xl bg-white/[0.03] px-3 py-2 text-[13.5px] text-fg-2">
                  {l}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </Spotlight>
      </div>
    </div>
  );
}

const FORMAT = [
  { icon: Swords, title: "Loại trực tiếp", body: "Bốc cặp ngẫu nhiên mỗi vòng. Thua một ván là rời sân khấu." },
  { icon: Timer, title: "Blitz 3+0", body: "7 vòng trong khoảng 45 phút — vừa một tập show." },
  { icon: Zap, title: "Chaos từ khán giả", body: "Từ tứ kết, khán giả được ném Chaos Cards vào bàn đang phát sóng." },
  { icon: Shield, title: "Fair-play", body: "Engine phát hiện gian lận; mọi tranh cãi được đưa ra Chess Court." },
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
        kicker="Chess Royale · Mùa 1"
        title="100 người vào. *Một người bước ra.*"
        aside={
          <div className="glass-strong beam rounded-[30px] p-6">
            <div className="flex items-center justify-between">
              <span className="kicker text-fg-3">Khai mạc · thứ Bảy 20:00</span>
              <Crown size={18} className="text-amber" />
            </div>
            <div className="mt-5">
              <Countdown />
            </div>
            <div className="mt-5 space-y-2 text-[13.5px] text-fg-2">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span>Phí tham gia</span>
                <span className="text-fg">Miễn phí</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>Phần thưởng</span>
                <span className="text-right text-fg">Danh hiệu Vua Royale · 5.000 Chaos Coins</span>
              </div>
            </div>
            <Button
              className="mt-6 w-full"
              size="lg"
              disabled={mounted && registered}
              onClick={() => {
                register();
                toast({ title: "Đã giữ chỗ Chess Royale", body: "Bạn sẽ xuất hiện (màu hồng) trong đấu trường mô phỏng bên dưới." });
              }}
            >
              {mounted && registered ? "Đã giữ chỗ ✓" : "Giữ chỗ miễn phí"}
            </Button>
          </div>
        }
      >
        Đấu trường loại trực tiếp cho cờ vua. Mỗi vòng có host AI riêng, mỗi lần thua là một vụ nổ trên livestream.
      </PageHero>

      <section className="shell py-10">
        <Kicker>Thử ngay</Kicker>
        <Words text="Đấu trường *co lại* sau mỗi vòng." className="display mb-10 mt-5 text-[clamp(2rem,4vw,3.2rem)]" />
        <Arena />
      </section>

      <section className="shell py-24">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FORMAT.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.07} className="h-full">
                <Spotlight className="h-full p-6">
                  <Icon size={20} className="text-violet" />
                  <div className="mt-8 font-display text-lg font-semibold tracking-tight">{f.title}</div>
                  <p className="mt-2 text-[14px] leading-relaxed text-fg-2">{f.body}</p>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="shell pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Kicker tone="ember">Bảng xếp hạng</Kicker>
            <Words text="Những cái tên *mùa beta.*" className="display mt-5 text-[clamp(2rem,4vw,3.2rem)]" accentClass="serif-accent text-ember" />
            <p className="mt-4 max-w-sm text-fg-2">Kết quả các mùa thử nghiệm nội bộ cùng cộng đồng cờ vua đầu tiên. Mùa 1 tính điểm từ tối thứ Bảy.</p>
          </div>
          <div className="space-y-2">
            {BOARD.map((b, i) => (
              <Reveal key={b.name} delay={i * 0.06}>
                <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
                  <span className={cn("w-6 font-mono text-[13px]", i === 0 ? "text-amber" : "text-fg-3")}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-medium">{b.name}</span>
                  <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-white/[0.06] sm:block">
                    <motion.div className="h-full rounded-full bg-[linear-gradient(90deg,#8b7cff,#3ee6e0)]" initial={{ width: 0 }} whileInView={{ width: `${(b.pts / 2200) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.08 }} />
                  </div>
                  <span className="font-mono text-[12px] text-fg-3">{b.wins}× vô địch</span>
                  <span className="w-14 text-right font-mono tabular-nums">{b.pts}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
