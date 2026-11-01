"use client";

import { Chess, type Color, type Move, type Square } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { applyMove, piecesFromFen, relocate, swapSquares, type PieceMap } from "@/lib/chess/tracker";
import { evaluate, pickMove, randomMove, type BotStyle } from "@/lib/chess/engine";
import { chaosQuake, chaosSwap, fogRows } from "@/lib/chess/chaos";
import { CHAOS_CARDS, type ChaosCardId } from "@/lib/catalog";
import { commentChaos, commentMove, commentTip, HOSTS, speak, type HostId, type Line } from "@/lib/hosts";
import { useUI, useWallet } from "@/lib/store";
import { pick, uid } from "@/lib/utils";

export type FeedItem = { id: string; host?: HostId; text: string; kind: "move" | "chaos" | "tip" | "system" | "ai"; ts: number };
export type ChatMsg = { id: string; user: string; text: string; color: string; badge?: "pro" | "lord" | "mod" | "you"; tip?: number };
export type Player = { name: string; rating: number; style: BotStyle; country: string };

type GameState = {
  pieces: PieceMap;
  last: { from: Square; to: Square } | null;
  check: Square | null;
  ply: number;
  turn: Color;
  fog: { squares: Square[]; left: number };
  forcedRandom: boolean;
  spotlight: boolean;
  over: null | { winner: Color | null; reason: string };
  history: string[];
  evalCp: number;
};

const START = new Chess().fen();
const CLOCK = 180_000;

const NAMES = [
  "tốt_thí_123",
  "HậuĐen_VN",
  "MãĐiênSG",
  "xe_tăng_99",
  "BishopBốc",
  "VuaLạcLối",
  "NhậpThànhSớm",
  "cờ_chớp_hn",
  "EnPassantEm",
  "ThíHậuMỗiNgày",
  "Zwischenzug_",
  "tượng_đồng",
];
const COUNTRIES = ["🇻🇳", "🇻🇳", "🇻🇳", "🇹🇭", "🇵🇭", "🇮🇩", "🇰🇷", "🇯🇵"];

function randomPlayer(exclude?: string): Player {
  const name = pick(NAMES.filter((n) => n !== exclude));
  const rating = 1150 + Math.round(Math.random() * 800);
  const skill = (rating - 1150) / 800;
  return {
    name,
    rating,
    country: pick(COUNTRIES),
    style: { depth: skill > 0.55 ? 2 : Math.random() < 0.5 ? 2 : 1, chaos: 0.14 - skill * 0.1, slack: Math.round(60 - skill * 40) },
  };
}

const CHAT_USERS = [
  { user: "lan.nguyen", color: "#ff9ec4" },
  { user: "minhkhoa_07", color: "#9be7ff" },
  { user: "GM_tương_lai", color: "#d8ff3c", badge: "pro" as const },
  { user: "bé_tốt_đen", color: "#ffd23c" },
  { user: "ChaosLord_HN", color: "#ff4d6a", badge: "lord" as const },
  { user: "anh.tuan.dev", color: "#b9a6ff" },
  { user: "mod_cờ_vua", color: "#48e5ff", badge: "mod" as const },
  { user: "hùng.chess", color: "#ffb37a" },
];
const CHAT_IDLE = [
  "ai ném sương mù đi mọi người 😂",
  "trận này căng thật",
  "Gambit hét to quá trời",
  "Zugzwang nói đúng mà",
  "GG sắp tới rồi",
  "cho xin 1 lá Hoán Đổi Quân nào",
  "đánh hay vậy trời",
  "MC Blunder cà khịa đỉnh 🤣",
  "xem mà tim đập nhanh",
  "ván này lên TikTok chắc luôn",
  "trắng đang ép dữ",
  "đen thủ chắc ghê",
  "ai tip để Blunder roast đi",
  "lần đầu xem cờ mà vui vậy",
];
const CHAT_REACT = ["WTF 😱", "OMG", "ối dồi ôi!!!", "toang rồi", "hahaha", "clip clip clip", "🔥🔥🔥", "không thể tin được", "đỉnh của chóp"];

export function useArena() {
  const chessRef = useRef(new Chess());
  const initial: GameState = {
    pieces: piecesFromFen(START),
    last: null,
    check: null,
    ply: 0,
    turn: "w",
    fog: { squares: [], left: 0 },
    forcedRandom: false,
    spotlight: false,
    over: null,
    history: [],
    evalCp: 0,
  };
  const [game, setGame] = useState<GameState>(initial);
  const gameRef = useRef<GameState>(initial);
  const update = useCallback((fn: (g: GameState) => GameState) => {
    gameRef.current = fn(gameRef.current);
    setGame(gameRef.current);
  }, []);

  const [mode, setModeState] = useState<"watch" | "play">("watch");
  const modeRef = useRef(mode);
  const [players, setPlayers] = useState<{ w: Player; b: Player }>(() => ({
    w: { name: "tốt_thí_123", rating: 1642, country: "🇻🇳", style: { depth: 2, chaos: 0.06, slack: 30 } },
    b: { name: "HậuĐen_VN", rating: 1588, country: "🇻🇳", style: { depth: 2, chaos: 0.08, slack: 40 } },
  }));
  const playersRef = useRef(players);
  playersRef.current = players;
  const [clocks, setClocks] = useState({ w: CLOCK, b: CLOCK });
  const clocksRef = useRef(clocks);
  const [hype, setHype] = useState(12);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);
  const [flash, setFlash] = useState(0);
  const [shake, setShake] = useState(0);
  const [tts, setTts] = useState(false);
  const ttsRef = useRef(tts);
  ttsRef.current = tts;
  const [viewers, setViewers] = useState(8421);
  const [gameNo, setGameNo] = useState(2741);
  const [speaking, setSpeaking] = useState<HostId | null>(null);
  const aiState = useRef<"unknown" | "on" | "off">("unknown");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toast = useUI((s) => s.toast);
  const setWalletOpen = useUI((s) => s.setWalletOpen);

  const pushFeed = useCallback((item: Omit<FeedItem, "id" | "ts">) => {
    setFeed((f) => [...f.slice(-80), { ...item, id: uid("f"), ts: Date.now() }]);
  }, []);
  const pushChat = useCallback((m: Omit<ChatMsg, "id">) => {
    setChat((c) => [...c.slice(-70), { ...m, id: uid("c") }]);
  }, []);

  const say = useCallback(
    (lines: Line[], kind: FeedItem["kind"]) => {
      lines.forEach((l, i) => {
        later(() => {
          pushFeed({ host: l.host, text: l.text, kind: i === 0 ? kind : kind === "ai" ? "move" : kind });
          setSpeaking(l.host);
          later(() => setSpeaking((s) => (s === l.host ? null : s)), 1800);
          if (i === 0 && ttsRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            speak(l.text, l.host, true);
          }
        }, i * 1150);
      });
      const total = lines.reduce((a, l) => a + l.hype, 0);
      setHype((h) => Math.min(100, h + total * 0.6));
      return total;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushFeed],
  );

  const reactBurst = useCallback(
    (n = 3) => {
      for (let i = 0; i < n; i++) {
        later(() => {
          const u = pick(CHAT_USERS);
          pushChat({ user: u.user, color: u.color, badge: u.badge, text: pick(CHAT_REACT) });
        }, 300 + i * 380 + Math.random() * 300);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushChat],
  );

  const clip = useCallback(
    (title: string, san: string, host: HostId) => {
      useWallet.getState().addClip({ title, san, host: HOSTS[host].name, fen: chessRef.current.fen() });
      pushFeed({ text: `✂ AI vừa cắt clip: “${title}”`, kind: "system" });
      toast({ title: "✂ Clip cao trào đã được cắt", body: title, tone: "cyan" });
    },
    [pushFeed, toast],
  );

  const checkOver = useCallback((chess: Chess): GameState["over"] => {
    if (chess.isCheckmate()) return { winner: chess.turn() === "w" ? "b" : "w", reason: "chiếu hết" };
    if (chess.isStalemate()) return { winner: null, reason: "hết nước đi (stalemate)" };
    if (chess.isInsufficientMaterial()) return { winner: null, reason: "không đủ quân chiếu hết" };
    if (chess.isThreefoldRepetition()) return { winner: null, reason: "lặp lại ba lần" };
    if (chess.isDraw()) return { winner: null, reason: "luật 50 nước" };
    return null;
  }, []);

  const kingInCheck = (chess: Chess): Square | null => (chess.inCheck() ? chess.findPiece({ type: "k", color: chess.turn() })[0] ?? null : null);

  const requestAI = useCallback(
    async (host: HostId, mv: Move, player: string, opponent: string, fen: string) => {
      if (aiState.current === "off") return null;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4500);
      try {
        const r = await fetch("/api/commentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host, san: mv.san, fen, player, opponent }),
          signal: ctrl.signal,
        });
        if (r.status === 204) {
          aiState.current = "off";
          return null;
        }
        const j = (await r.json()) as { text?: string };
        if (j.text) aiState.current = "on";
        return j.text ?? null;
      } catch {
        return null;
      } finally {
        clearTimeout(t);
      }
    },
    [],
  );

  const commit = useCallback(
    (moveInput: Move | { from: Square; to: Square; promotion?: string }, opts: { forced?: boolean } = {}) => {
      const chess = chessRef.current;
      const g = gameRef.current;
      if (g.over) return;
      const before = evaluate(chess);
      const mover = chess.turn();
      let mv: Move;
      try {
        mv = chess.move(moveInput);
      } catch {
        return;
      }
      const after = evaluate(chess);
      const sign = mover === "w" ? 1 : -1;
      const over = checkOver(chess);
      const fogLeft = g.fog.left > 0 ? g.fog.left - 1 : 0;
      const spotlight = g.spotlight;
      update((s) => ({
        ...s,
        pieces: applyMove(s.pieces, mv).pieces,
        last: { from: mv.from, to: mv.to },
        check: kingInCheck(chess),
        ply: s.ply + 1,
        turn: chess.turn(),
        fog: fogLeft > 0 ? { squares: s.fog.squares, left: fogLeft } : { squares: [], left: 0 },
        forcedRandom: false,
        spotlight: false,
        over,
        history: [...s.history, mv.san],
        evalCp: after,
      }));
      setSelected(null);
      setTargets([]);

      const pl = playersRef.current;
      const player = pl[mover].name;
      const opponent = pl[mover === "w" ? "b" : "w"].name;
      const ctx = {
        san: mv.san,
        piece: mv.piece,
        captured: mv.captured,
        to: mv.to,
        player,
        opponent,
        check: chess.inCheck(),
        mate: chess.isCheckmate(),
        castle: mv.isKingsideCastle() || mv.isQueensideCastle(),
        promotion: mv.isPromotion(),
        swing: (after - before) * sign - 40,
        evalAfter: after * sign,
        ply: g.ply,
        forced: opts.forced,
        spotlight,
      };
      const lines = commentMove(ctx);
      const fen = chess.fen();
      const emit = (ls: Line[], kind: FeedItem["kind"]) => {
        let total = say(ls, kind);
        if (spotlight) {
          total *= 2;
          setHype((h) => Math.min(100, h + 25));
        }
        if (total >= 55) {
          const title = ctx.mate
            ? `${player} chiếu hết ${opponent}`
            : ctx.captured === "q"
              ? `${player} ăn Hậu bằng ${mv.san}`
              : ctx.swing < -180
                ? `${player} blunder ${mv.san} trên sóng`
                : `${player}: ${mv.san} gây bão`;
          clip(title, mv.san, ls[0].host);
          reactBurst(4);
        } else if (ctx.captured || ctx.check) reactBurst(1);
      };

      if (aiState.current === "on") {
        requestAI(lines[0].host, mv, player, opponent, fen).then((text) => {
          if (text) emit([{ ...lines[0], text }, ...lines.slice(1)], "ai");
          else emit(lines, "move");
        });
      } else {
        emit(lines, "move");
        if (aiState.current === "unknown") requestAI(lines[0].host, mv, player, opponent, fen);
      }

      if (over) {
        later(() => {
          pushFeed({
            text: over.winner ? `🏁 ${pl[over.winner].name} thắng — ${over.reason}.` : `🤝 Hòa — ${over.reason}.`,
            kind: "system",
          });
        }, 1600);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkOver, clip, pushFeed, reactBurst, requestAI, say, update],
  );

  const newGame = useCallback(
    (m: "watch" | "play" = modeRef.current) => {
      chessRef.current = new Chess();
      const w: Player = m === "play" ? { name: useWallet.getState().username, rating: 1200, country: "🇻🇳", style: { depth: 1, chaos: 0, slack: 0 } } : randomPlayer();
      const b = randomPlayer(w.name);
      setPlayers({ w, b });
      playersRef.current = { w, b };
      update(() => ({
        pieces: piecesFromFen(START),
        last: null,
        check: null,
        ply: 0,
        turn: "w",
        fog: { squares: [], left: 0 },
        forcedRandom: false,
        spotlight: false,
        over: null,
        history: [],
        evalCp: 0,
      }));
      clocksRef.current = { w: CLOCK, b: CLOCK };
      setClocks(clocksRef.current);
      setSelected(null);
      setTargets([]);
      setHype(15);
      setGameNo((n) => n + 1);
      pushFeed({ text: `🎬 Ván mới: ${w.name} (Trắng) vs ${b.name} (Đen). Host đã sẵn sàng!`, kind: "system" });
    },
    [pushFeed, update],
  );

  const setMode = useCallback(
    (m: "watch" | "play") => {
      modeRef.current = m;
      setModeState(m);
      newGame(m);
    },
    [newGame],
  );

  // Bot đi cờ
  useEffect(() => {
    if (game.over) return;
    if (mode === "play" && game.turn === "w") {
      // người chơi bị ép nước ngẫu nhiên
      if (game.forcedRandom) {
        const t = setTimeout(() => {
          const m = randomMove(chessRef.current.fen());
          if (m) commit(m, { forced: true });
        }, 700);
        return () => clearTimeout(t);
      }
      return;
    }
    const think = (mode === "play" ? 700 : 1500) + Math.random() * (mode === "play" ? 900 : 1900);
    const t = setTimeout(() => {
      const g = gameRef.current;
      if (g.over) return;
      const fen = chessRef.current.fen();
      const side = chessRef.current.turn();
      const m = g.forcedRandom ? randomMove(fen) : pickMove(fen, playersRef.current[side].style);
      if (m) commit(m, { forced: g.forcedRandom });
    }, think);
    return () => clearTimeout(t);
  }, [game.ply, game.turn, game.over, game.forcedRandom, mode, commit]);

  // Tự động sang ván mới khi đang xem
  useEffect(() => {
    if (!game.over || mode !== "watch") return;
    const t = setTimeout(() => newGame("watch"), 9000);
    return () => clearTimeout(t);
  }, [game.over, mode, newGame]);

  // Đồng hồ
  useEffect(() => {
    const t = setInterval(() => {
      const g = gameRef.current;
      if (g.over || g.ply === 0) return;
      const side = g.turn;
      const next = { ...clocksRef.current, [side]: Math.max(0, clocksRef.current[side] - 100) };
      clocksRef.current = next;
      setClocks(next);
      if (next[side] === 0) {
        const winner: Color = side === "w" ? "b" : "w";
        update((s) => ({ ...s, over: { winner, reason: "hết giờ" } }));
        pushFeed({ text: `⏰ ${playersRef.current[side].name} hết giờ! ${playersRef.current[winner].name} thắng.`, kind: "system" });
        say([{ host: "blunder", text: `Hết giờ rồi ${playersRef.current[side].name} ơi, đồng hồ không chờ ai đâu!`, hype: 40 }], "move");
      }
    }, 100);
    return () => clearInterval(t);
  }, [pushFeed, say, update]);

  // Hype giảm dần, người xem dao động, chat tự nhiên
  useEffect(() => {
    const a = setInterval(() => setHype((h) => Math.max(6, h - 1.2)), 500);
    const b = setInterval(() => setViewers((v) => Math.max(5000, v + Math.round((Math.random() - 0.45) * 90))), 2000);
    let c: ReturnType<typeof setTimeout>;
    const chatLoop = () => {
      const u = pick(CHAT_USERS);
      pushChat({ user: u.user, color: u.color, badge: u.badge, text: pick(CHAT_IDLE) });
      c = setTimeout(chatLoop, 1800 + Math.random() * 3200);
    };
    c = setTimeout(chatLoop, 1200);
    return () => {
      clearInterval(a);
      clearInterval(b);
      clearTimeout(c);
    };
  }, [pushChat]);

  // Lời chào
  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    pushFeed({ text: "🎬 Chào mừng tới ChessCast Arena! Ném Chaos Card bất kỳ lúc nào để làm đảo lộn trận đấu.", kind: "system" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectSquare = useCallback(
    (sq: Square) => {
      const g = gameRef.current;
      if (modeRef.current !== "play" || g.over || g.turn !== "w") return;
      const chess = chessRef.current;
      if (selected && targets.includes(sq)) {
        const piece = chess.get(selected);
        const promo = piece?.type === "p" && sq[1] === "8" ? "q" : undefined;
        commit({ from: selected, to: sq, promotion: promo });
        return;
      }
      const p = chess.get(sq);
      if (p && p.color === "w") {
        setSelected(sq);
        setTargets(chess.moves({ square: sq, verbose: true }).map((m) => m.to));
      } else {
        setSelected(null);
        setTargets([]);
      }
    },
    [commit, selected, targets],
  );

  const cardCost = useCallback((id: ChaosCardId) => {
    const c = CHAOS_CARDS.find((x) => x.id === id)!;
    const plan = useWallet.getState().plan;
    return plan === "free" ? c.cost : Math.ceil(c.cost * 0.9);
  }, []);

  const playCard = useCallback(
    (id: ChaosCardId) => {
      const g = gameRef.current;
      const card = CHAOS_CARDS.find((c) => c.id === id)!;
      if (g.over) {
        toast({ title: "Ván đấu đã kết thúc", body: "Chờ ván mới để ném Chaos Card nhé.", tone: "neutral" });
        return false;
      }
      const cost = cardCost(id);
      const wallet = useWallet.getState();
      if (wallet.coins < cost) {
        toast({ title: "Không đủ Chaos Coins", body: `Cần ${cost} coin. Nạp thêm để tiếp tục quậy!`, tone: "pink" });
        setWalletOpen(true);
        return false;
      }
      const chess = chessRef.current;
      const fen = chess.fen();
      let ok = true;
      switch (id) {
        case "fog": {
          const squares = fogRows();
          update((s) => ({ ...s, fog: { squares, left: 6 } }));
          break;
        }
        case "random":
          update((s) => ({ ...s, forcedRandom: true }));
          break;
        case "swap": {
          const r = chaosSwap(fen);
          if (!r) {
            ok = false;
            break;
          }
          chessRef.current = new Chess(r.fen);
          update((s) => ({ ...s, pieces: swapSquares(s.pieces, r.a, r.b), check: kingInCheck(chessRef.current), last: { from: r.a, to: r.b } }));
          break;
        }
        case "earthquake": {
          const r = chaosQuake(fen);
          if (!r) {
            ok = false;
            break;
          }
          chessRef.current = new Chess(r.fen);
          update((s) => ({ ...s, pieces: relocate(s.pieces, r.from, r.to), check: kingInCheck(chessRef.current), last: { from: r.from, to: r.to } }));
          setShake((n) => n + 1);
          break;
        }
        case "freeze": {
          const side = chess.turn();
          clocksRef.current = { ...clocksRef.current, [side]: Math.max(1000, clocksRef.current[side] - 15000) };
          setClocks(clocksRef.current);
          break;
        }
        case "spotlight":
          update((s) => ({ ...s, spotlight: true }));
          break;
      }
      if (!ok) {
        toast({ title: "Lá bài không có tác dụng lúc này", body: "Thế cờ hiện tại không cho phép — bạn không bị trừ coin.", tone: "neutral" });
        return false;
      }
      useWallet.getState().spend(cost);
      setFlash((n) => n + 1);
      const user = wallet.username;
      pushChat({ user, color: card.accent, badge: "you", text: `đã ném ${card.glyph} ${card.name}!` });
      say(commentChaos(id, user), "chaos");
      reactBurst(5);
      setHype((h) => Math.min(100, h + 30));
      toast({ title: `${card.glyph} ${card.name}!`, body: `-${cost} coin. Cả arena đang nhìn bạn.`, tone: "pink" });
      // nếu thế cờ sau chaos khiến ván kết thúc
      if (id === "swap" || id === "earthquake") {
        const over = checkOver(chessRef.current);
        if (over) update((s) => ({ ...s, over }));
      }
      return true;
    },
    [cardCost, checkOver, pushChat, reactBurst, say, setWalletOpen, toast, update],
  );

  const tip = useCallback(
    (amount: number, target: Color, request?: string) => {
      const wallet = useWallet.getState();
      if (!wallet.spend(amount)) {
        toast({ title: "Không đủ coin để tip", tone: "pink" });
        setWalletOpen(true);
        return false;
      }
      const targetName = playersRef.current[target].name;
      pushChat({ user: wallet.username, color: "#d8ff3c", badge: "you", text: request?.trim() || `tip để host cà khịa ${targetName}`, tip: amount });
      say(commentTip(wallet.username, amount, targetName, request), "tip");
      reactBurst(3);
      return true;
    },
    [pushChat, reactBurst, say, setWalletOpen, toast],
  );

  const sendChat = useCallback(
    (text: string) => {
      const t = text.trim().slice(0, 140);
      if (!t) return;
      const w = useWallet.getState();
      pushChat({ user: w.username, color: "#d8ff3c", badge: "you", text: t });
      if (Math.random() < 0.35) {
        later(() => say([{ host: pick(["gambit", "zugzwang", "blunder"] as HostId[]), text: `Đọc được chat của ${w.username}: “${t.slice(0, 50)}” — chuẩn luôn!`, hype: 8 }], "move"), 900);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pushChat, say],
  );

  return {
    game,
    mode,
    setMode,
    players,
    clocks,
    hype,
    feed,
    chat,
    selected,
    targets,
    flash,
    shake,
    tts,
    setTts,
    viewers,
    gameNo,
    speaking,
    newGame,
    selectSquare,
    playCard,
    cardCost,
    tip,
    sendChat,
  };
}

export type Arena = ReturnType<typeof useArena>;
