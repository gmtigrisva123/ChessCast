"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { ButtonLink } from "../ui/button";

export function VisionCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.86, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.4], [80, 32]);
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  return (
    <section ref={ref} className="px-3 py-20 md:px-6" aria-label="Tầm nhìn">
      <motion.div style={{ scale, borderRadius: radius }} className="relative mx-auto max-w-[1500px] overflow-hidden bg-lime text-ink">
        <div className="checker-bg absolute inset-0 opacity-40 mix-blend-multiply" />
        <motion.div style={{ y }} className="pointer-events-none absolute -right-10 top-10 select-none font-display text-[30vw] font-bold leading-none text-ink/[0.06]">
          ♞
        </motion.div>
        <div className="relative px-6 py-20 md:px-16 md:py-28">
          <div className="eyebrow text-ink/60">Tầm nhìn</div>
          <h2 className="mt-5 max-w-5xl font-display text-[clamp(2.1rem,4.8vw,4.8rem)] font-bold uppercase leading-[1.02]">
            Chúng tôi đang xây dựng môn thể thao giải trí tiếp theo — nơi cờ vua, kịch tính sống và khán giả chủ động hội tụ trên cùng một màn hình.
          </h2>
          <p className="mt-6 text-lg font-semibold">ChessCast — chương tiếp theo của giải trí trực tuyến.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/live" variant="dark" size="lg" magnetic>
              <Play size={18} fill="currentColor" /> Vào Arena ngay
            </ButtonLink>
            <ButtonLink href="/investors" variant="outline" size="lg" className="border-ink/30 text-ink hover:border-ink hover:text-ink" magnetic>
              Dành cho nhà đầu tư <ArrowUpRight size={18} />
            </ButtonLink>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
