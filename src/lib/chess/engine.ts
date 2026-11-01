import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";

/** Giá trị quân (centipawn). */
export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

// Bảng vị trí (góc nhìn quân Trắng, hàng 8 → hàng 1).
const PST: Record<PieceSymbol, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0,
    0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15,
    20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10,
    5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
    -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0,
    0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0,
    -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
    -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20,
    -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

/** Điểm thế cờ theo góc nhìn quân Trắng (centipawn). */
export function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate()) return 0;
  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const idx = sq.color === "w" ? r * 8 + f : (7 - r) * 8 + f;
      const v = PIECE_VALUE[sq.type] + PST[sq.type][idx];
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

export function material(chess: Chess) {
  let w = 0;
  let b = 0;
  for (const row of chess.board())
    for (const sq of row) {
      if (!sq) continue;
      if (sq.color === "w") w += PIECE_VALUE[sq.type];
      else b += PIECE_VALUE[sq.type];
    }
  return { w, b };
}

function orderMoves(moves: Move[]) {
  return moves.sort((a, b) => {
    const av = (a.captured ? PIECE_VALUE[a.captured] * 10 - PIECE_VALUE[a.piece] : 0) + (a.promotion ? 800 : 0);
    const bv = (b.captured ? PIECE_VALUE[b.captured] * 10 - PIECE_VALUE[b.piece] : 0) + (b.promotion ? 800 : 0);
    return bv - av;
  });
}

function negamax(chess: Chess, depth: number, alpha: number, beta: number, color: 1 | -1): number {
  if (depth === 0 || chess.isGameOver()) return color * evaluate(chess);
  let best = -Infinity;
  const moves = orderMoves(chess.moves({ verbose: true }));
  for (const m of moves) {
    chess.move(m);
    const v = -negamax(chess, depth - 1, -beta, -alpha, (-color) as 1 | -1);
    chess.undo();
    if (v > best) best = v;
    if (v > alpha) alpha = v;
    if (alpha >= beta) break;
  }
  return best;
}

export type BotStyle = {
  depth: 1 | 2 | 3;
  /** 0..1 — xác suất chọn nước “ngẫu hứng” thay vì nước tốt nhất. */
  chaos: number;
  /** Biên độ chấp nhận (centipawn) khi chọn ngẫu nhiên giữa các nước gần tốt nhất. */
  slack: number;
};

export const DEFAULT_STYLE: BotStyle = { depth: 2, chaos: 0.08, slack: 35 };

/** Chọn nước đi cho bên đang tới lượt. */
export function pickMove(fen: string, style: BotStyle = DEFAULT_STYLE): Move | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  if (!moves.length) return null;
  if (Math.random() < style.chaos) return moves[Math.floor(Math.random() * moves.length)];
  const color: 1 | -1 = chess.turn() === "w" ? 1 : -1;
  const scored: { m: Move; v: number }[] = [];
  for (const m of orderMoves(moves)) {
    chess.move(m);
    const v = -negamax(chess, style.depth - 1, -Infinity, Infinity, (-color) as 1 | -1);
    chess.undo();
    scored.push({ m, v: v + Math.random() * 6 });
  }
  scored.sort((a, b) => b.v - a.v);
  const top = scored[0].v;
  const pool = scored.filter((s) => s.v >= top - style.slack);
  return pool[Math.floor(Math.random() * pool.length)].m;
}

export function randomMove(fen: string): Move | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  return moves.length ? moves[Math.floor(Math.random() * moves.length)] : null;
}

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function squareToXZ(sq: Square): [number, number] {
  const f = sq.charCodeAt(0) - 97;
  const r = Number(sq[1]) - 1;
  return [f - 3.5, 3.5 - r];
}

export function xzToSquare(x: number, z: number): Square | null {
  const f = Math.round(x + 3.5);
  const r = Math.round(3.5 - z);
  if (f < 0 || f > 7 || r < 0 || r > 7) return null;
  return `${FILES[f]}${r + 1}` as Square;
}
