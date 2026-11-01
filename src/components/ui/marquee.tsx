import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Marquee({
  children,
  className,
  reverse = false,
  duration = 30,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <div className={cn("relative flex overflow-hidden", className)} style={{ ["--marquee-duration" as string]: `${duration}s` }}>
      <div className={cn("flex w-max shrink-0", reverse ? "animate-marquee-rev" : "animate-marquee")}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
