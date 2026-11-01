"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import type { ChaosCard } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/** Lá Chaos Card kiểu thẻ holographic: nghiêng 3D theo chuột + lớp foil cầu vồng. */
export function HoloCard({
  card,
  className,
  footer,
  compact = false,
  onClick,
  disabled,
}: {
  card: ChaosCard;
  className?: string;
  footer?: ReactNode;
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hyp = useMotionValue(0);
  const cfg = { stiffness: 160, damping: 16, mass: 0.6 };
  const rx = useSpring(useTransform(py, [0, 1], [16, -16]), cfg);
  const ry = useSpring(useTransform(px, [0, 1], [-18, 18]), cfg);
  const sc = useSpring(useTransform(hyp, [0, 1], [1, 1.04]), cfg);

  const setVars = (x: number, y: number, h: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--pos", `${x * 100}% ${y * 100}%`);
    el.style.setProperty("--hyp", `${h}`);
  };

  return (
    <div className={cn("[perspective:1000px]", className)}>
      <motion.div
        ref={ref}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-disabled={disabled}
        onClick={disabled ? undefined : onClick}
        onKeyDown={(e) => {
          if (!disabled && onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        data-cursor={onClick ? "view" : undefined}
        data-cursor-label={onClick ? "Ném!" : undefined}
        className={cn(
          "holo relative isolate flex aspect-[5/7] w-full flex-col overflow-hidden rounded-[22px] border bg-gradient-to-b from-ink-3 to-ink p-4 text-left shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)] [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime",
          disabled && "opacity-50 grayscale",
          compact ? "rounded-2xl p-3" : "",
        )}
        style={{ rotateX: rx, rotateY: ry, scale: sc, borderColor: card.accent + "88" }}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          px.set(x);
          py.set(y);
          hyp.set(1);
          setVars(x, y, Math.min(1, Math.hypot(x - 0.5, y - 0.5) * 2));
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
          hyp.set(0);
          setVars(0.5, 0.5, 0);
        }}
        whileTap={onClick && !disabled ? { scale: 0.94 } : undefined}
      >
        <div className="checker-bg absolute inset-0 opacity-60" />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 38%, ${card.accent}44, transparent 60%)` }}
        />
        <div
          className={cn("relative z-10 flex items-center justify-between gap-1 font-bold uppercase", compact ? "text-[9px] tracking-[0.1em]" : "text-[10px] tracking-[0.18em]")}
          style={{ color: card.accent }}
        >
          <span className="truncate">{card.short}</span>
          <span className="shrink-0 rounded-full bg-ink/70 px-2 py-0.5 text-cream">{card.cost} ◈</span>
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center [transform:translateZ(40px)]">
          <span
            className={cn("font-display leading-none text-cream drop-shadow-[0_0_24px_currentColor]", compact ? "text-4xl" : "text-7xl md:text-8xl")}
            style={{ color: card.accent }}
          >
            {card.glyph}
          </span>
        </div>
        <div className="relative z-10 [transform:translateZ(24px)]">
          <div className={cn("font-display font-bold uppercase text-cream", compact ? "text-[15px] leading-[1.05]" : "text-2xl leading-[1]")}>{card.name}</div>
          {!compact && <p className="mt-2 text-[13px] leading-snug text-cream/65">{card.description}</p>}
          <div className={cn("mt-1.5 flex items-center justify-between gap-2 font-semibold uppercase text-cream/50", compact ? "text-[9px] tracking-[0.08em]" : "text-[10px] tracking-[0.16em]")}>
            {!compact && <span style={{ color: card.accent }}>{card.rarity}</span>}
            <span className="truncate" style={compact ? { color: card.accent } : undefined}>
              {card.durationLabel}
            </span>
          </div>
          {footer}
        </div>
        <div className="holo-foil" />
        <div className="holo-glare" />
      </motion.div>
    </div>
  );
}
