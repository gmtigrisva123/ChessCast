"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tilt({
  children,
  className,
  max = 12,
  glare = true,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const cfg = { stiffness: 180, damping: 18, mass: 0.5 };
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), cfg);
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), cfg);
  const s = useSpring(useTransform(hover, [0, 1], [1, scale]), cfg);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const gOpacity = useSpring(hover, cfg);
  const bg = useMotionTemplate`radial-gradient(600px circle at ${gx} ${gy}, rgba(255,255,255,0.13), transparent 40%)`;
  return (
    <div style={{ perspective: 1100 }} className={cn("h-full", className)}>
      <motion.div
        ref={ref}
        className="relative h-full [transform-style:preserve-3d]"
        style={{ rotateX: rx, rotateY: ry, scale: s }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = ref.current!.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
          hover.set(1);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          hover.set(0);
        }}
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
            style={{ background: bg, opacity: gOpacity, borderRadius: "inherit" }}
          />
        )}
      </motion.div>
    </div>
  );
}
