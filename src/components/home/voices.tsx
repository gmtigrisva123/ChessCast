"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { HOST_LIST, HOSTS, speak, type HostId } from "@/lib/hosts";
import { HostOrb, VoiceBars } from "../ui/orb";
import { Kicker } from "../ui/section";
import { Words } from "../ui/reveal";
import { LiquidGlass } from "../ui/liquid-glass";
import { cn } from "@/lib/utils";

const VoiceOrb = dynamic(() => import("../gl/voice-orb"), { ssr: false, loading: () => <div className="h-full w-full" /> });

const SAMPLES: Record<HostId, string[]> = {
  gambit: ["ROOK SACRIFICE! QUEEN SACRIFICE! THIS IS CHESS!", "Audience, throw a Chaos Card, I can't take it anymore!", "Zugzwang, did you see that? That's called PASSION!"],
  zugzwang: ["This move drops the evaluation by 2.4 pawns. I am not surprised.", "Gambit, shouting does not make the move more accurate.", "Castling. The first sensible decision in fourteen moves."],
  blunder: ["This player is out here playing tic-tac-toe on a chessboard!", "Tip me 50 coins and I'll roast anyone. Anyone.", "The king is running like it owes somebody money!"],
};

function Typing({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 22);
    return () => clearInterval(t);
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] animate-pulse-soft bg-fg" />
    </>
  );
}

export function Voices() {
  const [id, setId] = useState<HostId>("gambit");
  const [k, setK] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const host = HOSTS[id];
  useEffect(() => {
    const t = setInterval(() => setK((v) => v + 1), 4200);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (ref.current) io.observe(ref.current);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
  }, []);
  const line = SAMPLES[id][k % SAMPLES[id].length];
  return (
    <section ref={ref} className="relative py-24 md:py-36" aria-labelledby="voices-title">
      <div className="shell grid items-center gap-14 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Kicker>The AI hosts</Kicker>
          <Words id="voices-title" text="Three personalities. *Three voices.* One feud now in season three." className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" />
          <div className="mt-10 space-y-2" role="tablist" aria-label="Choose a host">
            {HOST_LIST.map((h) => (
              <button
                key={h.id}
                role="tab"
                aria-selected={id === h.id}
                onClick={() => {
                  setId(h.id);
                  setK(0);
                }}
                className={cn("relative flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors", id === h.id ? "" : "hover:bg-white/[0.03]")}
              >
                {id === h.id && <motion.span layoutId="voice-tab" className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.06]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <HostOrb id={h.id} size={40} talking={id === h.id} className="relative" />
                <div className="relative flex-1">
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-[13px] text-fg-3">{h.role}</div>
                </div>
                <span className="relative font-mono text-[11px] text-fg-3">{h.handle}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <div className="absolute inset-[14%] rounded-full blur-[70px]" style={{ background: `radial-gradient(circle, ${host.orb[1]}66, transparent 65%)` }} />
            <div className="absolute inset-[6%] rounded-full border border-white/[0.06]" />
            <div className="absolute inset-[20%] rounded-full border border-dashed border-white/[0.07]" />
            <div className="absolute inset-[8%]">
              <VoiceOrb colors={host.orb} talking={speaking || k % 2 === 0} active={active} />
            </div>
          </div>
          {/* caption sits below the orb (overlapping only the outer ring) so the text never fights the bright core */}
          <div className="relative z-10 mx-auto -mt-20 w-[min(440px,94%)]">
            <LiquidGlass className="liquid-dark rounded-[28px] p-5" radius={28} bezel={14} depth={12}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold" style={{ color: host.color }}>
                  {host.name}
                </span>
                <VoiceBars color={host.color} />
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={id + k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 min-h-[48px] text-[15px] leading-snug text-fg">
                  <Typing text={line} />
                </motion.p>
              </AnimatePresence>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                <p className="text-[12.5px] leading-snug text-fg-2">{host.bio}</p>
                <button
                  onClick={() => {
                    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                    speak(line, id, true);
                    setSpeaking(true);
                    setTimeout(() => setSpeaking(false), 2600);
                  }}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-fg px-4 text-[13px] font-semibold text-void"
                >
                  <Volume2 size={15} className={speaking ? "animate-pulse" : ""} /> Listen
                </button>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </div>
    </section>
  );
}
