"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { LogoMark } from "../ui/logo";

/** Màn chào ngắn ở lần tải đầu tiên trong phiên. */
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
      const p = Math.min(1, (t - start) / 1300);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setShow(false), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-between bg-lime p-6 text-ink md:p-10"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <LogoMark className="h-20 w-20 [&>rect]:fill-ink [&>path:first-of-type]:fill-lime" />
            </motion.div>
          </div>
          <div className="font-display text-xl font-bold uppercase tracking-tight">ChessCast · Unhinged Edition</div>
          <div className="font-display text-[22vw] font-bold leading-[0.8] tabular-nums md:text-[14vw]">{n}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
