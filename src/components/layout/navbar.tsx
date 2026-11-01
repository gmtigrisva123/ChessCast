"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { nav } from "@/lib/site";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatNum } from "@/lib/utils";
import { Logo } from "../ui/logo";
import { ButtonLink } from "../ui/button";
import { Coin } from "../commerce/coin";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const coins = useWallet((s) => s.coins);
  const mounted = useMounted();
  const setWalletOpen = useUI((s) => s.setWalletOpen);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 240 && y > prev && !open);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[70]"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-x pt-3">
          <div
            className={cn(
              "flex h-[60px] items-center justify-between gap-4 rounded-full px-3 pl-4 transition-all duration-500",
              scrolled || open ? "glass shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]" : "border border-transparent",
            )}
          >
            <Logo />
            <nav className="hidden items-center lg:flex" onMouseLeave={() => setHover(null)} aria-label="Điều hướng chính">
              {nav.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onMouseEnter={() => setHover(n.href)}
                    className={cn("relative rounded-full px-4 py-2 text-[14px] font-medium transition-colors", active ? "text-ink" : "text-cream/75 hover:text-cream")}
                  >
                    {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                    {!active && hover === n.href && (
                      <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-cream/8" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {"badge" in n && n.badge && <span className={cn("h-1.5 w-1.5 animate-pulse-dot rounded-full", active ? "bg-ink" : "bg-pink")} />}
                      {n.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWalletOpen(true)}
                className="group flex h-10 items-center gap-2 rounded-full border border-cream/10 bg-ink-3/60 pl-2 pr-3.5 text-sm font-semibold transition-colors hover:border-lime/60"
                aria-label="Mở ví coin"
                data-cursor="hover"
              >
                <Coin className="h-6 w-6 transition-transform duration-500 group-hover:rotate-[360deg]" />
                <span className="tabular-nums">{mounted ? formatNum(coins) : "—"}</span>
              </button>
              <div className="hidden sm:block">
                <ButtonLink href="/live" size="sm" className="h-10" magnetic>
                  Xem Live <ArrowUpRight size={16} />
                </ButtonLink>
              </div>
              <button
                onClick={() => setOpen((v) => !v)}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-cream/10 lg:hidden"
                aria-label={open ? "Đóng menu" : "Mở menu"}
                aria-expanded={open}
              >
                <span className={cn("absolute h-0.5 w-4 bg-cream transition-transform duration-300", open ? "rotate-45" : "-translate-y-1")} />
                <span className={cn("absolute h-0.5 w-4 bg-cream transition-transform duration-300", open ? "-rotate-45" : "translate-y-1")} />
              </button>
            </div>
          </div>
        </div>
        <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-lime" style={{ scaleX: scrollYProgress, opacity: scrolled ? 1 : 0 }} />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[65] flex flex-col bg-ink pt-24 lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="checker-bg absolute inset-0 opacity-50" />
            <nav className="container-x relative flex flex-col gap-1" aria-label="Menu di động">
              {[{ href: "/", label: "Trang chủ" }, ...nav].map((n, i) => (
                <motion.div key={n.href} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <Link
                    href={n.href}
                    className={cn(
                      "flex items-baseline justify-between border-b border-cream/10 py-3 font-display text-[44px] font-bold uppercase leading-none",
                      pathname === n.href ? "text-lime" : "text-cream",
                    )}
                  >
                    {n.label}
                    <span className="text-sm font-normal text-cream/40">0{i + 1}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
