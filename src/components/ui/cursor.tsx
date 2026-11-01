"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<"idle" | "hover" | "text" | "view">("idle");
  const [label, setLabel] = useState<string | null>(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const el = t?.closest?.("[data-cursor], a, button, input, textarea, select, label, [role=button], canvas") as HTMLElement | null;
      if (!el) {
        setState("idle");
        setLabel(null);
        return;
      }
      const kind = el.getAttribute("data-cursor");
      if (kind === "view") {
        setState("view");
        setLabel(el.getAttribute("data-cursor-label") ?? "Xem");
      } else if (el.matches("input, textarea")) {
        setState("text");
        setLabel(null);
      } else if (el.tagName === "CANVAS" && !kind) {
        setState("idle");
        setLabel(null);
      } else {
        setState("hover");
        setLabel(null);
      }
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

  if (!enabled) return null;
  const size = state === "view" ? 88 : state === "hover" ? 54 : state === "text" ? 6 : 34;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full mix-blend-difference"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: size,
          height: state === "text" ? 28 : size,
          backgroundColor: state === "view" ? "rgba(216,255,60,1)" : state === "hover" ? "rgba(242,239,231,1)" : "rgba(242,239,231,0)",
          borderWidth: state === "idle" ? 1.5 : 0,
          scale: down ? 0.8 : 1,
          borderRadius: state === "text" ? 3 : 999,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <span className="absolute inset-0 rounded-[inherit] border border-cream/80" style={{ opacity: state === "idle" ? 1 : 0 }} />
        {label && <span className="text-[11px] font-bold uppercase tracking-widest text-ink mix-blend-normal">{label}</span>}
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-lime"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: state === "idle" ? 1 : 0 }}
      />
    </>
  );
}
