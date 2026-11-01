"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { Children, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  once = true,
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, gap = 0.08, delay = 0 }: { children: ReactNode; className?: string; gap?: number; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {Children.map(children, (c) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 36, scale: 0.97 },
            show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: EASE } },
          }}
        >
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Chữ tách từng từ, trượt lên từ mặt nạ. */
export function SplitText({
  text,
  className,
  as: Tag = "span",
  delay = 0,
  stagger = 0.06,
  animateOnMount = false,
  wordClassName,
}: {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  animateOnMount?: boolean;
  wordClassName?: (word: string, i: number) => string | undefined;
}) {
  const words = text.split(" ");
  const trigger = animateOnMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-8% 0px" } };
  return (
    <Tag className={className} aria-label={text}>
      <motion.span aria-hidden className="inline" initial="hidden" {...trigger} transition={{ staggerChildren: stagger, delayChildren: delay }}>
        {words.map((w, i) => (
          <span key={i} className="-mt-[0.22em] inline-block overflow-hidden pb-[0.14em] pt-[0.22em] align-bottom">
            <motion.span
              className={cn("inline-block will-change-transform", wordClassName?.(w, i))}
              variants={{
                hidden: { y: "110%", rotate: 4 },
                show: { y: "0%", rotate: 0, transition: { duration: 0.95, ease: EASE } },
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

export function SectionLabel({ children, className, tone = "lime" }: { children: ReactNode; className?: string; tone?: "lime" | "pink" | "ink" }) {
  return (
    <div
      className={cn(
        "eyebrow inline-flex items-center gap-2",
        tone === "lime" && "text-lime",
        tone === "pink" && "text-pink",
        tone === "ink" && "text-ink",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rotate-45", tone === "ink" ? "bg-ink" : tone === "pink" ? "bg-pink" : "bg-lime")} />
      {children}
    </div>
  );
}
