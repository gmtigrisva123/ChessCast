"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

export function Counter({
  to,
  from = 0,
  duration = 2,
  format = (n: number) => Math.round(n).toLocaleString("vi-VN"),
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => ctrl.stop();
  }, [inView, from, to, duration, format]);
  return (
    <span ref={ref} className={className}>
      {format(from)}
    </span>
  );
}
