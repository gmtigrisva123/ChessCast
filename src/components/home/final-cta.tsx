"use client";

import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { ButtonLink } from "../ui/button";
import { ProximityText } from "../ui/proximity-text";
import { warpSignal } from "../gl/warp";

const Warp = dynamic(() => import("../gl/warp"), { ssr: false, loading: () => <div className="absolute inset-0 bg-void" /> });

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const vel = useSpring(useVelocity(scrollY), { stiffness: 80, damping: 20 });
  useMotionValueEvent(vel, "change", (v) => (warpSignal.speed = Math.min(6, Math.abs(v) / 450)));
  const radius = useTransform(scrollYProgress, [0, 0.45], [120, 40]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.88, 1]);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="px-3 py-16 md:px-6" aria-label="Get started">
      <motion.div style={{ scale, borderRadius: radius }} className="relative mx-auto h-[86svh] min-h-[600px] max-w-[1400px] overflow-hidden border border-white/10">
        <div className="absolute inset-0">
          <Warp active={active} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_50%,rgba(4,4,10,0.75),transparent)]" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="kicker text-fg-2">The next game is about to start</div>
          <ProximityText as="h2" onMount={false} text="Your *move.*" className="display mt-5 text-[clamp(4rem,14vw,12rem)] leading-[0.9]" />
          <p className="mx-auto mt-6 max-w-md text-[17px] text-fg-2">300 free coins are already in your wallet. Three AI hosts are in position. The stage is only missing you.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/live" size="lg" magnetic>
              <Play size={16} fill="currentColor" /> Enter the Arena
            </ButtonLink>
            <ButtonLink href="/investors" size="lg" variant="liquid" magnetic>
              For investors <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
