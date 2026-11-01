"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Kicker } from "./section";
import { Words } from "./reveal";
import { Aurora } from "./aurora";

export function PageHero({
  kicker,
  title,
  children,
  aside,
  tone = "violet",
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
  aside?: ReactNode;
  tone?: "violet" | "ember" | "teal";
}) {
  return (
    <section className="relative overflow-hidden pb-14 pt-36 md:pb-20 md:pt-44">
      <Aurora tone={tone} />
      <div className={`shell relative grid items-center gap-12 ${aside ? "lg:grid-cols-[1.15fr_1fr]" : ""}`}>
        <div className={aside ? "" : "mx-auto max-w-4xl text-center"}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <Kicker tone={tone}>{kicker}</Kicker>
          </motion.div>
          <Words as="h1" onMount delay={0.3} text={title} className="display mt-6 text-[clamp(2.7rem,6.6vw,5.6rem)]" accentClass={tone === "ember" ? "serif-accent text-ember" : "serif-accent text-aurora"} />
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              transition={{ delay: 0.8, duration: 0.9 }}
              className={`mt-6 text-lg leading-relaxed text-fg-2 ${aside ? "max-w-xl" : "mx-auto max-w-2xl"}`}
            >
              {children}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 18, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformPerspective: 1000 }}
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
}
