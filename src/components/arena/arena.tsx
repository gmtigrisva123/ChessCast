"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Clapperboard,
  Eye,
  HandCoins,
  MessageCircle,
  Mic,
  RotateCcw,
  Send,
  Swords,
  Tv,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import type { Color } from "chess.js";
import { useArena, type Arena, type FeedItem, type Player } from "./use-arena";
import { CHAOS_CARDS, TIP_PRESETS } from "@/lib/catalog";
import { HOSTS } from "@/lib/hosts";
import { useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, compact, formatClock, formatNum } from "@/lib/utils";
import { HostAvatar } from "../ui/host-avatar";
import { HoloCard } from "../ui/holo-card";
import { Button } from "../ui/button";
import { Coin } from "../commerce/coin";

const ArenaCanvas = dynamic(() => import("./arena-canvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-3 text-sm text-cream/50">
        <div className="h-16 w-16 animate-spin-slow rounded-2xl checker-bg" />
        Đang dựng bàn cờ 3D…
      </div>
    </div>
  ),
});

function PlayerBar({ p, color, ms, active, captured, you }: { p: Player; color: Color; ms: number; active: boolean; captured: string; you?: boolean }) {
  const low = ms < 30_000;
  return (
    <div className={cn("glass flex items-center gap-3 rounded-2xl px-3 py-2 transition-shadow", active && "shadow-[0_0_0_1.5px_var(--color-lime)]")}>
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-lg font-bold", color === "w" ? "bg-cream text-ink" : "bg-ink text-cream ring-1 ring-cream/20")}>
        {color === "w" ? "♔" : "♚"}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 truncate text-sm font-semibold">
          <span>{p.country}</span>
          <span className="truncate">{p.name}</span>
          {you && <span className="rounded bg-lime px-1.5 text-[10px] font-bold text-ink">BẠN</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-cream/50">
          <span>{p.rating}</span>
          <span className="truncate tracking-tight text-cream/70">{captured}</span>
        </div>
      </div>
      <div
        className={cn(
          "ml-auto rounded-xl px-3 py-1.5 font-display text-xl font-bold tabular-nums transition-colors",
          active ? (low ? "animate-pulse bg-pink text-ink" : "bg-lime text-ink") : "bg-ink/60 text-cream/60",
        )}
      >
        {formatClock(ms)}
      </div>
    </div>
  );
}

function capturedBy(history: string[], pieces: Arena["game"]["pieces"]) {
  const start: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const count = { w: { ...start }, b: { ...start } } as Record<Color, Record<string, number>>;
  for (const id in pieces) {
    const pc = pieces[id];
    if (pc.type !== "k") count[pc.color][pc.type] = (count[pc.color][pc.type] ?? 0) - 1;
  }
  const glyph: Record<string, string> = { q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  const fmt = (c: Record<string, number>) =>
    (["q", "r", "b", "n", "p"] as const)
      .map((k) => (c[k] > 0 ? glyph[k].repeat(Math.min(c[k], 8)) : ""))
      .join("");
  void history;
  // quân Trắng ăn được = quân Đen mất
  return { w: fmt(count.b), b: fmt(count.w) };
}

function Meter({ value, label, color, side }: { value: number; label: string; color: string; side: "left" | "right" }) {
  return (
    <div className={cn("pointer-events-none absolute bottom-24 top-24 z-10 hidden w-3 flex-col items-center sm:flex", side === "left" ? "left-3" : "right-3")}>
      <div className="relative w-full flex-1 overflow-hidden rounded-full bg-ink/70 ring-1 ring-cream/10">
        <motion.div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ background: color }} animate={{ height: `${value}%` }} transition={{ type: "spring", stiffness: 60, damping: 14 }} />
      </div>
      <div className="mt-2 text-[9px] font-bold uppercase tracking-widest text-cream/50 [writing-mode:vertical-rl]">{label}</div>
    </div>
  );
}

function Subtitle({ item, speaking }: { item?: FeedItem; speaking: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[76px] z-10 flex justify-center sm:bottom-20">
      <AnimatePresence mode="popLayout">
        {item?.host && (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass flex max-w-2xl items-center gap-3 rounded-2xl px-3 py-2.5 pr-4"
          >
            <HostAvatar id={item.host} size={38} talking={speaking} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: HOSTS[item.host].color }}>
                {HOSTS[item.host].name}
                {item.kind === "ai" && <span className="rounded bg-cream/10 px-1 text-[9px] text-cream/70">AI LIVE</span>}
              </div>
              <div className="text-[13px] leading-snug text-cream sm:text-[15px]">{item.text}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedPanel({ feed }: { feed: FeedItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [feed.length]);
  return (
    <div ref={ref} data-lenis-prevent className="h-full space-y-3 overflow-y-auto p-4">
      <AnimatePresence initial={false}>
        {feed.map((f) => (
          <motion.div key={f.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
            {f.host ? (
              <div className="flex gap-2.5">
                <HostAvatar id={f.host} size={32} />
                <div className={cn("min-w-0 flex-1 rounded-2xl rounded-tl-sm px-3 py-2", f.kind === "chaos" ? "bg-pink/15" : f.kind === "tip" ? "bg-lime/10" : "bg-ink-3/70")}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: HOSTS[f.host].color }}>
                    {HOSTS[f.host].name}
                    {f.kind === "ai" && <span className="rounded bg-cream/10 px-1 text-[9px] text-cream/70">AI LIVE</span>}
                    {f.kind === "chaos" && <Zap size={11} className="text-pink" />}
                    {f.kind === "tip" && <HandCoins size={11} className="text-lime" />}
                  </div>
                  <div className="text-[13.5px] leading-snug text-cream/90">{f.text}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-cream/10 px-3 py-2 text-center text-xs text-cream/55">{f.text}</div>
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
      <div ref={ref} data-lenis-prevent className="flex-1 space-y-1.5 overflow-y-auto p-4">
        {arena.chat.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("text-[13.5px] leading-snug", m.tip && "rounded-xl bg-lime/10 p-2")}>
            {m.badge && (
              <span
                className={cn(
                  "mr-1 rounded px-1 py-px text-[9px] font-bold uppercase",
                  m.badge === "lord" ? "bg-pink text-ink" : m.badge === "pro" ? "bg-lime text-ink" : m.badge === "mod" ? "bg-cyan text-ink" : "bg-cream text-ink",
                )}
              >
                {m.badge === "you" ? "bạn" : m.badge}
              </span>
            )}
            <span className="font-semibold" style={{ color: m.color }}>
              {m.user}
            </span>
            {m.tip && <span className="ml-1 font-bold text-lime">tip {m.tip}◈</span>}
            <span className="text-cream/80">: {m.text}</span>
          </motion.div>
        ))}
      </div>
      <form
        className="flex items-center gap-2 border-t border-cream/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          arena.sendChat(text);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhắn gì đó cho arena…"
          className="min-w-0 flex-1 rounded-full bg-ink-3 px-4 py-2.5 text-sm outline-none placeholder:text-cream/35 focus:ring-1 focus:ring-lime"
          maxLength={140}
          aria-label="Tin nhắn chat"
        />
        <button className="grid h-10 w-10 place-items-center rounded-full bg-lime text-ink" aria-label="Gửi">
          <Send size={16} />
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
        <div className="grid h-full place-items-center text-center text-sm text-cream/45">
          <div>
            <Clapperboard className="mx-auto mb-3 text-cream/30" />
            AI sẽ tự cắt clip khi có khoảnh khắc cao trào: ăn Hậu, blunder, chiếu hết, Chaos Card…
          </div>
        </div>
      )}
      {clips.map((c) => (
        <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group flex items-center gap-3 rounded-2xl bg-ink-3/70 p-2.5">
          <div className="relative grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-pink to-violet">
            <Tv size={18} className="text-ink" />
            <span className="absolute bottom-1 text-[9px] font-bold text-ink">0:15</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{c.title}</div>
            <div className="text-xs text-cream/45">
              {c.host} · {new Date(c.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="mt-1 flex gap-2 text-[11px] font-semibold text-lime">
              <span>TikTok ↗</span>
              <span>Reels ↗</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TipBox({ arena }: { arena: Arena }) {
  const [amount, setAmount] = useState<number>(TIP_PRESETS[1]);
  const [target, setTarget] = useState<Color>("b");
  const [req, setReq] = useState("");
  return (
    <div className="rounded-[24px] border border-cream/10 bg-ink-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <HandCoins size={18} className="text-lime" /> Tip để host “cà khịa”
        </div>
        <HostAvatar id="blunder" size={30} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["w", "b"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setTarget(c)}
            className={cn("truncate rounded-xl border px-3 py-2 text-left text-xs", target === c ? "border-lime bg-lime/10 text-cream" : "border-cream/10 text-cream/60")}
          >
            {c === "w" ? "♔ " : "♚ "}
            {arena.players[c].name}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {TIP_PRESETS.map((t) => (
          <button
            key={t}
            onClick={() => setAmount(t)}
            className={cn("flex items-center justify-center gap-1 rounded-xl py-2 text-sm font-bold transition-colors", amount === t ? "bg-lime text-ink" : "bg-ink-3 text-cream/70 hover:text-cream")}
          >
            {t}
          </button>
        ))}
      </div>
      <input
        value={req}
        onChange={(e) => setReq(e.target.value.slice(0, 80))}
        placeholder="Lời cà khịa bạn muốn (tuỳ chọn)"
        className="mt-2 w-full rounded-xl bg-ink-3 px-3 py-2.5 text-sm outline-none placeholder:text-cream/35 focus:ring-1 focus:ring-lime"
        aria-label="Nội dung cà khịa"
      />
      <Button
        className="mt-3 w-full"
        onClick={() => {
          if (arena.tip(amount, target, req)) setReq("");
        }}
      >
        <Coin className="h-4 w-4" /> Tip {amount} coin
      </Button>
      <p className="mt-2 text-[11px] leading-snug text-cream/40">Host AI sẽ chọn lọc lời lẽ: hài hước, không xúc phạm cá nhân.</p>
    </div>
  );
}

export function ArenaView() {
  const arena = useArena();
  const { game, players, clocks, mode } = arena;
  const coins = useWallet((s) => s.coins);
  const plan = useWallet((s) => s.plan);
  const mounted = useMounted();
  const [tab, setTab] = useState<"feed" | "chat" | "clips">("feed");
  const [active, setActive] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    if (boardRef.current) io.observe(boardRef.current);
    return () => io.disconnect();
  }, []);

  const caps = capturedBy(game.history, game.pieces);
  const lastHostItem = [...arena.feed].reverse().find((f) => f.host);
  const evalPct = 50 + Math.max(-46, Math.min(46, game.evalCp / 12));
  const effects = [
    game.fog.left > 0 && { label: `Sương mù · còn ${game.fog.left} nước`, color: "#48e5ff" },
    game.forcedRandom && { label: "Nước kế tiếp: NGẪU NHIÊN", color: "#d8ff3c" },
    game.spotlight && { label: "Đèn sân khấu đang bật", color: "#ffd23c" },
  ].filter(Boolean) as { label: string; color: string }[];

  return (
    <section className="container-x pb-20 pt-24 md:pt-28">
      {/* Thanh trên */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-pink px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ink" /> Live
            </span>
            <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-cream/75">
              <Eye size={13} /> {compact(arena.viewers)} người xem
            </span>
            <span className="glass rounded-full px-3 py-1 text-xs text-cream/75">Blitz 3+0</span>
            <span className="glass rounded-full px-3 py-1 text-xs text-cream/75">Nước {Math.ceil(game.ply / 2) || 0}</span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
            Arena <span className="text-lime">#{arena.gameNo}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-cream/10 bg-ink-2 p-1" role="tablist" aria-label="Chế độ">
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
                className={cn("relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors", mode === m ? "text-ink" : "text-cream/60 hover:text-cream")}
              >
                {mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <Icon size={15} className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => arena.setTts(!arena.tts)}
            className={cn("flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors", arena.tts ? "border-lime text-lime" : "border-cream/10 text-cream/60")}
            aria-pressed={arena.tts}
          >
            {arena.tts ? <Volume2 size={16} /> : <VolumeX size={16} />} Giọng host
          </button>
          <button onClick={() => arena.newGame()} className="grid h-11 w-11 place-items-center rounded-full border border-cream/10 text-cream/60 hover:border-lime hover:text-lime" aria-label="Ván mới">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Sân khấu 3D */}
          <div ref={boardRef} className="relative h-[min(78vh,520px)] overflow-hidden rounded-[28px] border border-cream/10 bg-[#15161b] sm:h-[min(72vh,640px)] lg:h-[min(74vh,720px)]">
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
            <div className="pointer-events-none absolute inset-x-3 top-3 z-10 sm:inset-x-6">
              <PlayerBar p={players.b} color="b" ms={clocks.b} active={!game.over && game.turn === "b"} captured={caps.b} />
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 sm:inset-x-6">
              <PlayerBar p={players.w} color="w" ms={clocks.w} active={!game.over && game.turn === "w"} captured={caps.w} you={mode === "play"} />
            </div>
            <Meter value={evalPct} label="Thế cờ" color="#f2efe7" side="left" />
            <Meter value={arena.hype} label="Hype" color="linear-gradient(to top, #d8ff3c, #ff4d6a)" side="right" />
            <div className="pointer-events-none absolute left-1/2 top-[76px] z-10 flex -translate-x-1/2 flex-col items-center gap-1.5">
              <AnimatePresence>
                {effects.map((e) => (
                  <motion.div
                    key={e.label}
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink"
                    style={{ background: e.color }}
                  >
                    {e.label}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {mode === "play" && !game.over && game.turn === "w" && (
              <div className="pointer-events-none absolute right-4 top-[76px] z-10 hidden rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink sm:block">Lượt của bạn — bấm quân để đi</div>
            )}
            <Subtitle item={lastHostItem} speaking={!!arena.speaking} />
            <AnimatePresence>
              {game.over && (
                <motion.div className="absolute inset-0 z-20 grid place-items-center bg-ink/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    initial={{ scale: 0.8, rotateX: 30, y: 30 }}
                    animate={{ scale: 1, rotateX: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    style={{ transformPerspective: 800 }}
                    className="mx-4 rounded-[28px] bg-lime p-8 text-center text-ink"
                  >
                    <div className="eyebrow text-ink/60">Kết thúc · {game.over.reason}</div>
                    <div className="mt-2 font-display text-5xl font-bold uppercase leading-none">{game.over.winner ? `${players[game.over.winner].name} thắng!` : "Hòa cờ!"}</div>
                    <p className="mt-3 text-sm text-ink/70">{mode === "watch" ? "Ván mới tự động bắt đầu sau vài giây…" : "Phục thù không?"}</p>
                    <Button variant="dark" className="mt-5" onClick={() => arena.newGame()}>
                      <RotateCcw size={16} /> Ván mới ngay
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chaos Cards */}
          <div className="mt-5 rounded-[28px] border border-cream/10 bg-ink-2 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-display text-2xl font-bold uppercase">
                  <Zap className="text-pink" size={22} /> Chaos Cards
                </div>
                <p className="text-sm text-cream/50">
                  Tác động lên <b className="text-cream">bên đang đi</b>.{mounted && plan !== "free" && <span className="text-lime"> Thành viên giảm 10%.</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-ink-3 px-4 py-2 text-sm font-semibold">
                <Coin className="h-5 w-5" /> {mounted ? formatNum(coins) : "—"} coin
              </div>
            </div>
            <div className="no-scrollbar -mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-6 md:overflow-visible">
              {CHAOS_CARDS.map((c) => {
                const cost = arena.cardCost(c.id);
                const afford = !mounted || coins >= cost;
                return (
                  <div key={c.id} className="w-[132px] shrink-0 md:w-auto">
                    <HoloCard
                      card={{ ...c, cost }}
                      compact
                      onClick={() => arena.playCard(c.id)}
                      disabled={!!game.over || !afford}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div className="flex h-[520px] flex-col overflow-hidden rounded-[28px] border border-cream/10 bg-ink-2 lg:h-[min(74vh,560px)]">
            <div className="flex border-b border-cream/10 p-1.5" role="tablist">
              {(
                [
                  ["feed", "Bình luận", Mic],
                  ["chat", "Chat", MessageCircle],
                  ["clips", "Clip", Clapperboard],
                ] as const
              ).map(([k, label, Icon]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={cn("relative flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold", tab === k ? "text-cream" : "text-cream/50")}
                >
                  {tab === k && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-2xl bg-ink-3" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <Icon size={15} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>
            <div className="relative min-h-0 flex-1">
              {tab === "feed" && <FeedPanel feed={arena.feed} />}
              {tab === "chat" && <ChatPanel arena={arena} />}
              {tab === "clips" && <ClipsPanel />}
            </div>
            <div className="flex items-center gap-2 border-t border-cream/10 px-4 py-2.5">
              {(["gambit", "zugzwang", "blunder"] as const).map((h) => (
                <div key={h} className={cn("transition-opacity", arena.speaking === h ? "opacity-100" : "opacity-40")}>
                  <HostAvatar id={h} size={26} talking={arena.speaking === h} />
                </div>
              ))}
              <span className="ml-auto text-[11px] uppercase tracking-widest text-cream/40">3 host đang trực</span>
            </div>
          </div>
          <TipBox arena={arena} />
        </div>
      </div>
    </section>
  );
}
