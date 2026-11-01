"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Clapperboard, Play, Share2, Zap } from "lucide-react";
import { SectionLabel } from "../ui/reveal";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Play, title: "Trận đấu bắt đầu", body: "AI vào vai bình luận viên, tường thuật ngay cả một ván đấu vô danh.", color: "#d8ff3c" },
  { icon: Zap, title: "Khán giả mua Chaos Card", body: "Người xem trả coin để can thiệp trực tiếp vào diễn biến trận đấu.", color: "#ff4d6a" },
  { icon: Clapperboard, title: "AI cắt khoảnh khắc cao trào", body: "Hệ thống tự nhận diện kịch tính và dựng thành clip ngắn.", color: "#48e5ff" },
  { icon: Share2, title: "Clip viral kéo người xem mới", body: "Clip lan trên TikTok và Instagram, đưa người xem mới trở lại nền tảng.", color: "#9b7bff" },
];

export function Flywheel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(3, Math.floor(v * 4.2))));
  const rot = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const dash = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const R = 210;

  return (
    <section ref={ref} className="relative h-[300vh]" aria-labelledby="fly-title">
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <div className="container-x grid items-center gap-10 pt-20 lg:grid-cols-2">
          <div>
            <SectionLabel>Cách hoạt động</SectionLabel>
            <h2 id="fly-title" className="mt-4 font-display text-[clamp(2.4rem,5.5vw,5rem)] font-bold uppercase leading-[0.95]">
              Vòng lặp <span className="text-lime">tự nuôi mình.</span>
            </h2>
            <p className="mt-4 max-w-md text-cream/60">Mỗi clip viral mang về người xem mới, người xem mới mua Chaos Card tiếp theo.</p>
            <ol className="mt-8 space-y-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const on = i === active;
                return (
                  <motion.li
                    key={s.title}
                    animate={{ opacity: on ? 1 : 0.38, x: on ? 0 : -6 }}
                    className={cn("flex gap-4 rounded-2xl p-4 transition-colors", on && "bg-ink-2")}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink" style={{ background: s.color }}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <div className="text-xs font-bold tracking-widest" style={{ color: s.color }}>
                        0{i + 1}
                      </div>
                      <div className="font-semibold">{s.title}</div>
                      <motion.p initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} className="overflow-hidden text-sm text-cream/60">
                        {s.body}
                      </motion.p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-[540px] md:block">
            <svg viewBox="-270 -270 540 540" className="h-full w-full">
              <circle r={R} fill="none" stroke="rgba(242,239,231,0.08)" strokeWidth="2" />
              <motion.circle r={R} fill="none" stroke="#d8ff3c" strokeWidth="3" strokeLinecap="round" style={{ pathLength: dash, rotate: -90 }} />
              <motion.g style={{ rotate: rot }}>
                <circle cx={0} cy={-R} r="9" fill="#d8ff3c" />
                <circle cx={0} cy={-R} r="22" fill="#d8ff3c" opacity="0.18" />
              </motion.g>
              {STEPS.map((s, i) => {
                const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(a) * R;
                const y = Math.sin(a) * R;
                const on = i <= active;
                return (
                  <g key={s.title} transform={`translate(${x} ${y})`}>
                    <motion.circle r="34" animate={{ fill: on ? s.color : "#191a20", scale: i === active ? 1.15 : 1 }} stroke={s.color} strokeWidth="2" />
                    <text textAnchor="middle" dy="7" className="font-display" fontSize="22" fontWeight="700" fill={on ? "#121317" : s.color}>
                      0{i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-6xl font-bold uppercase leading-none">∞</div>
                <div className="mt-2 text-xs uppercase tracking-[0.3em] text-cream/50">Viral loop</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
