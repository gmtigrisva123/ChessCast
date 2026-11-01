"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

const tones = {
  lime: "border-lime/40 [--tone:var(--color-lime)]",
  pink: "border-pink/40 [--tone:var(--color-pink)]",
  cyan: "border-cyan/40 [--tone:var(--color-cyan)]",
  neutral: "border-cream/15 [--tone:var(--color-cream)]",
};

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 md:left-6 md:translate-x-0" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -40, scale: 0.9, transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn("glass pointer-events-auto relative overflow-hidden rounded-2xl border p-4 pr-10 shadow-2xl", tones[t.tone ?? "lime"])}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-[var(--tone)]" />
            <div className="text-sm font-semibold text-cream">{t.title}</div>
            {t.body && <div className="mt-0.5 text-[13px] leading-snug text-cream/65">{t.body}</div>}
            <button onClick={() => dismiss(t.id)} className="absolute right-3 top-3 text-cream/40 hover:text-cream" aria-label="Đóng">
              <X size={16} />
            </button>
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-[var(--tone)]"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4.2, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
