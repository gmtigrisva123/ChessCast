"use client";

import Link from "next/link";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { ArrowUpRight, Eye } from "lucide-react";
import { randomMove } from "@/lib/chess/engine";
import type { HostId } from "@/lib/hosts";
import { MiniBoard } from "../ui/mini-board";
import { HostOrb } from "../ui/orb";
import { Kicker } from "../ui/section";
import { Words } from "../ui/reveal";

const MATCHES: { id: string; w: string; b: string; tag: string; host: HostId; viewers: string; opening: string[] }[] = [
  { id: "a", w: "knightmare.exe", b: "en_passant_enjoyer", tag: "Chaos on", host: "gambit", viewers: "12.4K", opening: ["e4", "c5", "Nf3", "d6"] },
  { id: "b", w: "Zwischenzug_", b: "LostKing404", tag: "Royale · round 3", host: "zugzwang", viewers: "8.1K", opening: ["d4", "Nf6", "c4", "e6"] },
  { id: "c", w: "BishopBandit", b: "blitz_bae", tag: "Blitz 3+0", host: "blunder", viewers: "5.6K", opening: ["e4", "e5", "Bc4", "Nc6"] },
  { id: "d", w: "SacTheQueen", b: "CastleEarly", tag: "On trial in Court", host: "zugzwang", viewers: "3.9K", opening: ["c4", "e5", "Nc3", "Nf6"] },
  { id: "e", w: "rook_n_roll", b: "tiny_pawn", tag: "Chaos on", host: "gambit", viewers: "2.7K", opening: ["e4", "e6", "d4", "d5"] },
  { id: "f", w: "QueenSlayer", b: "pawnstorm_23", tag: "Rematch", host: "blunder", viewers: "2.2K", opening: ["Nf3", "d5", "g3", "c6"] },
];

function LiveBoard({ opening, seed }: { opening: string[]; seed: number }) {
  const [fen, setFen] = useState(() => {
    const c = new Chess();
    opening.forEach((m) => c.move(m));
    return c.fen();
  });
  const [last, setLast] = useState<string[]>([]);
  useEffect(() => {
    let c = new Chess(fen);
    const t = setInterval(() => {
      if (c.isGameOver() || c.history().length > 60) {
        c = new Chess();
        opening.forEach((m) => c.move(m));
      }
      const m = randomMove(c.fen());
      if (m) {
        c.move(m);
        setLast([m.from, m.to]);
      }
      setFen(c.fen());
    }, 2200 + seed * 230);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <MiniBoard fen={fen} highlight={last} />;
}

function MatchCard({ m, i }: { m: (typeof MATCHES)[number]; i: number }) {
  return (
    <Link href="/live" className="group relative block w-[280px] shrink-0 rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:border-white/20">
      <div className="relative overflow-hidden rounded-[18px]">
        <LiveBoard opening={m.opening} seed={i} />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] text-fg backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> LIVE
        </div>
        <div className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] text-fg-2 backdrop-blur">{m.tag}</div>
      </div>
      <div className="flex items-center gap-3 px-1.5 pb-1 pt-3">
        <HostOrb id={m.host} size={26} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-medium">
            {m.w} <span className="text-fg-3">vs</span> {m.b}
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-fg-3">
            <Eye size={11} /> {m.viewers}
          </div>
        </div>
        <ArrowUpRight size={16} className="text-fg-3 transition-all duration-500 group-hover:rotate-45 group-hover:text-fg" />
      </div>
    </Link>
  );
}

export function LiveRail() {
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="live-title">
      <div className="shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Kicker tone="ember">Live now</Kicker>
          <Words id="live-title" text="There is always *something happening* on stage." className="display mt-5 max-w-2xl text-[clamp(2.2rem,4.6vw,3.8rem)]" />
        </div>
        <Link href="/live" className="group flex items-center gap-2 text-[14px] text-fg-2 hover:text-fg">
          Open the Arena <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mask-fade-x group/rail relative mt-12 overflow-hidden">
        <div className="flex w-max animate-marquee gap-4 [--marquee-duration:70s] group-hover/rail:[animation-play-state:paused]">
          {[...MATCHES, ...MATCHES].map((m, i) => (
            <MatchCard key={i} m={m} i={i % MATCHES.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
