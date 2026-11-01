"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { SectionLabel, SplitText } from "./reveal";

export function PageHero({
  label,
  title,
  accent,
  children,
  tone = "lime",
  aside,
}: {
  label: string;
  title: string;
  accent?: string;
  children?: ReactNode;
  tone?: "lime" | "pink";
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-12 pt-32 md:pb-20 md:pt-40">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className={`pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[120px] ${tone === "pink" ? "bg-pink/15" : "bg-lime/10"}`} />
      <div className={`container-x relative grid items-end gap-10 ${aside ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
        <div>
          <SectionLabel tone={tone}>{label}</SectionLabel>
          <h1 className="mt-5 font-display text-[clamp(3rem,9vw,8.5rem)] font-bold uppercase leading-[0.92]">
            <SplitText text={title} animateOnMount delay={0.3} className="block" />
            {accent && <SplitText text={accent} animateOnMount delay={0.5} className={`block ${tone === "pink" ? "text-pink" : "text-lime"}`} />}
          </h1>
          {children && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="mt-6 max-w-2xl text-lg text-cream/65">
              {children}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div initial={{ opacity: 0, y: 30, rotateX: 20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }} style={{ transformPerspective: 900 }}>
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
}
