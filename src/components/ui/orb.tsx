"use client";

import { motion } from "motion/react";
import { HOSTS, type HostId } from "@/lib/hosts";
import { cn } from "@/lib/utils";

/** Quả cầu giọng nói của host AI — xoay gradient, “thở” khi đang nói. */
export function HostOrb({ id, size = 48, talking = false, className }: { id: HostId; size?: number; talking?: boolean; className?: string }) {
  const [a, b, c] = HOSTS[id].orb;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }} aria-hidden>
      <motion.div
        className="absolute inset-[-18%] rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, ${b}88, transparent 65%)` }}
        animate={{ opacity: talking ? [0.6, 1, 0.6] : 0.45, scale: talking ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 1.1, repeat: talking ? Infinity : 0 }}
      />
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full"
        animate={{ scale: talking ? [1, 1.06, 0.98, 1.04, 1] : 1 }}
        transition={{ duration: 0.9, repeat: talking ? Infinity : 0 }}
      >
        <motion.div
          className="absolute inset-[-30%]"
          style={{ background: `conic-gradient(from 0deg, ${a}, ${b}, ${c}, ${b}, ${a})` }}
          animate={{ rotate: 360 }}
          transition={{ duration: talking ? 2.2 : 9, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.85), rgba(255,255,255,0) 38%)` }} />
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 70% 85%, rgba(5,5,8,0.55), transparent 55%)" }} />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
      </motion.div>
    </div>
  );
}

export function VoiceBars({ color = "#fff", active = true, className }: { color?: string; active?: boolean; className?: string }) {
  return (
    <div className={cn("flex h-4 items-end gap-[3px]", className)} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: color }}
          animate={active ? { height: ["25%", "100%", "40%", "85%", "25%"] } : { height: "25%" }}
          transition={{ duration: 0.9, repeat: active ? Infinity : 0, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}
