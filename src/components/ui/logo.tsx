import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#d8ff3c" />
      <path
        d="M13 30h14v-2.6c0-1.6-.7-2.8-1.8-3.8l-1.6-1.4 1.7-1.5c1-.8 1.4-2 1.2-3.2l-.7-3.6-3.4-3-1.3 1.2-1.6-1.6-.8 2.3c-2.7 1.4-4.4 4.2-4.4 7.4 0 1.9 1 3.2 2.6 3.7L13 26.9V30Z"
        fill="#121317"
      />
      <circle cx="20.6" cy="14.6" r="1.1" fill="#d8ff3c" />
      <path d="M29.5 9.5a7 7 0 0 1 0 9.9M32.4 6.6a11 11 0 0 1 0 15.6" stroke="#ff4d6a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)} aria-label="ChessCast — Trang chủ" data-cursor="hover">
      <LogoMark className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-[-8deg] group-hover:scale-110" />
      <span className="font-display text-[22px] font-bold uppercase leading-none tracking-tight text-cream">
        Chess<span className="text-lime">Cast</span>
      </span>
    </Link>
  );
}
