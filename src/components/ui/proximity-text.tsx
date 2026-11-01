"use client";

import { motion } from "motion/react";
import { useEffect, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";

type Axis = { wght: number; wdth: number };

/**
 * Variable-font headline: each glyph swells in weight and width as the cursor gets close
 * (Mona Sans wght 200–900, wdth 75–125). Segments wrapped in *asterisks* render in the
 * italic serif accent and stay static. Letters animate in with a staggered blur reveal.
 */
export function ProximityText({
  text,
  as: Tag = "h1",
  className,
  accentClass = "serif-accent text-aurora",
  radius = 220,
  from = { wght: 520, wdth: 100 },
  to = { wght: 860, wdth: 125 },
  delay = 0,
  onMount = true,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  accentClass?: string;
  radius?: number;
  from?: Axis;
  to?: Axis;
  delay?: number;
  onMount?: boolean;
  id?: string;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const glyphs = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-glyph]"));
    const cur = glyphs.map(() => 0);
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let running = false;
    const tick = () => {
      let moving = false;
      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i];
        const r = g.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const target = Math.max(0, 1 - d / radius);
        const eased = target * target * (3 - 2 * target);
        cur[i] += (eased - cur[i]) * 0.16;
        if (Math.abs(eased - cur[i]) > 0.002) moving = true;
        const t = cur[i];
        g.style.fontVariationSettings = `"wght" ${Math.round(from.wght + (to.wght - from.wght) * t)}, "wdth" ${(from.wdth + (to.wdth - from.wdth) * t).toFixed(1)}`;
      }
      if (moving) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const on = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const leave = () => {
      mx = -9999;
      my = -9999;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    window.addEventListener("pointermove", on, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", on);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [radius, from.wght, from.wdth, to.wght, to.wdth]);

  // tokenize *accent* segments
  const parts: { text: string; accent: boolean }[] = [];
  text.split(/(\*[^*]+\*)/g).forEach((seg) => {
    if (!seg) return;
    if (seg.startsWith("*") && seg.endsWith("*")) parts.push({ text: seg.slice(1, -1), accent: true });
    else parts.push({ text: seg, accent: false });
  });
  const plain = parts.map((p) => p.text).join("");
  let n = 0;
  const trigger = onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-8% 0px" } };

  return (
    <Tag ref={root} id={id} className={className} aria-label={plain}>
      <motion.span aria-hidden initial="hidden" {...trigger} transition={{ staggerChildren: 0.022, delayChildren: delay }} className="inline">
        {parts.map((p, pi) =>
          p.text.split(/(\s+)/).map((word, wi) => {
            if (/^\s+$/.test(word)) return <span key={`${pi}-${wi}`}> </span>;
            if (!word) return null;
            return (
              <span key={`${pi}-${wi}`} className={cn("inline-block whitespace-nowrap", p.accent && accentClass, p.accent && "pr-[0.08em]")}>
                {Array.from(word).map((ch, ci) => {
                  n++;
                  return (
                    <motion.span
                      key={ci}
                      data-glyph={p.accent ? undefined : ""}
                      className="inline-block"
                      style={p.accent ? undefined : { fontVariationSettings: `"wght" ${from.wght}, "wdth" ${from.wdth}` }}
                      variants={{
                        hidden: { opacity: 0, y: "0.45em", rotateX: -70, filter: "blur(10px)" },
                        show: { opacity: 1, y: "0em", rotateX: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }, transitionEnd: { filter: "none" } },
                      }}
                    >
                      {ch}
                    </motion.span>
                  );
                })}
              </span>
            );
          }),
        )}
      </motion.span>
      <span className="sr-only">{n > 0 ? "" : plain}</span>
    </Tag>
  );
}
