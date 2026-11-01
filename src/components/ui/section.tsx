import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Kicker({ children, className, tone = "violet" }: { children: ReactNode; className?: string; tone?: "violet" | "ember" | "teal" }) {
  const c = tone === "ember" ? "bg-ember" : tone === "teal" ? "bg-teal" : "bg-violet";
  return (
    <div className={cn("kicker inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-fg-2", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_10px_currentColor]", c)} />
      {children}
    </div>
  );
}
