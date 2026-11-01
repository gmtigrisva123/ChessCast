"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clapperboard, CloudFog, Play } from "lucide-react";
import { heroSignal } from "../three/hero-scene";
import { HOSTS, type HostId } from "@/lib/hosts";
import { ButtonLink } from "../ui/button";
import { HostOrb, VoiceBars } from "../ui/orb";
import { Words } from "../ui/reveal";
import { formatNum } from "@/lib/utils";

const HeroScene = dynamic(() => import("../three/hero-scene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(109,92,255,0.25),transparent)]" />,
});

const LINES: { host: HostId; text: string }[] = [
  { host: "gambit", text: "THÍ MÃ Ở F7! KHÁN GIẢ ƠI, TÔI KHÔNG THỞ NỔI!" },
  { host: "zugzwang", text: "Đánh giá: −3,2. Một quyết định dũng cảm theo nghĩa tiêu cực." },
  { host: "blunder", text: "Ối dồi ôi, ai cho bạn này cầm quân vậy trời?" },
  { host: "gambit", text: "Ai đó vừa ném Sương Mù! Hai kỳ thủ đang đánh trong mây!" },
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
      className={`pointer-events-auto absolute hidden lg:block ${className}`}
    >
      <motion.div style={{ x, y }}>{children}</motion.div>
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
    <div className="glass-strong w-[300px] rounded-3xl p-4">
      <div className="flex items-center gap-3">
        <HostOrb id={l.host} size={38} talking />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">{HOSTS[l.host].name}</div>
          <div className="font-mono text-[10.5px] text-fg-3">đang bình luận trực tiếp</div>
        </div>
        <VoiceBars color={HOSTS[l.host].color} />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          transition={{ duration: 0.5 }}
          className="mt-3 min-h-[42px] text-[13.5px] leading-snug text-fg-2"
        >
          “{l.text}”
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => (heroSignal.progress = v));
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const contentO = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.6], ["blur(0px)", "blur(10px)"]);

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
    <section ref={ref} className="relative h-[100svh] min-h-[680px] overflow-hidden" aria-label="Giới thiệu ChessCast">
      <div className="absolute inset-0">
        <HeroScene active={active} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-void via-void/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-void/80 to-transparent" />

      <motion.div style={{ y: contentY, opacity: contentO, filter: contentBlur }} className="pointer-events-none relative z-10 flex h-full flex-col items-center px-4 pt-28 text-center md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="glass pointer-events-auto flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-[12.5px] text-fg-2"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-rose/15 px-2 py-0.5 font-mono text-[10.5px] font-medium text-rose">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> LIVE
          </span>
          Arena #2741 · <LiveViewers /> người đang xem
        </motion.div>
        <Words
          as="h1"
          onMount
          delay={0.45}
          text="Mọi ván cờ đều xứng đáng *một sân khấu.*"
          className="display mt-7 max-w-[15ch] text-[clamp(2.9rem,7.4vw,7rem)] leading-[0.98] [text-wrap:balance] md:max-w-[17ch]"
        />
        <div className="flex-1" />
        <motion.p
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          transition={{ delay: 1.1, duration: 1 }}
          className="max-w-xl text-[15.5px] leading-relaxed text-fg-2 md:text-[17px]"
        >
          Host AI có cá tính bình luận từng nước. Bạn ném Chaos Card để bẻ lái trận đấu. Khoảnh khắc hay nhất tự thành clip.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.9 }}
          className="pointer-events-auto mb-12 mt-7 flex flex-wrap items-center justify-center gap-3 md:mb-14"
        >
          <ButtonLink href="/live" size="lg" magnetic>
            <Play size={16} fill="currentColor" /> Vào Arena ngay
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="glass" magnetic>
            Nhận 300 coin miễn phí <ArrowRight size={16} />
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity: contentO }} className="pointer-events-none absolute inset-0 z-10">
        <FloatCard depth={-14} delay={1.4} className="left-[5%] top-[44%]">
          <HostCard />
        </FloatCard>
        <FloatCard depth={18} delay={1.6} className="right-[5%] top-[30%]">
          <div className="glass-strong flex w-[250px] items-center gap-3 rounded-3xl p-3.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#4d8dff,#3ee6e0)] text-void">
              <CloudFog size={20} />
            </span>
            <div>
              <div className="text-[13px] font-medium">Sương Mù vừa được ném</div>
              <div className="font-mono text-[10.5px] text-fg-3">bởi lan.nguyen · 50 coin</div>
            </div>
          </div>
        </FloatCard>
        <FloatCard depth={10} delay={1.8} className="right-[9%] top-[58%]">
          <div className="glass-strong w-[210px] overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/10] bg-[radial-gradient(120%_100%_at_0%_0%,rgba(255,107,154,0.5),transparent_60%),radial-gradient(120%_100%_at_100%_100%,rgba(139,124,255,0.55),transparent_60%)]">
              <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10px]">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-rose" /> REC
              </span>
              <span className="absolute bottom-2 right-2.5 font-mono text-[10px] text-fg/80">0:15</span>
            </div>
            <div className="flex items-center gap-2 p-3">
              <Clapperboard size={15} className="text-violet" />
              <span className="text-[12.5px] text-fg-2">AI vừa cắt clip “Thí Hậu”</span>
            </div>
          </div>
        </FloatCard>
      </motion.div>

      <motion.div style={{ opacity: contentO }} className="pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="kicker text-[10px] text-fg-3">Cuộn để xem show</span>
        <span className="relative h-8 w-px overflow-hidden bg-white/10">
          <motion.span className="absolute inset-x-0 top-0 h-3 bg-fg" animate={{ y: [-12, 32] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.div>
    </section>
  );
}
