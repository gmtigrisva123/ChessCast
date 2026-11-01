"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Clapperboard, Eye, HandCoins, MessageCircle, Mic, RotateCcw, Send, Swords, Tv, Volume2, VolumeX } from "lucide-react";
import type { Color } from "chess.js";
import { useArena, type Arena, type FeedItem, type Player } from "./use-arena";
import { CHAOS_CARDS, TIP_PRESETS, type ChaosCard } from "@/lib/catalog";
import { HOSTS } from "@/lib/hosts";
import { useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, compact, formatClock, formatNum } from "@/lib/utils";
import { HostOrb, VoiceBars } from "../ui/orb";
import { ChaosIcon } from "../ui/chaos-icon";
import { Button } from "../ui/button";
import { Coin } from "../commerce/coin";
import { Aurora } from "../ui/aurora";

const ArenaCanvas = dynamic(() => import("./arena-canvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-4 text-sm text-fg-3">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-violet" />
        Đang dựng sân khấu 3D…
      </div>
    </div>
  ),
});

/* ───────── Người chơi ───────── */
function PlayerPill({ p, color, ms, active, captured, you }: { p: Player; color: Color; ms: number; active: boolean; captured: string; you?: boolean }) {
  const low = ms < 30_000;
  return (
    <div className={cn("glass-strong flex items-center gap-3 rounded-2xl py-2 pl-2 pr-2 transition-shadow duration-500", active && "shadow-[0_0_0_1px_rgba(139,124,255,0.7),0_10px_40px_-10px_rgba(139,124,255,0.6)]")}>
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg", color === "w" ? "bg-[linear-gradient(135deg,#f3f1ff,#b9b0ff)] text-void" : "bg-[linear-gradient(135deg,#2a2d45,#0b0c14)] text-fg ring-1 ring-white/15")}>
        {color === "w" ? "♔" : "♚"}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 truncate text-[13.5px] font-medium">
          <span>{p.country}</span>
          <span className="truncate">{p.name}</span>
          {you && <span className="rounded-md bg-fg px-1.5 font-mono text-[9.5px] text-void">BẠN</span>}
        </div>
        <div className="flex items-center gap-2 font-mono text-[10.5px] text-fg-3">
          <span>{p.rating}</span>
          <span className="truncate text-fg-2">{captured}</span>
        </div>
      </div>
      <div className={cn("ml-auto rounded-xl px-3 py-1.5 font-mono text-[17px] tabular-nums transition-colors", active ? (low ? "bg-rose text-void" : "bg-fg text-void") : "bg-white/[0.04] text-fg-3")}>{formatClock(ms)}</div>
    </div>
  );
}

function capturedBy(pieces: Arena["game"]["pieces"]) {
  const start: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const count = { w: { ...start }, b: { ...start } } as Record<Color, Record<string, number>>;
  for (const id in pieces) {
    const pc = pieces[id];
    if (pc.type !== "k") count[pc.color][pc.type] = (count[pc.color][pc.type] ?? 0) - 1;
  }
  const glyph: Record<string, string> = { q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  const fmt = (c: Record<string, number>) => (["q", "r", "b", "n", "p"] as const).map((k) => (c[k] > 0 ? glyph[k].repeat(Math.min(c[k], 8)) : "")).join("");
  return { w: fmt(count.b), b: fmt(count.w) };
}

/* ───────── Đồng hồ hype ───────── */
function HypeRing({ value }: { value: number }) {
  const R = 22;
  const C = 2 * Math.PI * R;
  return (
    <div className="glass-strong flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-3">
      <svg viewBox="0 0 56 56" className="h-11 w-11 -rotate-90">
        <defs>
          <linearGradient id="hype-g" x1="0" x2="1">
            <stop offset="0" stopColor="#3ee6e0" />
            <stop offset="0.5" stopColor="#8b7cff" />
            <stop offset="1" stopColor="#ff6b9a" />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle cx="28" cy="28" r={R} fill="none" stroke="url(#hype-g)" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - value / 100) }} transition={{ type: "spring", stiffness: 60, damping: 15 }} />
      </svg>
      <div>
        <div className="font-mono text-[15px] tabular-nums leading-none">{Math.round(value)}</div>
        <div className="kicker mt-1 text-[9px] text-fg-3">Hype</div>
      </div>
    </div>
  );
}

/* ───────── Phụ đề host ───────── */
function Subtitle({ item, speaking }: { item?: FeedItem; speaking: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[132px] z-10 flex justify-center sm:bottom-[136px]">
      <AnimatePresence mode="popLayout">
        {item?.host && (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass-strong flex max-w-2xl items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-4"
          >
            <HostOrb id={item.host} size={34} talking={speaking} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium" style={{ color: HOSTS[item.host].color }}>
                {HOSTS[item.host].name}
                {item.kind === "ai" && <span className="rounded bg-white/10 px-1 font-mono text-[9px] text-fg-2">AI LIVE</span>}
              </div>
              <div className="text-[13.5px] leading-snug text-fg sm:text-[15px]">{item.text}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── Dock Chaos Cards (phóng to kiểu macOS) ───────── */
function DockItem({ card, cost, mouseX, onPlay, disabled }: { card: ChaosCard; cost: number; mouseX: MotionValue<number>; onPlay: () => void; disabled: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const dist = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || x === Infinity) return 999;
    return x - (r.left + r.width / 2);
  });
  const size = useSpring(useTransform(dist, [-160, 0, 160], [56, 92, 56], { clamp: true }), { stiffness: 260, damping: 20, mass: 0.4 });
  const iconSize = useTransform(size, (s) => s * 0.42);
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      ref={ref}
      style={{ width: size, height: size }}
      onClick={onPlay}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileTap={{ scale: 0.88 }}
      aria-label={`Ném ${card.name} — ${cost} coin`}
      className={cn("relative grid shrink-0 place-items-center rounded-[22%] text-void shadow-[0_10px_30px_-8px_var(--g)]", disabled && "opacity-40 saturate-50")}
    >
      <span className="absolute inset-0 rounded-[inherit]" style={{ background: `linear-gradient(140deg, ${card.tint[0]}, ${card.tint[1]})`, ["--g" as string]: card.tint[0] }} />
      <span className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_45%)]" />
      <motion.span className="relative" style={{ width: iconSize, height: iconSize }}>
        <ChaosIcon icon={card.icon} className="h-full w-full" strokeWidth={1.8} />
      </motion.span>
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            className="glass-strong pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-xl px-3 py-1.5 text-left"
          >
            <span className="block text-[12.5px] font-medium text-fg">{card.name}</span>
            <span className="block font-mono text-[10.5px] text-fg-3">
              {cost} coin · {card.durationLabel}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ChaosDock({ arena }: { arena: Arena }) {
  const mouseX = useMotionValue(Infinity);
  const coins = useWallet((s) => s.coins);
  const mounted = useMounted();
  return (
    <div className="relative z-20 -mt-12 flex justify-center px-3">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="glass-strong no-scrollbar flex max-w-full items-end gap-2.5 overflow-x-auto rounded-[28px] px-3 pb-3 pt-3 md:overflow-visible"
      >
        <div className="mr-1 hidden flex-col justify-center self-center pl-1 pr-2 md:flex">
          <span className="kicker text-[9.5px] text-fg-3">Chaos</span>
          <span className="flex items-center gap-1 font-mono text-[13px]">
            <Coin className="h-3.5 w-3.5" /> {mounted ? formatNum(coins) : "—"}
          </span>
        </div>
        {CHAOS_CARDS.map((c) => {
          const cost = arena.cardCost(c.id);
          return <DockItem key={c.id} card={c} cost={cost} mouseX={mouseX} onPlay={() => arena.playCard(c.id)} disabled={!!arena.game.over || (mounted && coins < cost)} />;
        })}
      </motion.div>
    </div>
  );
}

/* ───────── Thanh bên ───────── */
function FeedPanel({ feed }: { feed: FeedItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [feed.length]);
  return (
    <div ref={ref} data-lenis-prevent className="h-full space-y-3 overflow-y-auto p-4">
      <AnimatePresence initial={false}>
        {feed.map((f) => (
          <motion.div key={f.id} layout initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} transition={{ duration: 0.4 }}>
            {f.host ? (
              <div className="flex gap-2.5">
                <HostOrb id={f.host} size={28} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: HOSTS[f.host].color }}>
                    {HOSTS[f.host].name}
                    {f.kind === "ai" && <span className="rounded bg-white/10 px-1 font-mono text-[9px] text-fg-2">AI LIVE</span>}
                    {f.kind === "chaos" && <span className="rounded bg-rose/15 px-1 font-mono text-[9px] text-rose">CHAOS</span>}
                    {f.kind === "tip" && <span className="rounded bg-teal/15 px-1 font-mono text-[9px] text-teal">TIP</span>}
                  </div>
                  <div className="mt-0.5 text-[13.5px] leading-snug text-fg/90">{f.text}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-center text-[12px] text-fg-3">{f.text}</div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ChatPanel({ arena }: { arena: Arena }) {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [arena.chat.length]);
  return (
    <div className="flex h-full flex-col">
      <div ref={ref} data-lenis-prevent className="flex-1 space-y-2 overflow-y-auto p-4">
        {arena.chat.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("text-[13.5px] leading-snug", m.tip && "rounded-xl border border-teal/20 bg-teal/[0.06] p-2")}>
            {m.badge && (
              <span className={cn("mr-1.5 rounded px-1 py-px font-mono text-[9px] uppercase", m.badge === "lord" ? "bg-rose/20 text-rose" : m.badge === "pro" ? "bg-violet/20 text-violet" : m.badge === "mod" ? "bg-teal/20 text-teal" : "bg-white/15 text-fg")}>
                {m.badge === "you" ? "bạn" : m.badge}
              </span>
            )}
            <span className="font-medium" style={{ color: m.color }}>
              {m.user}
            </span>
            {m.tip && <span className="ml-1 font-mono text-[11px] text-teal">tip {m.tip}</span>}
            <span className="text-fg-2"> {m.text}</span>
          </motion.div>
        ))}
      </div>
      <form
        className="flex items-center gap-2 border-t border-white/[0.06] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          arena.sendChat(text);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhắn cho cả arena…"
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none placeholder:text-fg-3 focus:border-violet/60"
          maxLength={140}
          aria-label="Tin nhắn chat"
        />
        <button className="grid h-10 w-10 place-items-center rounded-full bg-fg text-void" aria-label="Gửi">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

function ClipsPanel() {
  const clips = useWallet((s) => s.clips);
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <div data-lenis-prevent className="h-full space-y-2 overflow-y-auto p-4">
      {clips.length === 0 && (
        <div className="grid h-full place-items-center text-center text-[13px] leading-relaxed text-fg-3">
          <div>
            <Clapperboard className="mx-auto mb-3 text-fg-3" />
            AI tự cắt clip khi có cao trào: ăn Hậu, blunder, chiếu hết, Chaos Card…
          </div>
        </div>
      )}
      {clips.map((c) => (
        <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5">
          <div className="relative grid h-16 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(160deg,#ff6b9a,#6d5cff)]">
            <Tv size={15} className="text-void" />
            <span className="absolute bottom-1 font-mono text-[8.5px] text-void">0:15</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-medium">{c.title}</div>
            <div className="font-mono text-[10.5px] text-fg-3">
              {c.host} · {new Date(c.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="mt-1 flex gap-3 text-[11.5px] text-violet">
              <span>TikTok ↗</span>
              <span>Reels ↗</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TipComposer({ arena }: { arena: Arena }) {
  const [amount, setAmount] = useState<number>(TIP_PRESETS[1]);
  const [target, setTarget] = useState<Color>("b");
  const [req, setReq] = useState("");
  return (
    <div className="rounded-[26px] border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[14px] font-medium">
          <HandCoins size={16} className="text-teal" /> Tip để host cà khịa
        </div>
        <HostOrb id="blunder" size={24} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-white/[0.03] p-1">
        {(["w", "b"] as const).map((c) => (
          <button key={c} onClick={() => setTarget(c)} className={cn("relative truncate rounded-xl px-3 py-2 text-left text-[12px]", target === c ? "text-fg" : "text-fg-3")}>
            {target === c && <motion.span layoutId="tip-target" className="absolute inset-0 rounded-xl bg-white/[0.08]" />}
            <span className="relative">
              {c === "w" ? "♔ " : "♚ "}
              {arena.players[c].name}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {TIP_PRESETS.map((t) => (
          <button key={t} onClick={() => setAmount(t)} className={cn("rounded-xl py-2 font-mono text-[13px] transition-colors", amount === t ? "bg-fg text-void" : "bg-white/[0.04] text-fg-2 hover:text-fg")}>
            {t}
          </button>
        ))}
      </div>
      <input
        value={req}
        onChange={(e) => setReq(e.target.value.slice(0, 80))}
        placeholder="Câu cà khịa bạn muốn (tuỳ chọn)"
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[13px] outline-none placeholder:text-fg-3 focus:border-violet/60"
        aria-label="Nội dung cà khịa"
      />
      <Button className="mt-3 w-full" onClick={() => arena.tip(amount, target, req) && setReq("")}>
        <Coin className="h-4 w-4" /> Tip {amount} coin
      </Button>
    </div>
  );
}

/* ───────── Trang ───────── */
export function ArenaView() {
  const arena = useArena();
  const { game, players, clocks, mode } = arena;
  const [tab, setTab] = useState<"feed" | "chat" | "clips">("feed");
  const [active, setActive] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    if (stageRef.current) io.observe(stageRef.current);
    return () => io.disconnect();
  }, []);

  const caps = capturedBy(game.pieces);
  const lastHostItem = [...arena.feed].reverse().find((f) => f.host);
  const evalPct = 50 + Math.max(-46, Math.min(46, game.evalCp / 12));
  const effects = [
    game.fog.left > 0 && { label: `Sương mù · còn ${game.fog.left} nước`, tint: "linear-gradient(135deg,#4d8dff,#3ee6e0)" },
    game.forcedRandom && { label: "Nước kế tiếp: ngẫu nhiên", tint: "linear-gradient(135deg,#8b7cff,#4d8dff)" },
    game.spotlight && { label: "Đèn sân khấu đang bật", tint: "linear-gradient(135deg,#ffc56b,#ff8a4c)" },
  ].filter(Boolean) as { label: string; tint: string }[];

  return (
    <section className="relative pb-20 pt-24 md:pt-28">
      <Aurora className="opacity-60" />
      <div className="shell relative">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-fg-2">
              <span className="flex items-center gap-1.5 rounded-full bg-rose/15 px-2.5 py-1 font-mono text-[10.5px] text-rose">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> LIVE
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10.5px]">
                <Eye size={12} /> {compact(arena.viewers)}
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10.5px]">Blitz 3+0</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10.5px]">Nước {Math.ceil(game.ply / 2) || 0}</span>
            </div>
            <h1 className="display mt-3 text-4xl md:text-5xl">
              Arena <span className="serif-accent text-aurora">#{arena.gameNo}</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1" role="tablist" aria-label="Chế độ">
              {(
                [
                  ["watch", "Xem trận", Tv],
                  ["play", "Tự cầm quân", Swords],
                ] as const
              ).map(([m, label, Icon]) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => mode !== m && arena.setMode(m)}
                  className={cn("relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] transition-colors", mode === m ? "text-void" : "text-fg-2 hover:text-fg")}
                >
                  {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                  <Icon size={14} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => arena.setTts(!arena.tts)}
              className={cn("flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors", arena.tts ? "border-violet/60 bg-violet/10 text-fg" : "border-white/10 text-fg-2 hover:text-fg")}
              aria-pressed={arena.tts}
            >
              {arena.tts ? <Volume2 size={15} /> : <VolumeX size={15} />} Giọng host
            </button>
            <button onClick={() => arena.newGame()} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-fg-2 transition-colors hover:text-fg" aria-label="Ván mới">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_370px]">
          <div className="min-w-0">
            <div ref={stageRef} className="relative h-[min(80vh,540px)] overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#06060b] sm:h-[min(74vh,660px)] lg:h-[min(76vh,740px)]">
              <ArenaCanvas
                pieces={game.pieces}
                last={game.last}
                check={game.check}
                fog={game.fog.squares}
                selected={arena.selected}
                targets={arena.targets}
                flash={arena.flash}
                shake={arena.shake}
                interactive={mode === "play"}
                onSquare={arena.selectSquare}
                active={active}
              />
              <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-3 sm:left-5 sm:right-5 sm:top-5">
                <div className="w-full max-w-[340px]">
                  <PlayerPill p={players.b} color="b" ms={clocks.b} active={!game.over && game.turn === "b"} captured={caps.b} />
                </div>
                <div className="hidden sm:block">
                  <HypeRing value={arena.hype} />
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-16 left-3 z-10 w-[calc(100%-24px)] max-w-[340px] sm:bottom-16 sm:left-5">
                <PlayerPill p={players.w} color="w" ms={clocks.w} active={!game.over && game.turn === "w"} captured={caps.w} you={mode === "play"} />
              </div>
              {/* Thanh thế cờ */}
              <div className="pointer-events-none absolute bottom-24 right-5 top-24 z-10 hidden w-1.5 overflow-hidden rounded-full bg-white/10 sm:block" title="Thế cờ">
                <motion.div className="absolute bottom-0 left-0 right-0 rounded-full bg-[linear-gradient(0deg,#f3f1ff,#b9b0ff)]" animate={{ height: `${evalPct}%` }} transition={{ type: "spring", stiffness: 60, damping: 14 }} />
              </div>
              <div className="pointer-events-none absolute left-1/2 top-20 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 sm:top-24">
                <AnimatePresence>
                  {effects.map((e) => (
                    <motion.div key={e.label} initial={{ opacity: 0, y: -8, scale: 0.9, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0, scale: 0.9 }} className="rounded-full px-3 py-1 font-mono text-[11px] text-void" style={{ background: e.tint }}>
                      {e.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {mode === "play" && !game.over && game.turn === "w" && (
                <div className="pointer-events-none absolute right-6 top-24 z-10 hidden rounded-full bg-fg px-3 py-1 text-[12px] font-medium text-void sm:block">Lượt của bạn · bấm quân để đi</div>
              )}
              <Subtitle item={lastHostItem} speaking={!!arena.speaking} />
              <AnimatePresence>
                {game.over && (
                  <motion.div className="absolute inset-0 z-20 grid place-items-center bg-void/60 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div initial={{ scale: 0.88, y: 24, filter: "blur(10px)" }} animate={{ scale: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="glass-strong mx-4 max-w-md rounded-[30px] p-8 text-center">
                      <div className="kicker text-fg-3">Kết thúc · {game.over.reason}</div>
                      <div className="display mt-3 text-4xl">{game.over.winner ? <>{players[game.over.winner].name} <span className="serif-accent text-aurora">thắng.</span></> : <span className="serif-accent text-aurora">Hòa cờ.</span>}</div>
                      <p className="mt-3 text-[14px] text-fg-2">{mode === "watch" ? "Ván mới tự bắt đầu sau vài giây…" : "Phục thù chứ?"}</p>
                      <Button className="mt-6" onClick={() => arena.newGame()}>
                        <RotateCcw size={15} /> Ván mới ngay
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ChaosDock arena={arena} />
            <p className="mt-3 text-center text-[12px] text-fg-3">Chaos Card tác động lên bên đang tới lượt · rê chuột để phóng to, bấm để ném</p>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <div className="glass-strong flex h-[520px] flex-col overflow-hidden rounded-[28px] lg:h-[min(62vh,560px)]">
              <div className="flex gap-1 border-b border-white/[0.06] p-1.5" role="tablist">
                {(
                  [
                    ["feed", "Bình luận", Mic],
                    ["chat", "Chat", MessageCircle],
                    ["clips", "Clip", Clapperboard],
                  ] as const
                ).map(([k, label, Icon]) => (
                  <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("relative flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] transition-colors", tab === k ? "text-fg" : "text-fg-3 hover:text-fg-2")}>
                    {tab === k && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-2xl bg-white/[0.07]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <Icon size={14} className="relative z-10" />
                    <span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>
              <div className="relative min-h-0 flex-1">
                {tab === "feed" && <FeedPanel feed={arena.feed} />}
                {tab === "chat" && <ChatPanel arena={arena} />}
                {tab === "clips" && <ClipsPanel />}
              </div>
              <div className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-3">
                {(["gambit", "zugzwang", "blunder"] as const).map((h) => (
                  <div key={h} className={cn("transition-opacity duration-300", arena.speaking === h ? "opacity-100" : "opacity-40")}>
                    <HostOrb id={h} size={24} talking={arena.speaking === h} />
                  </div>
                ))}
                {arena.speaking && <VoiceBars color={HOSTS[arena.speaking].color} className="ml-1" />}
                <span className="ml-auto font-mono text-[10.5px] text-fg-3">3 host đang trực</span>
              </div>
            </div>
            <TipComposer arena={arena} />
          </aside>
        </div>
      </div>
    </section>
  );
}
