"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./magnetic";

type Variant = "primary" | "glass" | "ghost" | "aurora" | "ember" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-[-0.01em] transition-[transform,background-color,color,box-shadow,border-color,opacity] duration-300 ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-void active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "bg-fg text-void shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_10px_30px_-10px_rgba(139,124,255,0.55)] hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_16px_50px_-12px_rgba(139,124,255,0.85)]",
  glass: "glass text-fg hover:bg-white/10",
  ghost: "text-fg-2 hover:bg-white/[0.06] hover:text-fg",
  aurora:
    "bg-[linear-gradient(110deg,#8b7cff,#4d8dff_45%,#3ee6e0)] text-void shadow-[0_12px_40px_-12px_rgba(77,141,255,0.8)] hover:brightness-110",
  ember: "bg-[linear-gradient(110deg,#ffc56b,#ff8a4c_50%,#ff6b9a)] text-void shadow-[0_12px_40px_-12px_rgba(255,138,76,0.75)] hover:brightness-110",
  outline: "border border-white/15 text-fg hover:border-white/35 hover:bg-white/[0.04]",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-7 text-[15px]",
};

type Common = { variant?: Variant; size?: Size; magnetic?: boolean; className?: string; children: ReactNode };

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-[900ms] ease-out group-hover/btn:translate-x-[120%]" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, Common & ComponentPropsWithoutRef<"button">>(function Button(
  { variant = "primary", size = "md", magnetic = false, className, children, ...rest },
  ref,
) {
  const el = (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      <Inner>{children}</Inner>
    </button>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  magnetic = false,
  className,
  children,
  ...rest
}: Common & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const el = (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      <Inner>{children}</Inner>
    </Link>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
