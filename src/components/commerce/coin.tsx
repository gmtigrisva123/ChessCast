import { cn } from "@/lib/utils";

/** Biểu tượng Chaos Coin. */
export function Coin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} aria-hidden>
      <defs>
        <linearGradient id="coin-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3ff9e" />
          <stop offset="0.5" stopColor="#d8ff3c" />
          <stop offset="1" stopColor="#8fb800" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="url(#coin-g)" stroke="#121317" strokeWidth="1" />
      <path d="M12 5.5 17.5 12 12 18.5 6.5 12Z" fill="#121317" />
      <path d="M12 8.6 14.8 12 12 15.4 9.2 12Z" fill="#d8ff3c" />
    </svg>
  );
}
