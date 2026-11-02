"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Gavel, Scale, ShieldQuestion, Users, Video } from "lucide-react";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatNum } from "@/lib/utils";
import type { HostId } from "@/lib/hosts";
import { HOSTS } from "@/lib/hosts";
import { PageHero } from "../ui/page-hero";
import { MiniBoard } from "../ui/mini-board";
import { HostOrb } from "../ui/orb";
import { Button } from "../ui/button";
import { Reveal, Words } from "../ui/reveal";
import { Kicker } from "../ui/section";
import { Spotlight } from "../ui/spotlight";

type Case = {
  id: string;
  no: string;
  title: string;
  accused: string;
  plaintiff: string;
  charge: string;
  prosecution: string;
  defense: string;
  fen: string;
  highlight: string[];
  penalty: string;
  base: { guilty: number; innocent: number };
};

const CASES: Case[] = [
  {
    id: "c427",
    no: "0427",
    title: "Stalling a won position on purpose",
    accused: "knightmare.exe",
    plaintiff: "QueenSlayer",
    charge: "A full queen up, refused to mate and shuffled for 40 moves waiting for the opponent to flag.",
    prosecution: "Members of the jury, the accused stood at +18 and chose to torment his opponent for forty moves. This is not chess — this is calculated psychological warfare.",
    defense: "My client was simply… savoring the art. No rule forbids slow play. The clock is part of chess!",
    fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 61",
    highlight: ["f7", "g7"],
    penalty: "Play the next game without a queen, live on stream.",
    base: { guilty: 1284, innocent: 611 },
  },
  {
    id: "c431",
    no: "0431",
    title: "Celebrating an opponent's blunder",
    accused: "pawnstorm_23",
    plaintiff: "BishopBandit",
    charge: "Typed “EZ” in chat the moment the opponent hung their queen.",
    prosecution: "Two letters. E. Z. Two letters that destroyed the sporting spirit of an entire community. I request the maximum sentence.",
    defense: "A typo. My client meant “EZ… to see why that was a brilliant game”, but the Wi-Fi ate the rest.",
    fen: "r1b1k2r/pppp1ppp/2n2n2/2b1p3/2B1P2q/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 6",
    highlight: ["h4", "f3"],
    penalty: "Display name changed to “I Am Sorry” for 24 hours.",
    base: { guilty: 902, innocent: 877 },
  },
  {
    id: "c436",
    no: "0436",
    title: "Suspected of being carried by Chaos Cards",
    accused: "EnPassantEm",
    plaintiff: "The community",
    charge: "Won three straight games because viewers threw Piece Swap right before the opponent delivered mate.",
    prosecution: "Three times. Three Piece Swaps. Three perfect moments. I do not believe in coincidence — I believe in statistics.",
    defense: "My client does not control the crowd. If the crowd loves my client, the only crime here is charisma.",
    fen: "r3k2r/ppp2ppp/2n5/3qp3/1b1P4/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 9",
    highlight: ["b4", "c3"],
    penalty: "One week without receiving any helpful Chaos Card.",
    base: { guilty: 455, innocent: 1310 },
  },
];

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 16);
    return () => clearInterval(t);
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] bg-fg" />}
    </>
  );
}

function Bubble({ host, role, children, side = "left" }: { host: HostId; role: string; children: React.ReactNode; side?: "left" | "right" }) {
  return (
    <div className={cn("flex gap-3", side === "right" && "flex-row-reverse text-right")}>
      <HostOrb id={host} size={38} talking={side === "left"} className="mt-1" />
      <div className={cn("max-w-[85%] rounded-3xl border border-white/[0.07] bg-white/[0.03] px-4 py-3", side === "left" ? "rounded-tl-md" : "rounded-tr-md")}>
        <div className="text-[12px] font-medium" style={{ color: HOSTS[host].color }}>
          {HOSTS[host].name} <span className="font-normal text-fg-3">· {role}</span>
        </div>
        <div className="mt-1 text-[14.5px] leading-relaxed text-fg">{children}</div>
      </div>
    </div>
  );
}

function Verdict({ pct }: { pct: number }) {
  const angle = -90 + (pct / 100) * 180;
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <svg viewBox="0 0 200 112" className="w-full">
        <defs>
          <linearGradient id="v-g" x1="0" x2="1">
            <stop offset="0" stopColor="#3ee6e0" />
            <stop offset="0.5" stopColor="#8b7cff" />
            <stop offset="1" stopColor="#ff6b9a" />
          </linearGradient>
        </defs>
        <path d="M14 102 A86 86 0 0 1 186 102" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" strokeLinecap="round" />
        <motion.path d="M14 102 A86 86 0 0 1 186 102" fill="none" stroke="url(#v-g)" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
        <motion.g animate={{ rotate: angle }} transition={{ type: "spring", stiffness: 50, damping: 10 }} style={{ originX: 0.5, originY: 1 }}>
          <line x1="100" y1="102" x2="100" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="102" r="7" fill="#fff" />
      </svg>
      <div className="-mt-2 flex justify-between font-mono text-[11.5px]">
        <span className="text-teal">Innocent {100 - pct}%</span>
        <span className="text-rose">Guilty {pct}%</span>
      </div>
    </div>
  );
}

function CaseRoom({ c }: { c: Case }) {
  const votes = useWallet((s) => s.courtVotes);
  const vote = useWallet((s) => s.vote);
  const credit = useWallet((s) => s.credit);
  const toast = useUI((s) => s.toast);
  const mounted = useMounted();
  const mine = mounted ? votes[c.id] : undefined;
  const [tally, setTally] = useState(c.base);
  useEffect(() => {
    setTally(c.base);
    const share = c.base.guilty / (c.base.guilty + c.base.innocent);
    const t = setInterval(() => setTally((v) => ({ guilty: v.guilty + Math.round(Math.random() * 12 * share), innocent: v.innocent + Math.round(Math.random() * 12 * (1 - share)) })), 1200);
    return () => clearInterval(t);
  }, [c]);
  const g = tally.guilty + (mine === "guilty" ? 1 : 0);
  const i = tally.innocent + (mine === "innocent" ? 1 : 0);
  const pct = Math.round((g / (g + i)) * 100);
  const guilty = pct >= 50;
  const cast = (v: "guilty" | "innocent") => {
    vote(c.id, v);
    credit(5);
    toast({ title: v === "guilty" ? "You voted: Guilty" : "You voted: Innocent", body: "+5 coins for jury duty.", tone: v === "guilty" ? "pink" : "cyan" });
  };

  return (
    <motion.div key={c.id} initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0, y: -10, filter: "blur(8px)" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Spotlight className="p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-3">
          <span className="rounded-full border border-white/10 px-2.5 py-1">Case #{c.no}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">Accused: {c.accused}</span>
          <span className="rounded-full border border-white/10 px-2.5 py-1">Plaintiff: {c.plaintiff}</span>
        </div>
        <h3 className="display mt-5 text-3xl">{c.title}</h3>
        <p className="mt-2 text-[15px] text-fg-2">{c.charge}</p>
        <div className="mt-7 space-y-4">
          <Bubble host="zugzwang" role="AI prosecutor">
            <Typewriter text={c.prosecution} />
          </Bubble>
          <Bubble host="blunder" role="Defense attorney (reluctantly)" side="right">
            {c.defense}
          </Bubble>
        </div>
      </Spotlight>
      <div className="flex flex-col gap-4">
        <Spotlight className="p-5">
          <div className="kicker text-fg-3">Exhibit A</div>
          <MiniBoard fen={c.fen} highlight={c.highlight} className="mt-3" />
        </Spotlight>
        <Spotlight className="p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[14px] font-medium">
              <Users size={16} className="text-violet" /> Jury
            </span>
            <span className="font-mono text-[11px] text-fg-3">{formatNum(g + i)} votes</span>
          </div>
          <div className="mt-4">
            <Verdict pct={pct} />
          </div>
          {!mine ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="glass" onClick={() => cast("innocent")}>
                <Scale size={15} /> Innocent
              </Button>
              <Button variant="ember" onClick={() => cast("guilty")}>
                <Gavel size={15} /> Guilty
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="kicker text-fg-3">Provisional verdict · you voted {mine === "guilty" ? "guilty" : "innocent"}</div>
              <div className={cn("display mt-2 text-2xl", guilty ? "text-ember" : "text-aurora")}>{guilty ? "Guilty." : "Acquitted."}</div>
              <p className="mt-1 text-[13.5px] text-fg-2">{guilty ? `Sentence: ${c.penalty}` : "The accused walks free… until the next case."}</p>
            </motion.div>
          )}
        </Spotlight>
      </div>
    </motion.div>
  );
}

const STEPS = [
  { icon: ShieldQuestion, title: "Complaint", body: "A player or viewer files a complaint about controversial behavior." },
  { icon: Gavel, title: "AI prosecution", body: "Prof. Zugzwang builds the case from game data, chat logs and clips." },
  { icon: Users, title: "The jury", body: "Viewers vote for ten minutes. Chaos Lords get priority jury seats." },
  { icon: Video, title: "Sentencing", body: "Penalties are fun on-air challenges — never real money." },
];

export function CourtView() {
  const [active, setActive] = useState(CASES[0].id);
  const c = CASES.find((x) => x.id === active)!;
  return (
    <>
      <PageHero kicker="Chess Court" title="Controversial game? *Take it to court.*" tone="ember">
        An AI prosecutor accuses, an AI defender argues back, and the audience is the jury. Every vote you cast earns 5 coins.
      </PageHero>

      <section className="shell pb-16">
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="space-y-2">
            <div className="kicker mb-3 px-1 text-fg-3">In session</div>
            {CASES.map((x) => (
              <button key={x.id} onClick={() => setActive(x.id)} className={cn("relative w-full rounded-2xl p-4 text-left transition-colors", active !== x.id && "hover:bg-white/[0.03]")}>
                {active === x.id && <motion.span layoutId="case-pill" className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.05]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <div className="relative flex items-center justify-between font-mono text-[10.5px] text-fg-3">
                  <span>#{x.no}</span>
                  <span className="flex items-center gap-1 text-rose">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> live
                  </span>
                </div>
                <div className="relative mt-1.5 text-[14.5px] font-medium">{x.title}</div>
                <div className="relative mt-0.5 text-[12.5px] text-fg-3">Accused: {x.accused}</div>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <CaseRoom key={c.id} c={c} />
          </AnimatePresence>
        </div>
      </section>

      <section className="shell py-24">
        <Kicker tone="ember">The process</Kicker>
        <Words text="From complaint to *verdict* in ten minutes." className="display mt-5 max-w-2xl text-[clamp(2rem,4vw,3.2rem)]" accentClass="serif-accent text-ember" />
        <div className="relative mt-12 grid gap-3 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="relative">
                  <span className="relative grid h-[76px] w-[76px] place-items-center rounded-full border border-white/10 bg-night">
                    <Icon size={22} className="text-ember" />
                    <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-fg font-mono text-[10px] text-void">{i + 1}</span>
                  </span>
                  <div className="mt-5 font-display text-lg font-semibold tracking-tight">{s.title}</div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-fg-2">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
