"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useUI } from "@/lib/store";

const tone = {
  lime: "#5ff2b0",
  pink: "#ff6b9a",
  cyan: "#3ee6e0",
  neutral: "#a6abbe",
};

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[90] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, y: 10, scale: 0.92, filter: "blur(6px)", transition: { duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32, filter: { type: "tween", duration: 0.45, ease: "easeOut" } }}
            className="glass-strong pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl py-3 pl-4 pr-10"
          >
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: tone[t.tone ?? "lime"], boxShadow: `0 0 12px ${tone[t.tone ?? "lime"]}` }} />
            <div>
              <div className="text-[14px] font-medium text-fg">{t.title}</div>
              {t.body && <div className="mt-0.5 text-[13px] leading-snug text-fg-2">{t.body}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="absolute right-3 top-3 text-fg-3 hover:text-fg" aria-label="Dismiss">
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
