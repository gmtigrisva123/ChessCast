"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Radio, Cpu, Gem } from "lucide-react";
import { SectionLabel } from "../ui/reveal";
import { LogoMark } from "../ui/logo";

const TRENDS = [
  {
    icon: Radio,
    title: "Kinh tế livestream",
    body: "Twitch, Kick và TikTok Live đã chứng minh khán giả sẵn sàng trả tiền để tương tác với người họ đang xem.",
    color: "#ff4d6a",
    from: [-1, -0.2] as const,
  },
  {
    icon: Cpu,
    title: "AI giải trí thời gian thực",
    body: "Giọng nói và nội dung AI đủ rẻ, đủ nhanh để bình luận trực tiếp mọi trận đấu — không chỉ các ngôi sao.",
    color: "#48e5ff",
    from: [1, -0.2] as const,
  },
  {
    icon: Gem,
    title: "Gamification có trả phí",
    body: "Người dùng đã quen chi tiền cho vật phẩm ảo và yếu tố bất ngờ trong game — không cần đó là cờ bạc thật.",
    color: "#d8ff3c",
    from: [0, 0.9] as const,
  },
];

function Orb({ t, i, p }: { t: (typeof TRENDS)[number]; i: number; p: MotionValue<number> }) {
  const x = useTransform(p, [0, 0.55], [`${t.from[0] * 62}%`, `${t.from[0] * 16}%`]);
  const y = useTransform(p, [0, 0.55], [`${t.from[1] * 62}%`, `${t.from[1] * 16}%`]);
  const scale = useTransform(p, [0, 0.55, 0.8], [0.8, 1, 1.05]);
  const Icon = t.icon;
  return (
    <motion.div
      style={{ x, y, scale }}
      className="absolute left-1/2 top-1/2 -ml-[min(19vw,190px)] -mt-[min(19vw,190px)] grid h-[min(38vw,380px)] w-[min(38vw,380px)] place-items-center rounded-full mix-blend-screen"
    >
      <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${t.color}55, transparent 68%)` }} />
      <div className="absolute inset-0 rounded-full border" style={{ borderColor: t.color + "66", background: `radial-gradient(circle at 30% 30%, ${t.color}22, transparent 70%)` }} />
      <div className="relative flex flex-col items-center px-6 text-center" style={{ transform: `translate(${t.from[0] * 22}%, ${t.from[1] * 22}%)` }}>
        <Icon size={22} style={{ color: t.color }} />
        <div className="mt-2 font-display text-lg font-bold uppercase leading-tight md:text-2xl">{t.title}</div>
      </div>
      <span className="sr-only">{i}</span>
    </motion.div>
  );
}

export function Opportunity() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const logoScale = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const logoRotate = useTransform(scrollYProgress, [0.5, 0.75], [-120, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.62, 0.78], [30, 0]);
  return (
    <section ref={ref} className="relative h-[260vh]" aria-labelledby="opp-title">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden">
        <div className="container-x pt-28">
          <SectionLabel>Bối cảnh · Cơ hội</SectionLabel>
          <h2 id="opp-title" className="mt-4 max-w-4xl font-display text-[clamp(2.4rem,6vw,5.5rem)] font-bold uppercase leading-[0.95]">
            Ba xu hướng hội tụ <span className="text-lime">đúng lúc.</span>
          </h2>
          <p className="mt-4 max-w-xl text-cream/60">Chưa nền tảng nào kết hợp chúng cho cờ vua. Cuộn xuống để thấy chúng va vào nhau.</p>
        </div>
        <div className="relative flex-1">
          {TRENDS.map((t, i) => (
            <Orb key={t.title} t={t} i={i} p={scrollYProgress} />
          ))}
          <motion.div style={{ scale: logoScale, rotate: logoRotate }} className="absolute left-1/2 top-1/2 -ml-12 -mt-12 h-24 w-24 drop-shadow-[0_0_40px_rgba(216,255,60,0.7)]">
            <LogoMark className="h-24 w-24" />
          </motion.div>
        </div>
        <motion.div style={{ opacity: textOpacity, y: textY }} className="container-x no-scrollbar flex gap-3 overflow-x-auto pb-8 md:grid md:grid-cols-3 md:gap-4 md:pb-10">
          {TRENDS.map((t) => (
            <div key={t.title} className="glass min-w-[78%] rounded-2xl p-4 md:min-w-0">
              <div className="text-sm font-semibold" style={{ color: t.color }}>
                {t.title}
              </div>
              <p className="mt-1 text-sm leading-snug text-cream/65">{t.body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
