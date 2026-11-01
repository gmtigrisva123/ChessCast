"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import { HOSTS, type HostId } from "@/lib/hosts";
import { cn } from "@/lib/utils";

/** Avatar host AI — mắt dõi theo con trỏ, miệng mấp máy khi đang nói. */
export function HostAvatar({ id, size = 56, talking = false, className }: { id: HostId; size?: number; talking?: boolean; className?: string }) {
  const host = HOSTS[id];
  const ref = useRef<HTMLDivElement>(null);
  const ex = useMotionValue(0);
  const ey = useMotionValue(0);
  const sx = useSpring(ex, { stiffness: 200, damping: 20 });
  const sy = useSpring(ey, { stiffness: 200, damping: 20 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      const k = Math.min(1, d / 300);
      ex.set((dx / d) * 4 * k);
      ey.set((dy / d) * 3.5 * k);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [ex, ey]);

  const shape =
    id === "gambit"
      ? "M50 6 C78 6 94 24 94 52 C94 80 76 94 50 94 C24 94 6 80 6 52 C6 24 22 6 50 6Z"
      : id === "zugzwang"
        ? "M14 10 H86 Q92 10 92 16 V84 Q92 90 86 90 H14 Q8 90 8 84 V16 Q8 10 14 10Z"
        : "M50 4 L62 18 L82 12 L84 32 L96 46 L84 60 L86 82 L64 80 L50 96 L36 80 L14 82 L16 60 L4 46 L16 32 L18 12 L38 18Z";

  return (
    <div ref={ref} className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={`g-${id}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="60%" stopColor={host.color} stopOpacity="1" />
            <stop offset="100%" stopColor={host.color} stopOpacity="0.8" />
          </radialGradient>
        </defs>
        <motion.path
          d={shape}
          fill={`url(#g-${id})`}
          animate={talking ? { scale: [1, 1.05, 0.98, 1.04, 1] } : { scale: 1 }}
          transition={talking ? { duration: 0.6, repeat: Infinity } : {}}
          style={{ transformOrigin: "50% 50%" }}
        />
        {id === "zugzwang" && (
          <g stroke="#121317" strokeWidth="3" fill="none">
            <circle cx="35" cy="44" r="11" />
            <circle cx="65" cy="44" r="11" />
            <path d="M46 44 H54" />
          </g>
        )}
        {id === "gambit" && <path d="M22 22 Q50 -2 78 22 L72 30 Q50 14 28 30Z" fill="#121317" />}
        <motion.g style={{ x: sx, y: sy }}>
          <ellipse cx="35" cy="44" rx="6.5" ry={id === "blunder" ? 8 : 6.5} fill="#121317" />
          <ellipse cx="65" cy="44" rx="6.5" ry={id === "blunder" ? 5 : 6.5} fill="#121317" />
          <circle cx="37" cy="42" r="2" fill="#fff" />
          <circle cx="67" cy="42" r="2" fill="#fff" />
        </motion.g>
        <motion.ellipse
          cx="50"
          cy="70"
          rx={id === "zugzwang" ? 10 : 13}
          fill="#121317"
          animate={talking ? { ry: [2, 8, 3, 9, 2] } : { ry: id === "blunder" ? 5 : 2.5 }}
          transition={talking ? { duration: 0.45, repeat: Infinity } : { duration: 0.2 }}
        />
      </svg>
    </div>
  );
}
