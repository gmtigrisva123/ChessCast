import { cn } from "@/lib/utils";

/** Chaos Coin — a mother-of-pearl coin. */
export function Coin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} aria-hidden>
      <defs>
        <linearGradient id="cc-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3edff" />
          <stop offset="0.35" stopColor="#b9b0ff" />
          <stop offset="0.7" stopColor="#6d5cff" />
          <stop offset="1" stopColor="#3ee6e0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#cc-coin)" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#07070c" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M12 7.2 15.6 12 12 16.8 8.4 12Z" fill="#07070c" fillOpacity="0.75" />
      <ellipse cx="9" cy="7.5" rx="3.4" ry="1.6" fill="#fff" opacity="0.5" transform="rotate(-30 9 7.5)" />
    </svg>
  );
}
