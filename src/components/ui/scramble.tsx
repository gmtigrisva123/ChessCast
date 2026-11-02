"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\";

/** Decoding-text effect: characters cycle through random glyphs before locking in. */
export function Scramble({ text, className, duration = 900, hover = true }: { text: string; className?: string; duration?: number; hover?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const [out, setOut] = useState(text);
  const raf = useRef(0);

  const run = () => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const locked = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (i < locked || c === " " || c === "·") s += c;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setOut(text);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (inView && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) run();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text]);

  return (
    <span ref={ref} className={className} aria-label={text} onMouseEnter={hover ? run : undefined}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
