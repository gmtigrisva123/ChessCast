"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Play } from "lucide-react";
import { heroSignal } from "../three/hero-scene";
import type { Line } from "@/lib/hosts";
import { HOSTS } from "@/lib/hosts";
import { ButtonLink } from "../ui/button";
import { HostAvatar } from "../ui/host-avatar";
import { SplitText } from "../ui/reveal";
import { formatNum } from "@/lib/utils";

const HeroScene = dynamic(() => import("../three/hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-ink">
      <div className="h-24 w-24 animate-pulse rounded-2xl checker-bg" />
    </div>
  ),
});

function LiveViewers() {
  const [n, setN] = useState(12483);
  useEffect(() => {
    const t = setInterval(() => setN((v) => Math.max(9000, v + Math.round((Math.random() - 0.42) * 140))), 1800);
    return () => clearInterval(t);
  }, []);
  return <span className="tabular-nums">{formatNum(n)}</span>;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(true);
  const [line, setLine] = useState<Line | null>(null);
  const [phase, setPhase] = useState<0 | 1>(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    heroSignal.progress = v;
    setPhase(v > 0.48 ? 1 : 0);
  });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      heroSignal.mx = (e.clientX / window.innerWidth) * 2 - 1;
      heroSignal.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (ref.current) io.observe(ref.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      heroSignal.progress = 0;
    };
  }, []);

  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  return (
    <section ref={ref} className="relative h-[230vh]" aria-label="Giới thiệu ChessCast">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div className="absolute inset-0">
          <HeroScene active={active} onLine={(l) => setLine(l)} />
        </div>
        {/* lớp phủ đọc chữ */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent md:bg-gradient-to-r md:from-ink/90 md:via-ink/25 md:to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        <motion.div style={{ opacity: overlayOpacity }} className="pointer-events-none absolute inset-0">
          <div className="container-x relative flex h-full flex-col justify-end pb-10 pt-28 md:justify-center md:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="pointer-events-auto mb-6 flex flex-wrap items-center gap-2"
            >
              <span className="rounded-full bg-pink px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">Unhinged Edition</span>
              <span className="glass flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-cream/80">
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-pink" /> LIVE · <LiveViewers /> người đang xem
              </span>
            </motion.div>

            <div className="relative min-h-[11.5rem] max-w-[46rem] sm:min-h-[14rem] md:min-h-[18rem] lg:min-h-[21rem]">
              <AnimatePresence mode="wait">
                {phase === 0 ? (
                  <motion.div key="p0" exit={{ opacity: 0, y: -40, filter: "blur(10px)" }} transition={{ duration: 0.45 }}>
                    <h1 className="font-display text-[clamp(3.4rem,10.5vw,9.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.01em]">
                      <SplitText text="Không chỉ xem." animateOnMount delay={0.5} className="block text-cream" />
                      <SplitText text="Can thiệp." animateOnMount delay={0.75} className="block text-lime" />
                    </h1>
                  </motion.div>
                ) : (
                  <motion.div key="p1" initial={{ opacity: 0, y: 40, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.5 }}>
                    <h2 className="font-display text-[clamp(3.2rem,9.5vw,8.6rem)] font-bold uppercase leading-[0.92]">
                      <span className="block text-cream">Một lá bài.</span>
                      <span className="block text-pink">Đổi cả ván cờ.</span>
                    </h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative mt-4 max-w-xl">
              <AnimatePresence mode="wait">
                {phase === 0 ? (
                  <motion.p key="s0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }} className="text-base text-cream/75 md:text-lg">
                    ChessCast biến mỗi ván cờ thành một <b className="text-cream">show giải trí sống</b>: AI bình luận có cá tính tường thuật từng nước, còn bạn ném <b className="text-lime">Chaos Cards</b> để làm đảo lộn trận đấu.
                  </motion.p>
                ) : (
                  <motion.p key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-base text-cream/75 md:text-lg">
                    Sương mù vừa phủ kín giữa bàn cờ — do <b className="text-cream">khán giả</b> ném vào. Hai kỳ thủ giờ phải đánh trong mù mịt, và cả dàn host AI đang phát cuồng.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3"
            >
              <ButtonLink href="/live" size="lg" magnetic>
                <Play size={18} fill="currentColor" /> Vào xem trận live
              </ButtonLink>
              <ButtonLink href="/pricing" size="lg" variant="outline" magnetic>
                Nhận 300 coin miễn phí <ArrowUpRight size={18} />
              </ButtonLink>
            </motion.div>
          </div>

          {/* Bong bóng bình luận */}
          <div className="pointer-events-none absolute bottom-8 right-6 hidden w-[340px] lg:block xl:right-12">
            <AnimatePresence mode="popLayout">
              {line && (
                <motion.div
                  key={line.text}
                  initial={{ opacity: 0, y: 30, scale: 0.92, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  style={{ transformPerspective: 800 }}
                  className="glass rounded-3xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <HostAvatar id={line.host} size={44} talking />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: HOSTS[line.host].color }}>
                        {HOSTS[line.host].name}
                      </div>
                      <div className="text-[11px] uppercase tracking-widest text-cream/40">Đang bình luận</div>
                    </div>
                    <div className="ml-auto flex h-5 items-end gap-0.5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1 rounded-full"
                          style={{ background: HOSTS[line.host].color }}
                          animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-[15px] leading-snug text-cream/90">“{line.text}”</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div style={{ opacity: hintOpacity }} className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-cream/50 md:flex">
          Cuộn để ném Chaos Card
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <ArrowDown size={16} />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
