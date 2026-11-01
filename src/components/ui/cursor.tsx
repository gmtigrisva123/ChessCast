"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { LiquidGlass, liquidSupported } from "./liquid-glass";

/** Cursor: a liquid-glass lens that refracts whatever is underneath (Chromium), plus a precise dot. */
export function Cursor() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 340, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 340, damping: 30, mass: 0.5 });
  const [on, setOn] = useState(false);
  const [lens, setLens] = useState(false);
  const [mode, setMode] = useState<"idle" | "hover" | "text">("idle");
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setOn(true);
    setLens(liquidSupported());
    document.documentElement.classList.add("has-custom-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("input, textarea")) setMode("text");
      else if (t?.closest?.("a, button, [role=button], [role=tab], label, select")) setMode("hover");
      else setMode("idle");
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [x, y]);

  if (!on) return null;
  const size = mode === "hover" ? 74 : mode === "text" ? 4 : 44;
  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100]" style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}>
        <motion.div
          animate={{ width: size, height: mode === "text" ? 28 : size, scale: down ? 0.82 : 1, borderRadius: mode === "text" ? 3 : 999 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="overflow-hidden"
        >
          {lens && mode !== "text" ? (
            <LiquidGlass className="h-full w-full rounded-full" radius={999} bezel={16} depth={22} blur={0.4} dispersion={0.14} />
          ) : (
            <div className="h-full w-full rounded-[inherit] border border-white/50 bg-white/[0.04] backdrop-blur-[2px]" />
          )}
        </motion.div>
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_4px_rgba(139,124,255,0.75)]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: mode === "idle" ? 1 : 0 }}
      />
    </>
  );
}
