"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./magnetic";

type Variant = "lime" | "pink" | "cream" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold tracking-tight transition-[transform,background-color,color,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  lime: "bg-lime text-ink shadow-[0_0_0_0_rgba(216,255,60,0.0)] hover:shadow-[0_10px_40px_-8px_rgba(216,255,60,0.65)]",
  pink: "bg-pink text-ink hover:shadow-[0_10px_40px_-8px_rgba(255,77,106,0.65)]",
  cream: "bg-cream text-ink hover:shadow-[0_10px_40px_-10px_rgba(242,239,231,0.5)]",
  outline: "border border-cream/20 text-cream hover:border-lime hover:text-lime",
  ghost: "text-cream/80 hover:text-cream hover:bg-cream/5",
  dark: "bg-ink text-cream hover:bg-ink-3",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

type Common = { variant?: Variant; size?: Size; magnetic?: boolean; className?: string; children: ReactNode };

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, Common & ComponentPropsWithoutRef<"button">>(function Button(
  { variant = "lime", size = "md", magnetic = false, className, children, ...rest },
  ref,
) {
  const el = (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} data-cursor="hover" {...rest}>
      <Inner>{children}</Inner>
    </button>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
});

export function ButtonLink({
  href,
  variant = "lime",
  size = "md",
  magnetic = false,
  className,
  children,
  ...rest
}: Common & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  const el = (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} data-cursor="hover" {...rest}>
      <Inner>{children}</Inner>
    </Link>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
