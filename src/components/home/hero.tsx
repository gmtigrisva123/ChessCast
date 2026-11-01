"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clapperboard, CloudFog, Play } from "lucide-react";
import { heroSignal } from "../three/hero-scene";
import { HOSTS, type HostId } from "@/lib/hosts";
import { ButtonLink } from "../ui/button";
import { HostOrb, VoiceBars } from "../ui/orb";
import { ProximityText } from "../ui/proximity-text";
import { LiquidGlass } from "../ui/liquid-glass";
import { Scramble } from "../ui/scramble";
import { formatNum } from "@/lib/utils";

const HeroScene = dynamic(() => import("../three/hero-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(109,92,255,0.25),transparent)]" />,
});

const LINES: { host: HostId; text: string }[] = [
  { host: "gambit", text: "KNIGHT SACRIFICE ON F7! I CAN'T BREATHE, PEOPLE!" },
  { host: "zugzwang", text: "Evaluation: −3.2. A brave decision, in the negative sense." },
  { host: "blunder", text: "Who gave this player a keyboard? Genuinely asking." },
  { host: "gambit", text: "SOMEONE THREW FOG OF WAR! THEY'RE PLAYING IN THE CLOUDS!" },
];

function LiveViewers() {
  const [n, setN] = useState(12483);
  useEffect(() => {
    const t = setInterval(() => setN((v) => Math.max(9000, v + Math.round((Math.random() - 0.42) * 120))), 1800);
    return () => clearInterval(t);
  }, []);
  return <span className="font-mono tabular-nums">{formatNum(n)}</span>;
}

function FloatCard({ children, depth, className, delay }: { children: React.ReactNode; depth: number; className: string; delay: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(useTransform(mx, (v) => v * depth), { stiffness: 60, damping: 18 });
  const y = useSpring(useTransform(my, (v) => v * depth), { stiffness: 60, damping: 18 });
  const rx = useSpring(useTransform(my, (v) => v * -6), { stiffness: 60, damping: 18 });
  const ry = useSpring(useTransform(mx, (v) => v * 8), { stiffness: 60, damping: 18 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, [mx, my]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto absolute hidden [perspective:900px] lg:block ${className}`}
    >
      <motion.div style={{ x, y, rotateX: rx, rotateY: ry }}>{children}</motion.div>
    </motion.div>
  );
}

function HostCard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % LINES.length), 3600);
    return () => clearInterval(t);
  }, []);
  const l = LINES[i];
  return (
    <LiquidGlass className="w-[310px] rounded-[26px] p-4" radius={26} bezel={14} depth={12}>
      <div className="flex items-center gap-3">
        <HostOrb id={l.host} size={38} talking />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold">{HOSTS[l.host].name}</div>
          <div className="font-mono text-[10.5px] text-fg-2">live on air</div>
        </div>
        <VoiceBars color={HOSTS[l.host].color} />
      </div>
      {/* cross-fade (popLayout) so a line is always on screen, even on slow frames */}
      <div className="relative mt-3 min-h-[42px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.5 }}
            className="text-[13.5px] leading-snug text-fg"
          >
            “{l.text}”
          </motion.p>
        </AnimatePresence>
      </div>
    </LiquidGlass>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => (heroSignal.progress = v));
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-32%"]);
  const contentO = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.94]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      heroSignal.mx = (e.clientX / window.innerWidth) * 2 - 1;
      heroSignal.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "80px" });
    if (ref.current) io.observe(ref.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      heroSignal.progress = 0;
    };
  }, []);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[700px] overflow-hidden" aria-label="ChessCast introduction">
      <div className="absolute inset-0">
        <HeroScene active={active} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-void via-void/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-void/85 to-transparent" />

      {/* editorial side rails */}
      <motion.div style={{ opacity: contentO }} className="pointer-events-none absolute inset-y-0 left-5 z-10 hidden items-center xl:flex">
        <span className="kicker text-[10px] text-fg-3 [writing-mode:vertical-rl] rotate-180">Live chess entertainment · Season 01</span>
      </motion.div>
      <motion.div style={{ opacity: contentO }} className="pointer-events-none absolute inset-y-0 right-5 z-10 hidden items-center xl:flex">
        <span className="kicker text-[10px] text-fg-3 [writing-mode:vertical-rl]">AI hosts · Chaos Cards · Auto clips</span>
      </motion.div>

      <motion.div style={{ y: contentY, opacity: contentO, scale: contentScale }} className="pointer-events-none relative z-10 flex h-full flex-col items-center px-4 pt-28 text-center md:pt-32">
        <motion.div initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} transition={{ delay: 0.3, duration: 0.9 }}>
          <LiquidGlass className="pointer-events-auto flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-[12.5px] text-fg-2" radius={20} bezel={10} depth={8}>
            <span className="flex items-center gap-1.5 rounded-full bg-rose/20 px-2 py-0.5 font-mono text-[10.5px] font-medium text-rose">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> LIVE
            </span>
            Arena #2741 · <LiveViewers /> watching
          </LiquidGlass>
        </motion.div>
        <ProximityText
          text="Every game deserves *a stage.*"
          delay={0.45}
          className="display mt-7 max-w-[13ch] text-[clamp(3.2rem,9.2vw,9rem)] leading-[0.92] [text-wrap:balance]"
        />
        <div className="flex-1" />
        <motion.p
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          transition={{ delay: 1.2, duration: 1 }}
          className="max-w-xl text-[15.5px] leading-relaxed text-fg-2 [text-shadow:0_1px_2px_rgba(4,4,10,0.95),0_2px_20px_rgba(4,4,10,0.9)] md:text-[17px]"
        >
          AI hosts with real personalities call every move. You throw Chaos Cards to bend the game. The best moments turn into clips on their own.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.9 }} className="pointer-events-auto mb-12 mt-7 flex flex-wrap items-center justify-center gap-3 md:mb-24">
          <ButtonLink href="/live" size="lg" magnetic>
            <Play size={16} fill="currentColor" /> Enter the Arena
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="liquid" magnetic>
            Claim 300 free coins <ArrowRight size={16} />
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity: contentO }} className="pointer-events-none absolute inset-0 z-10">
        <FloatCard depth={-14} delay={1.5} className="left-[5%] top-[46%]">
          <HostCard />
        </FloatCard>
        <FloatCard depth={18} delay={1.7} className="right-[5%] top-[28%]">
          <LiquidGlass className="flex w-[262px] items-center gap-3 rounded-[24px] p-3.5" radius={24} bezel={12} depth={10}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#4d8dff,#3ee6e0)] text-void shadow-[0_8px_24px_-6px_#3ee6e0]">
              <CloudFog size={20} />
            </span>
            <div>
              <div className="text-[13px] font-semibold">Fog of War just dropped</div>
              <div className="font-mono text-[10.5px] text-fg-2">by lana.n · 50 coins</div>
            </div>
          </LiquidGlass>
        </FloatCard>
        <FloatCard depth={10} delay={1.9} className="right-[9%] top-[57%]">
          <LiquidGlass className="w-[220px] overflow-hidden rounded-[24px]" radius={24} bezel={12} depth={10}>
            <div className="relative aspect-[16/10] bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,107,154,0.55),transparent_60%),radial-gradient(120%_100%_at_100%_100%,rgba(139,124,255,0.6),transparent_60%)]">
              <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 font-mono text-[10px]">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> REC
              </span>
              <span className="absolute bottom-2 right-2.5 font-mono text-[10px] text-fg/80">0:15</span>
            </div>
            <div className="flex items-center gap-2 p-3">
              <Clapperboard size={15} className="text-violet" />
              <span className="text-[12.5px] text-fg">AI clipped “The Queen Sac”</span>
            </div>
          </LiquidGlass>
        </FloatCard>
      </motion.div>

      <motion.div style={{ opacity: contentO }} className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <Scramble text="SCROLL TO START THE SHOW" className="kicker text-[10px] text-fg-3" hover={false} />
        <span className="relative h-8 w-px overflow-hidden bg-white/10">
          <motion.span className="absolute inset-x-0 top-0 h-3 bg-fg" animate={{ y: [-12, 32] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.div>
    </section>
  );
}
