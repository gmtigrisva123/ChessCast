import type { PieceSymbol } from "chess.js";
import type { ChaosCardId } from "./catalog";
import { pick } from "./utils";

export type HostId = "gambit" | "zugzwang" | "blunder";

export type Host = {
  id: HostId;
  name: string;
  handle: string;
  role: string;
  bio: string;
  color: string;
  /** Gradient used for the voice orb */
  orb: [string, string, string];
  catchphrase: string;
  voice: { pitch: number; rate: number };
  rival: HostId;
  stats: { label: string; value: string }[];
};

export const HOSTS: Record<HostId, Host> = {
  gambit: {
    id: "gambit",
    name: "Captain Gambit",
    handle: "@captgambit",
    role: "Lead caster · Sacrifice maniac",
    bio: "A voice that can shatter glass. Believes every piece was born to be sacrificed. Three seasons into a feud with Prof. Zugzwang.",
    color: "#ffb36b",
    orb: ["#ffd29a", "#ff8a4c", "#ff4f7b"],
    catchphrase: "SACRIFICE IT! SACRIFICE EVERYTHING!",
    voice: { pitch: 1.1, rate: 1.1 },
    rival: "zugzwang",
    stats: [
      { label: "Hype level", value: "11/10" },
      { label: "Pieces sacrificed", value: "∞" },
    ],
  },
  zugzwang: {
    id: "zugzwang",
    name: "Prof. Zugzwang",
    handle: "@prof.zugzwang",
    role: "Analyst · Ice cold",
    bio: "Doctor of positional science. Speaks in evaluations, judges with his eyebrows. Has not smiled since 1997.",
    color: "#7cc4ff",
    orb: ["#c7fff7", "#3ee6e0", "#4d8dff"],
    catchphrase: "Technically speaking, this is a catastrophe.",
    voice: { pitch: 0.8, rate: 0.95 },
    rival: "gambit",
    stats: [
      { label: "Accuracy", value: "99.7%" },
      { label: "Smiles", value: "0" },
    ],
  },
  blunder: {
    id: "blunder",
    name: "MC Blunder",
    handle: "@mc.blunder",
    role: "Roast master · Pure chaos",
    bio: "Lives for the wrong move. Takes tips to roast players on request. Banned from four tournaments for being too honest.",
    color: "#c4a8ff",
    orb: ["#ffb3d1", "#ff6b9a", "#8b7cff"],
    catchphrase: "Oh no. Oh no no no. It's over!",
    voice: { pitch: 1.25, rate: 1.15 },
    rival: "zugzwang",
    stats: [
      { label: "Roasts served", value: "48.2K" },
      { label: "Times reported", value: "312" },
    ],
  },
};

export const HOST_LIST = Object.values(HOSTS);

export const PIECE_NAME: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

export type Line = { host: HostId; text: string; hype: number };

export type MoveContext = {
  san: string;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  to: string;
  player: string;
  opponent: string;
  check: boolean;
  mate: boolean;
  castle: boolean;
  promotion: boolean;
  /** Evaluation change from the mover's perspective (centipawns). Negative = worse. */
  swing: number;
  /** Evaluation after the move from the mover's perspective. */
  evalAfter: number;
  ply: number;
  forced?: boolean;
  spotlight?: boolean;
};

const fill = (s: string, c: MoveContext) =>
  s
    .replaceAll("{p}", c.player)
    .replaceAll("{o}", c.opponent)
    .replaceAll("{piece}", PIECE_NAME[c.piece])
    .replaceAll("{cap}", c.captured ? PIECE_NAME[c.captured] : "")
    .replaceAll("{sq}", c.to)
    .replaceAll("{san}", c.san)
    .replaceAll("{ev}", (Math.abs(c.evalAfter) / 100).toFixed(1));

const T = {
  mate: {
    gambit: ["CHECKMATE! {san}! {p} ENDS IT! I CAN'T BREATHE!", "IT'S OVER! {p} JUST WROTE THEIR NAME ACROSS THE NIGHT SKY!"],
    zugzwang: ["Checkmate. The inevitable result of a series of questionable decisions by {o}.", "{san}. Mate. I predicted this nine moves ago."],
    blunder: ["{o}, go home, your mom is calling you for dinner!", "And that's a wrap. {o} has been officially deleted."],
  },
  bigCapture: {
    gambit: ["TAKES THE {cap}! {p} SWALLOWS IT WHOLE ON {sq}!", "BOOM! {o}'s {cap} is GONE! The crowd is losing it!"],
    zugzwang: ["{piece} takes {cap} on {sq}. Material swings by roughly {ev} pawns.", "Captures the {cap}. By the book. Boring, but effective."],
    blunder: ["{o} just lost a {cap}. That hurts more than getting left on read.", "{o} is handing out {cap}s like free samples at the mall."],
  },
  capture: {
    gambit: ["{p} takes on {sq}! Blood on the board!", "TRADES! The board is heating up!"],
    zugzwang: ["{san}. A reasonable exchange.", "Capture on {sq}. Nothing more to say."],
    blunder: ["Trading pieces like two kids fighting over snacks.", "That {cap} didn't even get to do anything. Rest in peace."],
  },
  check: {
    gambit: ["CHECK! {p} IS CHASING THE KING ALL OVER THE BOARD!", "CHECK! {o}'s king is sweating bullets!"],
    zugzwang: ["Check. The question is whether {p} has a plan or is just checking for fun.", "{san}. A check… lacking depth."],
    blunder: ["{o}'s king is running like it owes somebody money!", "Check! {o}, breathe. Inhale. Exhale. Panic."],
  },
  castle: {
    gambit: ["CASTLES! {p} builds the fortress — the assault is coming!"],
    zugzwang: ["Castling. The first decision I agree with all game.", "King safety. At least {p} read chapter one."],
    blunder: ["King hiding in the corner like it's dodging a deadline.", "Castled. Now everyone pretends to be safe."],
  },
  promotion: {
    gambit: ["PROMOTION! A tiny pawn becomes a QUEEN! FAIRY TALES ARE REAL!"],
    zugzwang: ["Promotion. A decisive edge, approximately +{ev}."],
    blunder: ["The pawn just glowed up. Main character energy."],
  },
  blunder: {
    gambit: ["WAIT. {san}?! What did {p} just do?! Is that a sacrifice or a career sacrifice?!", "A bold move! Either genius… or absolutely not!"],
    zugzwang: ["{san}. Assessment: serious mistake. The position drops about {ev} pawns.", "I need a moment to accept that {p} really played {san}."],
    blunder: ["OH NO! {p} just blundered on live TV!", "That clip is going straight to a million views. {p}, why?!"],
  },
  great: {
    gambit: ["WHAT A MOVE! {san}! {p} IS FLYING!", "THAT is chess! {p} reads the board like a comic book!"],
    zugzwang: ["{san}. Precise. I reluctantly approve.", "The best move in the position. Rare at this level."],
    blunder: ["Excuse me, what did {p} eat today?", "Who allowed {p} to play this well? Not allowed!"],
  },
  quiet: {
    gambit: ["{p} plays {san}! Move by move, the pressure is building!", "{piece} to {sq}! I can feel a storm coming!", "{san}! Get your Chaos Cards ready, people!"],
    zugzwang: ["{san}. Sensible.", "{piece} to {sq}. Balanced, roughly {ev} pawns.", "A waiting move. As thrilling as watching paint dry."],
    blunder: ["{p} plays {san} looking confident. Probably shaking inside.", "{piece} just went for a walk to {sq}. Chill.", "If nobody throws a Chaos Card soon I'm taking a nap."],
  },
  opening: {
    gambit: ["WE ARE LIVE! {p} opens with {san}! BUCKLE UP!"],
    zugzwang: ["{san}. A classical opening. Let's see how quickly they ruin it."],
    blunder: ["{p} opens with {san} and I already smell drama."],
  },
  forced: {
    gambit: ["CHAOS CARD! Fate picks the move: {san}! NOBODY SAW THAT COMING!"],
    zugzwang: ["Random move: {san}. This is exactly why I oppose Chaos Cards."],
    blunder: ["The audience picked {san} for {p}. No thinking required!"],
  },
};

const banter: Record<HostId, string[]> = {
  gambit: ["Zugzwang, do you even know what fun is?", "Don't listen to the professor — he's never sacrificed anything!"],
  zugzwang: ["Gambit, shouting does not improve the move.", "As usual, Gambit is mathematically wrong."],
  blunder: ["The two grandpas are fighting again, I'm getting snacks.", "Catch season three of the Gambit vs Zugzwang drama, right here!"],
};

function hostOrder(primary: HostId): HostId[] {
  const others = (["gambit", "zugzwang", "blunder"] as HostId[]).filter((h) => h !== primary);
  return [primary, pick(others)];
}

/** Produce one or two commentary lines for a move. */
export function commentMove(c: MoveContext): Line[] {
  let bucket: keyof typeof T = "quiet";
  let hype = 8;
  if (c.mate) {
    bucket = "mate";
    hype = 100;
  } else if (c.forced) {
    bucket = "forced";
    hype = 55;
  } else if (c.swing < -180) {
    bucket = "blunder";
    hype = 70;
  } else if (c.promotion) {
    bucket = "promotion";
    hype = 65;
  } else if (c.captured && (c.captured === "q" || c.captured === "r")) {
    bucket = "bigCapture";
    hype = 50;
  } else if (c.check) {
    bucket = "check";
    hype = 35;
  } else if (c.castle) {
    bucket = "castle";
    hype = 12;
  } else if (c.captured) {
    bucket = c.captured === "n" || c.captured === "b" ? "bigCapture" : "capture";
    hype = c.captured === "p" ? 18 : 30;
  } else if (c.swing > 120) {
    bucket = "great";
    hype = 30;
  } else if (c.ply <= 1) {
    bucket = "opening";
    hype = 20;
  }

  const primary: HostId =
    bucket === "blunder" ? "blunder" : bucket === "quiet" ? pick(["gambit", "zugzwang", "blunder"] as HostId[]) : bucket === "great" ? "zugzwang" : "gambit";
  const order = hostOrder(primary);
  const lines: Line[] = [{ host: order[0], text: fill(pick(T[bucket][order[0]]), c), hype }];
  const twoHosts = c.spotlight || hype >= 30 || Math.random() < 0.25;
  if (twoHosts) lines.push({ host: order[1], text: fill(pick(T[bucket][order[1]]), c), hype: Math.round(hype * 0.6) });
  if (c.spotlight) {
    const third = (["gambit", "zugzwang", "blunder"] as HostId[]).find((h) => !order.includes(h))!;
    lines.push({ host: third, text: fill(pick(T[bucket][third]), c), hype: Math.round(hype * 0.5) });
  } else if (Math.random() < 0.08) {
    const h = pick(["gambit", "zugzwang", "blunder"] as HostId[]);
    lines.push({ host: h, text: pick(banter[h]), hype: 4 });
  }
  return lines;
}

export const CHAOS_LINES: Record<ChaosCardId, Record<HostId, string[]>> = {
  fog: {
    gambit: ["THE FOG ROLLS IN! {u} just threw Fog of War!"],
    zugzwang: ["Fog. Thank you, {u}. Now nobody can see anything, including me."],
    blunder: ["{u} turned the board into a sauna. Good luck, everyone!"],
  },
  random: {
    gambit: ["{u} TRIGGERS RANDOM MOVE! FATE IS IN CONTROL!"],
    zugzwang: ["A random move. {u}, do you understand what you have done?"],
    blunder: ["{u} just told the player: relax, let the universe decide."],
  },
  swap: {
    gambit: ["PIECE SWAP! Knight and bishop trade places! {u} IS INSANE!"],
    zugzwang: ["Knight and bishop swapped. My entire analysis is now garbage. Thank you, {u}."],
    blunder: ["{u} shuffled the board like a deck of cards. The player froze!"],
  },
  freeze: {
    gambit: ["TIME FREEZE! {u} STEALS 15 SECONDS! THE CLOCK IS SCREAMING!"],
    zugzwang: ["Minus fifteen seconds. Time pressure raises blunder odds by 34 percent."],
    blunder: ["{u} took 15 seconds like it's the last slice of pizza!"],
  },
  spotlight: {
    gambit: ["SPOTLIGHT ON! Every host is locked on the next move!"],
    zugzwang: ["Spotlight. I am now obligated to concentrate. Reluctantly."],
    blunder: ["{u} turned the lights on — whoever blunders now goes viral!"],
  },
  earthquake: {
    gambit: ["EARTHQUAKE!!! THE BOARD IS SHAKING! {u} IS A LEGEND!"],
    zugzwang: ["A pawn has just been advanced by… geology. I resign."],
    blunder: ["{u} kicked the table, everyone! Magnitude nine!"],
  },
};

export function commentChaos(card: ChaosCardId, user: string): Line[] {
  const hosts = (["gambit", "zugzwang", "blunder"] as HostId[]).sort(() => Math.random() - 0.5).slice(0, 2);
  return hosts.map((h, i) => ({
    host: h,
    text: pick(CHAOS_LINES[card][h]).replaceAll("{u}", user),
    hype: i === 0 ? 45 : 20,
  }));
}

export function commentTip(user: string, amount: number, target: string, request?: string): Line[] {
  const req = request?.trim();
  return [
    {
      host: "blunder",
      text: req
        ? `Thanks for the ${amount} coins, ${user}! By request: “${req}” — you hear that, ${target}?!`
        : pick([
            `${user} tipped ${amount} coins for a roast: ${target}, you play like it's tic-tac-toe!`,
            `${amount} coins from ${user}! ${target}, your moves just made Stockfish ask for a day off!`,
            `Tip of ${amount}! ${target}, even the clock looks tired watching you think!`,
          ]),
      hype: Math.min(60, 10 + amount / 10),
    },
  ];
}

export function speak(text: string, host: HostId, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find((v) => v.lang?.toLowerCase().startsWith("en-us")) ?? voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
    if (en) u.voice = en;
    u.lang = en?.lang ?? "en-US";
    u.pitch = HOSTS[host].voice.pitch;
    u.rate = HOSTS[host].voice.rate;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
