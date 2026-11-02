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
  "pawnstorm_23",
  "QueenSlayer",
  "knightmare.exe",
  "rook_n_roll",
  "BishopBandit",
  "LostKing404",
  "CastleEarly",
  "blitz_bae",
  "EnPassantEm",
  "SacTheQueen",
  "Zwischenzug_",
  "en_passant_enjoyer",
];
const COUNTRIES = ["🇺🇸", "🇬🇧", "🇻🇳", "🇩🇪", "🇧🇷", "🇮🇳", "🇰🇷", "🇯🇵", "🇫🇷", "🇨🇦"];

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
  { user: "future_GM", color: "#b9b0ff", badge: "pro" as const },
  { user: "tiny_pawn", color: "#ffd23c" },
  { user: "ChaosLord_HN", color: "#ff8fb4", badge: "lord" as const },
  { user: "anh.tuan.dev", color: "#b9a6ff" },
  { user: "chess_mod", color: "#48e5ff", badge: "mod" as const },
  { user: "blitz_goblin", color: "#ffb37a" },
];
const CHAT_IDLE = [
  "someone throw fog already 😂",
  "this game is so tense",
  "Gambit is SO loud lol",
  "Zugzwang is right tho",
  "GG incoming",
  "can we get a Piece Swap pls",
  "how is this so good",
  "MC Blunder's roasts are elite 🤣",
  "my heart is racing",
  "this is going on TikTok for sure",
  "white is pushing hard",
  "black's defense is solid",
  "someone tip Blunder for a roast",
  "first time watching chess and I'm hooked",
];
const CHAT_REACT = ["WTF 😱", "OMG", "NO WAY", "it's over 💀", "hahaha", "clip it clip it", "🔥🔥🔥", "I can't believe it", "peak content"];

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
    w: { name: "pawnstorm_23", rating: 1642, country: "🇺🇸", style: { depth: 2, chaos: 0.06, slack: 30 } },
    b: { name: "QueenSlayer", rating: 1588, country: "🇬🇧", style: { depth: 2, chaos: 0.08, slack: 40 } },
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
      pushFeed({ text: `✂ AI just clipped: “${title}”`, kind: "system" });
      toast({ title: "✂ Highlight clipped", body: title, tone: "cyan" });
    },
    [pushFeed, toast],
  );

  const checkOver = useCallback((chess: Chess): GameState["over"] => {
    if (chess.isCheckmate()) return { winner: chess.turn() === "w" ? "b" : "w", reason: "checkmate" };
    if (chess.isStalemate()) return { winner: null, reason: "stalemate" };
    if (chess.isInsufficientMaterial()) return { winner: null, reason: "insufficient material" };
    if (chess.isThreefoldRepetition()) return { winner: null, reason: "threefold repetition" };
    if (chess.isDraw()) return { winner: null, reason: "50-move rule" };
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
            ? `${player} checkmates ${opponent}`
            : ctx.captured === "q"
              ? `${player} takes the queen with ${mv.san}`
              : ctx.swing < -180
                ? `${player} blunders ${mv.san} on air`
                : `${player}: ${mv.san} breaks the chat`;
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
            text: over.winner ? `🏁 ${pl[over.winner].name} wins — ${over.reason}.` : `🤝 Draw — ${over.reason}.`,
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
      const w: Player = m === "play" ? { name: useWallet.getState().username, rating: 1200, country: "⭐", style: { depth: 1, chaos: 0, slack: 0 } } : randomPlayer();
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
      pushFeed({ text: `🎬 New game: ${w.name} (White) vs ${b.name} (Black). Hosts are live!`, kind: "system" });
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

  // Bot moves
  useEffect(() => {
    if (game.over) return;
    if (mode === "play" && game.turn === "w") {
      // the human player was forced into a random move
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

  // Auto-start a new game in watch mode
  useEffect(() => {
    if (!game.over || mode !== "watch") return;
    const t = setTimeout(() => newGame("watch"), 9000);
    return () => clearTimeout(t);
  }, [game.over, mode, newGame]);

  // Clocks
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
        update((s) => ({ ...s, over: { winner, reason: "timeout" } }));
        pushFeed({ text: `⏰ ${playersRef.current[side].name} flagged! ${playersRef.current[winner].name} wins.`, kind: "system" });
        say([{ host: "blunder", text: `Time's up, ${playersRef.current[side].name}. The clock waits for nobody!`, hype: 40 }], "move");
      }
    }, 100);
    return () => clearInterval(t);
  }, [pushFeed, say, update]);

  // Hype decay, viewer drift, ambient chat
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

  // Greeting
  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    pushFeed({ text: "🎬 Welcome to the ChessCast Arena! Throw a Chaos Card any time to flip the game.", kind: "system" });
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
        toast({ title: "This game is over", body: "Wait for the next game to throw a Chaos Card.", tone: "neutral" });
        return false;
      }
      const cost = cardCost(id);
      const wallet = useWallet.getState();
      if (wallet.coins < cost) {
        toast({ title: "Not enough Chaos Coins", body: `You need ${cost} coins. Top up to keep the chaos going!`, tone: "pink" });
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
        toast({ title: "That card can't play right now", body: "The position doesn't allow it — you were not charged.", tone: "neutral" });
        return false;
      }
      useWallet.getState().spend(cost);
      setFlash((n) => n + 1);
      const user = wallet.username;
      pushChat({ user, color: card.accent, badge: "you", text: `threw ${card.name}!` });
      say(commentChaos(id, user), "chaos");
      reactBurst(5);
      setHype((h) => Math.min(100, h + 30));
      toast({ title: `${card.name}!`, body: `−${cost} coins. The whole arena is watching you.`, tone: "pink" });
      // a chaos edit can end the game outright
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
        toast({ title: "Not enough coins to tip", tone: "pink" });
        setWalletOpen(true);
        return false;
      }
      const targetName = playersRef.current[target].name;
      pushChat({ user: wallet.username, color: "#9ff3ff", badge: "you", text: request?.trim() || `tipped for a roast of ${targetName}`, tip: amount });
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
      pushChat({ user: w.username, color: "#9ff3ff", badge: "you", text: t });
      if (Math.random() < 0.35) {
        later(() => say([{ host: pick(["gambit", "zugzwang", "blunder"] as HostId[]), text: `Reading chat from ${w.username}: “${t.slice(0, 50)}” — facts!`, hype: 8 }], "move"), 900);
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
