import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";

export type TrackedPiece = { id: string; type: PieceSymbol; color: Color; square: Square };
export type PieceMap = Record<string, TrackedPiece>;

let counter = 0;
const nextId = (color: Color, type: PieceSymbol) => `${color}${type}${++counter}`;

export function piecesFromFen(fen: string): PieceMap {
  const chess = new Chess(fen);
  const out: PieceMap = {};
  for (const row of chess.board())
    for (const sq of row) {
      if (!sq) continue;
      const id = nextId(sq.color, sq.type);
      out[id] = { id, type: sq.type, color: sq.color, square: sq.square };
    }
  return out;
}

export function idAt(pieces: PieceMap, sq: Square) {
  for (const id in pieces) if (pieces[id].square === sq) return id;
  return undefined;
}

/** Apply a move to the piece map (keeps ids stable so animations stay smooth). */
export function applyMove(pieces: PieceMap, move: Move): { pieces: PieceMap; captured?: TrackedPiece } {
  const next: PieceMap = { ...pieces };
  let captured: TrackedPiece | undefined;
  const capSq: Square = move.isEnPassant()
    ? (`${move.to[0]}${move.from[1]}` as Square)
    : move.to;
  if (move.captured) {
    const cid = idAt(next, capSq);
    if (cid) {
      captured = next[cid];
      delete next[cid];
    }
  }
  const mid = idAt(next, move.from);
  if (mid) next[mid] = { ...next[mid], square: move.to, type: move.promotion ?? next[mid].type };
  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    const rank = move.from[1];
    const [rf, rt] = move.isKingsideCastle() ? ["h", "f"] : ["a", "d"];
    const rid = idAt(next, `${rf}${rank}` as Square);
    if (rid) next[rid] = { ...next[rid], square: `${rt}${rank}` as Square };
  }
  return { pieces: next, captured };
}

export function swapSquares(pieces: PieceMap, a: Square, b: Square): PieceMap {
  const next: PieceMap = { ...pieces };
  const ia = idAt(next, a);
  const ib = idAt(next, b);
  if (ia) next[ia] = { ...next[ia], square: b };
  if (ib) next[ib] = { ...next[ib], square: a };
  return next;
}

export function relocate(pieces: PieceMap, from: Square, to: Square): PieceMap {
  const next: PieceMap = { ...pieces };
  const id = idAt(next, from);
  if (id) next[id] = { ...next[id], square: to };
  return next;
}
