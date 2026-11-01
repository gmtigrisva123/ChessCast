"use client";

import { motion, useScroll, useTransform, type HTMLMotionProps, type MotionValue } from "motion/react";
import { Children, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 1, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, gap = 0.07, delay = 0 }: { children: ReactNode; className?: string; gap?: number; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {Children.map(children, (c) => (
        <motion.div
          className="h-full"
          variants={{
            hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE }, transitionEnd: { filter: "none" } },
          }}
        >
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Tiêu đề hiện từng từ (mờ → rõ). Dùng `*chữ*` để đánh dấu từ in nghiêng kiểu serif.
 */
export function Words({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  onMount = false,
  accentClass = "serif-accent text-aurora",
  id,
}: {
  id?: string;
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
  onMount?: boolean;
  accentClass?: string;
}) {
  const tokens = text.split(" ");
  let inAccent = false;
  const words = tokens.map((t) => {
    let w = t;
    const start = w.startsWith("*");
    if (start) {
      inAccent = true;
      w = w.slice(1);
    }
    const end = w.endsWith("*");
    if (end) w = w.slice(0, -1);
    const accent = inAccent;
    if (end) inAccent = false;
    return { w, accent };
  });
  const plain = words.map((x) => x.w).join(" ");
  const trigger = onMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-6% 0px" } };
  return (
    <Tag id={id} className={className} aria-label={plain}>
      <motion.span aria-hidden initial="hidden" {...trigger} transition={{ staggerChildren: 0.055, delayChildren: delay }}>
        {words.map((x, i) => (
          <motion.span
            key={i}
            className={cn("inline-block", x.accent && accentClass, x.accent && "pr-[0.06em]")}
            variants={{
              hidden: { opacity: 0, y: "0.35em", filter: "blur(12px)" },
              show: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: 1.1, ease: EASE }, transitionEnd: { filter: "none" } },
            }}
          >
            {x.w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

function ScrubWord({ children, range, p }: { children: string; range: [number, number]; p: MotionValue<number> }) {
  const o = useTransform(p, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity: o }} className="inline">
      {children}{" "}
    </motion.span>
  );
}

/** Đoạn văn sáng dần theo tiến độ cuộn. */
export function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrubWord key={i} p={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </ScrubWord>
      ))}
    </p>
  );
}
