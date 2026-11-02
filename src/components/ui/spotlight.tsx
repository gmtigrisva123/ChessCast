"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

/** Frosted card with a glow and luminous border that follow the pointer. */
export function Spotlight({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
        el.style.setProperty("--o", "1");
      }}
      onPointerLeave={() => ref.current?.style.setProperty("--o", "0")}
      className={cn("spot relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl", className)}
      {...rest}
    >
      <div className="spot-border" />
      {children}
    </div>
  );
}
