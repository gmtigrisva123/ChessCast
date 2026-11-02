"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { morphSignal } from "../gl/particle-morph";
import { Scramble } from "../ui/scramble";

const ParticleMorph = dynamic(() => import("../gl/particle-morph"), { ssr: false, loading: () => <div className="absolute inset-0 bg-void" /> });

const STAGES = [
  {
    k: "01 — The game",
    title: ["Six hundred million", "people play chess."],
    accent: 1,
    body: "More players than any sports league on Earth. Every single one of their games is a story.",
  },
  {
    k: "02 — The gap",
    title: ["Almost nobody", "watches."],
    accent: 1,
    body: "Outside a handful of grandmasters, games vanish without a single spectator. No stage. No story. No audience.",
  },
  {
    k: "03 — The show",
    title: ["So we built", "the stage."],
    accent: 1,
    body: "AI hosts, audience chaos and instant clips turn any anonymous game into something worth watching.",
  },
];

/** Scroll progress → morph time with plateaus so each shape holds while its line is read. */
function toMorph(p: number) {
  const ease = (x: number) => x * x * (3 - 2 * x);
  if (p < 0.12) return ease(p / 0.12);
  if (p < 0.32) return 1;
  if (p < 0.46) return 1 + ease((p - 0.32) / 0.14);
  if (p < 0.64) return 2;
  if (p < 0.78) return 2 + ease((p - 0.64) / 0.14);
  return 3;
}

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const t = toMorph(v);
    morphSignal.t = t;
    setStage(t < 1.5 ? 0 : t < 2.5 ? 1 : 2);
  });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "120px" });
    if (ref.current) io.observe(ref.current);
    const on = (e: PointerEvent) => {
      morphSignal.mx = (e.clientX / window.innerWidth) * 2 - 1;
      morphSignal.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", on);
    };
  }, []);
  const s = STAGES[stage];

  return (
    <section ref={ref} className="relative h-[460vh]" aria-label="Why ChessCast exists">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <ParticleMorph active={active} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-void/60 md:bg-gradient-to-r md:from-void/90 md:via-void/10 md:to-transparent" />

        <div className="shell relative flex h-full flex-col justify-end pb-16 md:justify-center md:pb-0">
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Scramble text={s.k.toUpperCase()} className="kicker text-violet" />
                <h2 className="display mt-5 text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.95]">
                  {s.title.map((line, i) =>
                    i === s.accent ? (
                      <span key={i} className="serif-accent text-aurora block pr-2 text-[1.08em]">
                        {line}
                      </span>
                    ) : (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ),
                  )}
                </h2>
                <p className="mt-6 max-w-md text-[17px] leading-relaxed text-fg-2">{s.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex lg:right-12">
          {STAGES.map((st, i) => (
            <div key={st.k} className="flex items-center gap-3">
              <span className={`font-mono text-[11px] transition-colors duration-500 ${i === stage ? "text-fg" : "text-fg-3"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className={`h-px transition-all duration-700 ${i === stage ? "w-16 bg-[linear-gradient(90deg,#8b7cff,#3ee6e0)]" : "w-6 bg-white/20"}`} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
          <motion.div className="h-full bg-[linear-gradient(90deg,#8b7cff,#3ee6e0)]" style={{ width: bar }} />
        </div>
      </div>
    </section>
  );
}
