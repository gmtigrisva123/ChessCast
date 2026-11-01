"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import type { ChaosCard as Card } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ChaosIcon } from "./chaos-icon";

/** Thẻ Chaos — tấm kính tối với dải gradient phát sáng, nghiêng 3D theo chuột. */
export function ChaosCard({
  card,
  size = "md",
  onClick,
  disabled,
  className,
  showDescription = false,
}: {
  card: Card;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  showDescription?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const on = useMotionValue(0);
  const cfg = { stiffness: 170, damping: 17, mass: 0.5 };
  const rx = useSpring(useTransform(py, [0, 1], [12, -12]), cfg);
  const ry = useSpring(useTransform(px, [0, 1], [-14, 14]), cfg);
  const lift = useSpring(useTransform(on, [0, 1], [0, -6]), cfg);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const shine = useMotionTemplate`radial-gradient(260px circle at ${gx} ${gy}, rgba(255,255,255,0.22), transparent 55%)`;
  const shineOpacity = useSpring(on, cfg);
  const [t1, t2] = card.tint;
  const s = size === "sm" ? { pad: "p-3", icon: 22, title: "text-[13px]", radius: "rounded-2xl" } : size === "lg" ? { pad: "p-6", icon: 40, title: "text-xl", radius: "rounded-[28px]" } : { pad: "p-4", icon: 30, title: "text-[15px]", radius: "rounded-3xl" };

  return (
    <div className={cn("[perspective:900px]", className)}>
      <motion.div
        ref={ref}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-disabled={disabled || undefined}
        aria-label={onClick ? `Ném ${card.name} — ${card.cost} coin` : undefined}
        onClick={disabled ? undefined : onClick}
        onKeyDown={(e) => {
          if (!disabled && onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
          on.set(1);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          on.set(0);
        }}
        whileTap={onClick && !disabled ? { scale: 0.95 } : undefined}
        style={{ rotateX: rx, rotateY: ry, y: lift }}
        className={cn(
          "relative isolate flex aspect-[4/5] w-full flex-col justify-between overflow-hidden border border-white/10 bg-[#0c0c14] text-left [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet",
          s.pad,
          s.radius,
          onClick && !disabled && "cursor-pointer",
          disabled && "opacity-45 saturate-50",
        )}
      >
        {/* mesh gradient */}
        <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(120% 80% at 100% 0%, ${t1}55, transparent 55%), radial-gradient(90% 70% at 0% 100%, ${t2}40, transparent 60%)` }} />
        <div className="dot-grid absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(180deg,#000,transparent_75%)]" />
        <div className="flex items-start justify-between gap-2">
          <span
            className="grid place-items-center rounded-xl text-void shadow-[0_8px_24px_-6px_var(--glow)] [transform:translateZ(30px)]"
            style={{ background: `linear-gradient(135deg, ${t1}, ${t2})`, width: s.icon + 18, height: s.icon + 18, ["--glow" as string]: t1 }}
          >
            <ChaosIcon icon={card.icon} size={s.icon} strokeWidth={1.8} />
          </span>
          <span className="rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10.5px] font-medium text-fg ring-1 ring-white/10">{card.cost}c</span>
        </div>
        <div className="[transform:translateZ(18px)]">
          <div className="kicker text-[9.5px] text-fg-3">{card.short}</div>
          <div className={cn("mt-1 font-display font-semibold leading-[1.15] tracking-[-0.02em] text-fg", s.title)}>{card.name}</div>
          {showDescription && <p className="mt-2 text-[13px] leading-relaxed text-fg-2">{card.description}</p>}
          <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-fg-3">
            <span className="h-1 w-1 rounded-full" style={{ background: t1 }} />
            {card.durationLabel}
          </div>
        </div>
        <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: shine, opacity: shineOpacity }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </motion.div>
    </div>
  );
}
