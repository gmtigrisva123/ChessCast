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
      const p = Math.min(1, (t - start) / 1400);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setShow(false), 200);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center bg-void"
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-iris/30 blur-[100px]" />
          <div className="relative flex flex-col items-center">
            <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <LogoMark className="h-16 w-16" />
            </motion.div>
            <div className="mt-8 h-px w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[linear-gradient(90deg,#8b7cff,#3ee6e0)]" style={{ width: `${n}%` }} />
            </div>
            <div className="mt-3 font-mono text-[11px] tabular-nums tracking-widest text-fg-3">{String(n).padStart(3, "0")} · ĐANG DỰNG SÂN KHẤU</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
