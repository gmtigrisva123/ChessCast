import { Chess, type Color, type PieceSymbol, type Square } from "chess.js";
import { FILES } from "./engine";

type Grid = (string | null)[][]; // [rank 8..1][file a..h], FEN chars

function parse(fen: string) {
  const [board, turn, castling, , half, full] = fen.split(" ");
  const grid: Grid = board.split("/").map((row) => {
    const out: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
      else out.push(ch);
    }
    return out;
  });
  return { grid, turn: turn as Color, castling, half, full };
}

function build(p: ReturnType<typeof parse>) {
  const board = p.grid
    .map((row) => {
      let s = "";
      let e = 0;
      for (const c of row) {
        if (!c) e++;
        else {
          if (e) s += e;
          e = 0;
          s += c;
        }
      }
      if (e) s += e;
      return s;
    })
    .join("/");
  return `${board} ${p.turn} ${p.castling} - ${p.half} ${p.full}`;
}

const idx = (sq: Square) => ({ r: 8 - Number(sq[1]), f: sq.charCodeAt(0) - 97 });
const sqOf = (r: number, f: number) => `${FILES[f]}${8 - r}` as Square;

/** Vị trí có hợp lệ để bên `turn` đi tiếp không (vua đối phương không bị chiếu). */
function legalFor(fen: string): Chess | null {
  try {
    const c = new Chess(fen);
    const turn = c.turn();
    const opp: Color = turn === "w" ? "b" : "w";
    const k = c.findPiece({ type: "k", color: opp })[0];
    if (!k || c.isAttacked(k, turn)) return null;
    return c;
  } catch {
    return null;
  }
}

function shuffle<T>(a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Hoán đổi một Mã và một Tượng của bên đang đi. */
export function chaosSwap(fen: string): { fen: string; a: Square; b: Square } | null {
  const p = parse(fen);
  const turn = p.turn;
  const isMine = (c: string | null, t: PieceSymbol) => !!c && c.toLowerCase() === t && (turn === "w" ? c === c.toUpperCase() : c === c.toLowerCase());
  const knights: Square[] = [];
  const bishops: Square[] = [];
  p.grid.forEach((row, r) =>
    row.forEach((c, f) => {
      if (isMine(c, "n")) knights.push(sqOf(r, f));
      if (isMine(c, "b")) bishops.push(sqOf(r, f));
    }),
  );
  let pairs: [Square, Square][] = [];
  for (const n of knights) for (const b of bishops) pairs.push([n, b]);
  if (!pairs.length) {
    // không có cặp Mã/Tượng → đổi bất kỳ hai quân nhẹ/ xe khác loại
    const others: Square[] = [];
    p.grid.forEach((row, r) =>
      row.forEach((c, f) => {
        if (c && !["k", "p"].includes(c.toLowerCase()) && (turn === "w" ? c === c.toUpperCase() : c === c.toLowerCase())) others.push(sqOf(r, f));
      }),
    );
    for (let i = 0; i < others.length; i++) for (let j = i + 1; j < others.length; j++) pairs.push([others[i], others[j]]);
  }
  pairs = shuffle(pairs);
  for (const [a, b] of pairs) {
    const q = parse(fen);
    const A = idx(a);
    const B = idx(b);
    const tmp = q.grid[A.r][A.f];
    q.grid[A.r][A.f] = q.grid[B.r][B.f];
    q.grid[B.r][B.f] = tmp;
    if (q.grid[A.r][A.f] === q.grid[B.r][B.f]) continue;
    const nf = build(q);
    if (legalFor(nf)) return { fen: nf, a, b };
  }
  return null;
}

/** Động đất: đẩy một tốt của bên đang đi lên một ô (nếu trống). */
export function chaosQuake(fen: string): { fen: string; from: Square; to: Square } | null {
  const p = parse(fen);
  const turn = p.turn;
  const pawn = turn === "w" ? "P" : "p";
  const dir = turn === "w" ? -1 : 1; // hàng trong grid
  const cands: { from: Square; to: Square; r: number; f: number }[] = [];
  p.grid.forEach((row, r) =>
    row.forEach((c, f) => {
      if (c !== pawn) return;
      const nr = r + dir;
      if (nr <= 0 || nr >= 7) return; // không phong cấp bằng động đất
      if (p.grid[nr][f]) return;
      cands.push({ from: sqOf(r, f), to: sqOf(nr, f), r, f });
    }),
  );
  for (const c of shuffle(cands)) {
    const q = parse(fen);
    q.grid[c.r + dir][c.f] = pawn;
    q.grid[c.r][c.f] = null;
    const nf = build(q);
    const chess = legalFor(nf);
    if (chess && chess.moves().length > 0) return { fen: nf, from: c.from, to: c.to };
  }
  return null;
}

export function fogRows(): Square[] {
  const start = Math.random() < 0.5 ? 3 : 4;
  const out: Square[] = [];
  for (let r = start; r < start + 3; r++) for (const f of FILES) out.push(`${f}${r}` as Square);
  return out;
}
