"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { LogoMark } from "../ui/logo";

/** First-visit intro: an 8×8 board lights up square by square while the stage loads. */
export function Preloader() {
  const [show, setShow] = useState(true);
  const [n, setN] = useState(0);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("cc-intro") === "1";
      sessionStorage.setItem("cc-intro", "1");
    } catch {}
    if (seen) {
      setShow(false);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1600);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setShow(false), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const lit = Math.round((n / 100) * 64);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center bg-void"
          exit={{ opacity: 0, filter: "blur(24px)", scale: 1.08 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-iris/25 blur-[110px]" />
          <div className="relative flex flex-col items-center">
            <div className="relative grid grid-cols-8 gap-[3px] [perspective:600px]">
              {Array.from({ length: 64 }, (_, i) => {
                const r = Math.floor(i / 8);
                const on = i < lit;
                return (
                  <motion.span
                    key={i}
                    className="h-4 w-4 rounded-[3px] sm:h-5 sm:w-5"
                    animate={{
                      rotateX: on ? 0 : 80,
                      opacity: on ? 1 : 0.08,
                      backgroundColor: on ? ((i + r) % 2 ? "#6d5cff" : "#3ee6e0") : "#ffffff",
                    }}
                    transition={{ duration: 0.4 }}
                  />
                );
              })}
              <motion.div className="absolute inset-0 grid place-items-center" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: n > 60 ? 1 : 0.4, opacity: n > 60 ? 1 : 0 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
                <LogoMark className="h-14 w-14 drop-shadow-[0_0_30px_rgba(139,124,255,0.9)]" />
              </motion.div>
            </div>
            <div className="mt-8 font-mono text-[11px] tabular-nums tracking-[0.3em] text-fg-3">{String(n).padStart(3, "0")} · SETTING THE STAGE</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
