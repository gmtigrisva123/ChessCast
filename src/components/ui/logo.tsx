import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9b0ff" />
          <stop offset="0.45" stopColor="#6d5cff" />
          <stop offset="1" stopColor="#3ee6e0" />
        </linearGradient>
        <radialGradient id="lm-h" cx="0.3" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#lm-g)" />
      <circle cx="20" cy="20" r="19" fill="url(#lm-h)" />
      <path
        d="M14 29h12v-2.2c0-1.4-.6-2.4-1.5-3.2l-1.3-1.2 1.4-1.3c.8-.7 1.2-1.7 1-2.7l-.6-3-2.8-2.5-1.1 1-1.3-1.3-.7 1.9c-2.3 1.2-3.7 3.5-3.7 6.2 0 1.6.8 2.7 2.2 3.1L14 26.2V29Z"
        fill="#07070c"
      />
      <circle cx="21.2" cy="15.6" r="0.9" fill="#b9b0ff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)} aria-label="ChessCast — Home">
      <LogoMark className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[20deg]" />
      <span className="font-display text-[17px] font-semibold tracking-[-0.03em] text-fg">
        chesscast<span className="text-violet">.</span>
      </span>
    </Link>
  );
}
