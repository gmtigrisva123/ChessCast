"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Command, Search } from "lucide-react";
import { nav } from "@/lib/site";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatNum } from "@/lib/utils";
import { Logo } from "../ui/logo";
import { ButtonLink } from "../ui/button";
import { Coin } from "../commerce/coin";
import { LiquidGlass } from "../ui/liquid-glass";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const coins = useWallet((s) => s.coins);
  const mounted = useMounted();
  const setWalletOpen = useUI((s) => s.setWalletOpen);
  const setCmd = useUI((s) => s.setCommandOpen);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 420 && y > prev + 2 && !open);
    setScrolled(y > 24);
  });
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header className="fixed inset-x-0 top-0 z-[70] px-3 pt-3" animate={{ y: hidden ? -96 : 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
        {/* adaptive glass: crystal clear over the hero, darker and softer once content scrolls underneath */}
        <LiquidGlass
          className={cn("mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-3 rounded-full pl-4 pr-2 transition-[background-color,background-image] duration-500", scrolled && "liquid-dark")}
          radius={28}
          bezel={18}
          depth={16}
          blur={scrolled ? 7 : 2.5}
        >
          <Logo />
          <nav className="hidden items-center lg:flex" onMouseLeave={() => setHover(null)} aria-label="Primary">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onMouseEnter={() => setHover(n.href)}
                  className={cn("relative rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors", active ? "text-fg" : "text-fg-2 hover:text-fg")}
                >
                  {hover === n.href && <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/[0.08]" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                  {active && <motion.span layoutId="nav-dot" className="absolute -bottom-0.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#8b7cff,#3ee6e0)] shadow-[0_0_10px_2px_rgba(139,124,255,0.8)]" />}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {"badge" in n && n.badge && <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" />}
                    {n.label}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCmd(true)}
              className="hidden h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[12.5px] text-fg-3 transition-colors hover:border-white/20 hover:text-fg-2 md:flex"
              aria-label="Open command menu"
            >
              <Search size={14} /> Search
              <span className="flex items-center gap-0.5 rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px]">
                <Command size={10} />K
              </span>
            </button>
            <button
              onClick={() => setWalletOpen(true)}
              className="group flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] pl-1.5 pr-3 text-[13px] font-medium transition-colors hover:border-violet/50"
              aria-label="Open coin wallet"
            >
              <Coin className="h-6 w-6 transition-transform duration-700 group-hover:rotate-[360deg]" />
              <span className="font-mono tabular-nums">{mounted ? formatNum(coins) : "—"}</span>
            </button>
            <div className="hidden sm:block">
              <ButtonLink href="/live" size="sm" magnetic>
                Enter the Arena
              </ButtonLink>
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className={cn("absolute h-px w-4 bg-fg transition-transform duration-300", open ? "rotate-45" : "-translate-y-[3px]")} />
              <span className={cn("absolute h-px w-4 bg-fg transition-transform duration-300", open ? "-rotate-45" : "translate-y-[3px]")} />
            </button>
          </div>
        </LiquidGlass>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[65] bg-void/80 backdrop-blur-2xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <nav className="shell flex h-full flex-col justify-center gap-1 pb-20" aria-label="Mobile">
              {[{ href: "/", label: "Home" }, ...nav].map((n, i) => (
                <motion.div key={n.href} initial={{ y: 24, opacity: 0, filter: "blur(8px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }} transition={{ delay: 0.05 + i * 0.045, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <Link href={n.href} className={cn("display block py-2 text-[44px]", pathname === n.href ? "text-aurora" : "text-fg")}>
                    {n.label}
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
