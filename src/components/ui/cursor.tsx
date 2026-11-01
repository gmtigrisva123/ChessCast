"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/** Con trỏ: chấm sáng + quầng kính đi theo, phình ra khi trỏ vào phần tử tương tác. */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 300, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 28, mass: 0.5 });
  const [on, setOn] = useState(false);
  const [mode, setMode] = useState<"idle" | "hover" | "text">("idle");
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setOn(true);
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
  const size = mode === "hover" ? 46 : mode === "text" ? 4 : 28;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-white/40 bg-white/[0.04] backdrop-blur-[2px]"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: size,
          height: mode === "text" ? 26 : size,
          borderRadius: mode === "text" ? 2 : 999,
          scale: down ? 0.82 : 1,
          borderColor: mode === "hover" ? "rgba(185,176,255,0.9)" : "rgba(255,255,255,0.4)",
          backgroundColor: mode === "hover" ? "rgba(139,124,255,0.12)" : "rgba(255,255,255,0.03)",
        }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_4px_rgba(139,124,255,0.7)]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: mode === "idle" ? 1 : 0 }}
      />
    </>
  );
}
