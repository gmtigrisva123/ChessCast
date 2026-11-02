"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CloudFog, Heart, MessageCircle, Send } from "lucide-react";
import { storySignal } from "../scene-signals";
import { HOSTS, type Line } from "@/lib/hosts";
import { HostOrb, VoiceBars } from "../ui/orb";
import { Kicker } from "../ui/section";
import { cn } from "@/lib/utils";

const StoryScene = dynamic(() => import("../three/story-scene"), { ssr: false, loading: () => <div className="absolute inset-0 bg-void" /> });

const CHAPTERS = [
  {
    k: "01 · Listen",
    title: "Three voices, *one feud.*",
    body: "Captain Gambit screams at every sacrifice. Prof. Zugzwang scores each move without mercy. MC Blunder roasts everyone. Even the most anonymous game gets called like a world final.",
  },
  {
    k: "02 · Intervene",
    title: "One card *flips the whole game.*",
    body: "The audience throws Chaos Cards mid-match: fog over the board, swapped pieces, forced random moves. Players scramble, the hosts lose it, the chat explodes.",
  },
  {
    k: "03 · Spread",
    title: "The best moments *clip themselves.*",
    body: "The AI spots the peak, cuts a captioned vertical video and ships it to TikTok and Reels. Every clip pulls new viewers back to the stage.",
  },
];

function Title({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="serif-accent text-aurora">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function Story() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [ch, setCh] = useState(0);
  const [line, setLine] = useState<Line | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    storySignal.progress = v;
    setCh(v < 0.33 ? 0 : v < 0.66 ? 1 : 2);
  });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative h-[420vh]" aria-label="How the show works">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <StoryScene active={active} onLine={setLine} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/20 to-void/60 md:bg-gradient-to-r md:from-void md:via-void/40 md:to-transparent" />

        <div className="shell relative flex h-full flex-col justify-end pb-14 md:justify-center md:pb-0">
          <div className="max-w-md">
            <Kicker>How the show works</Kicker>
            <div className="mt-6 flex gap-2">
              {CHAPTERS.map((c, i) => (
                <div key={c.k} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full bg-[linear-gradient(90deg,#8b7cff,#3ee6e0)]" animate={{ width: i < ch ? "100%" : i === ch ? "55%" : "0%" }} transition={{ duration: 0.6 }} />
                </div>
              ))}
            </div>
            <div className="relative mt-8 min-h-[290px] md:min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={ch}
                  initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                  exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="kicker text-violet">{CHAPTERS[ch].k}</div>
                  <h2 className="display mt-4 text-[clamp(2.2rem,4.4vw,3.6rem)]">
                    <Title text={CHAPTERS[ch].title} />
                  </h2>
                  <p className="mt-5 text-[16px] leading-relaxed text-fg-2">{CHAPTERS[ch].body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Chapter overlays */}
        <AnimatePresence>
          {ch === 0 && line && (
            <motion.div
              key="talk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="pointer-events-none absolute bottom-10 right-6 hidden w-[340px] md:block lg:right-14"
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={line.text}
                  initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                  exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 28, filter: { type: "tween", duration: 0.45, ease: "easeOut" } }}
                  className="glass-strong rounded-3xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <HostOrb id={line.host} size={34} talking />
                    <div className="flex-1 text-[13px] font-medium">{HOSTS[line.host].name}</div>
                    <VoiceBars color={HOSTS[line.host].color} />
                  </div>
                  <p className="mt-2.5 text-[14px] leading-snug text-fg-2">“{line.text}”</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
          {ch === 1 && (
            <motion.div
              key="chaos"
              initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              exit={{ opacity: 0, x: 20 }}
              className="pointer-events-none absolute right-6 top-28 hidden md:block lg:right-14"
            >
              <div className="glass-strong flex w-[300px] items-center gap-3 rounded-3xl p-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#4d8dff,#3ee6e0)] text-void">
                  <CloudFog size={22} />
                </span>
                <div className="flex-1">
                  <div className="text-[14px] font-medium">Fog of War</div>
                  <div className="font-mono text-[11px] text-fg-3">thrown by you · 6 moves</div>
                </div>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-rose">−50</span>
              </div>
            </motion.div>
          )}
          {ch === 2 && (
            <motion.div
              key="clip"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center md:flex"
            >
              <div className="relative aspect-[9/16] h-[72vh] max-h-[640px] rounded-[34px] border-2 border-white/70 bg-void/20 shadow-[0_40px_120px_-20px_rgba(139,124,255,0.6)] backdrop-blur-[1px]">
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> REC 0:15
                  </span>
                  <span className="rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] backdrop-blur">9:16 · auto</span>
                </div>
                <div className="absolute bottom-24 left-4 right-14">
                  <div className="text-[13px] font-semibold">@chesscast</div>
                  <p className="mt-1 text-[13px] leading-snug">Mate with the rook after sacrificing the queen 😱 #chess #chesscast</p>
                  <span className="mt-2 inline-block rounded-lg bg-white px-2 py-1 text-[13px] font-semibold text-void">“CHECKMATE! I CAN'T BREATHE!”</span>
                </div>
                <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4">
                  {[Heart, MessageCircle, Send].map((I, i) => (
                    <span key={i} className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur">
                      <I size={17} />
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <motion.div className={cn("h-full bg-[linear-gradient(90deg,#8b7cff,#3ee6e0)]")} style={{ width: bar }} />
        </div>
      </div>
    </section>
  );
}
