"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { ButtonLink } from "../ui/button";
import { Words } from "../ui/reveal";

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.9, 1]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 90]);
  return (
    <section ref={ref} className="px-3 py-16 md:px-6" aria-label="Bắt đầu">
      <motion.div style={{ scale }} className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[40px] border border-white/10">
        <motion.div style={{ rotate: rot }} className="absolute left-1/2 top-1/2 h-[1400px] w-[1400px] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,#6d5cff,#4d8dff,#3ee6e0,#ff8a4c,#ff6b9a,#6d5cff)] opacity-50 blur-[90px]" />
        <div className="absolute inset-0 bg-void/55" />
        <div className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse,#000,transparent_70%)]" />
        <div className="relative px-6 py-24 text-center md:py-32">
          <Words text="Ván cờ tiếp theo *đang chờ bạn.*" className="display mx-auto max-w-4xl text-[clamp(2.6rem,6.4vw,5.6rem)]" />
          <p className="mx-auto mt-6 max-w-lg text-[17px] text-fg-2">300 coin miễn phí đang nằm sẵn trong ví. Ba host AI đã vào vị trí. Chỉ thiếu bạn.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/live" size="lg" magnetic>
              <Play size={16} fill="currentColor" /> Vào Arena
            </ButtonLink>
            <ButtonLink href="/investors" size="lg" variant="glass" magnetic>
              Dành cho nhà đầu tư <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
