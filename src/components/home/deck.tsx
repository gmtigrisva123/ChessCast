"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CHAOS_CARDS } from "@/lib/catalog";
import { ChaosCard } from "../ui/chaos-card";
import { ChaosIcon } from "../ui/chaos-icon";
import { Kicker } from "../ui/section";
import { Words } from "../ui/reveal";
import { ButtonLink } from "../ui/button";
import { Coin } from "../commerce/coin";

export function Deck() {
  const [sel, setSel] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const card = CHAOS_CARDS[sel];
  const n = CHAOS_CARDS.length;
  return (
    <section className="relative overflow-hidden py-24 md:py-36" aria-labelledby="deck-title">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]" style={{ background: `radial-gradient(closest-side, ${card.tint[0]}33, transparent)` }} />
      <div className="shell relative">
        <div className="mx-auto max-w-3xl text-center">
          <Kicker tone="ember">Bộ bài hỗn loạn</Kicker>
          <Words id="deck-title" text="Sáu lá bài. *Vô số plot-twist.*" className="display mt-5 text-[clamp(2.3rem,5vw,4.2rem)]" accentClass="serif-accent text-ember" />
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-fg-2">Rê qua bộ bài, chọn một lá. Trong Arena, chỉ cần một cú bấm là cả trận đấu đổi chiều.</p>
        </div>

        {/* Quạt bài (desktop) */}
        <div className="relative mx-auto mt-16 hidden h-[400px] max-w-4xl md:block" onMouseLeave={() => setHover(null)}>
          {CHAOS_CARDS.map((c, i) => {
            const mid = (n - 1) / 2;
            const off = i - mid;
            const focus = hover ?? sel;
            const push = hover === null ? 0 : i < focus ? -26 : i > focus ? 26 : 0;
            const isSel = i === sel;
            return (
              <motion.div
                key={c.id}
                className="absolute left-1/2 top-6 w-[210px] origin-[50%_140%]"
                style={{ marginLeft: -105, zIndex: hover === i ? 20 : isSel ? 10 : i }}
                initial={{ rotate: 0, x: 0, y: 60, opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                animate={{ rotate: off * 9, x: off * 92 + push, y: (hover === i ? -36 : isSel ? -22 : 0) + Math.abs(off) * 14 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                onMouseEnter={() => setHover(i)}
                onClick={() => setSel(i)}
              >
                <div className={isSel ? "rounded-3xl ring-2 ring-white/70 ring-offset-4 ring-offset-void" : ""}>
                  <ChaosCard card={c} onClick={() => setSel(i)} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hàng ngang (mobile) */}
        <div className="no-scrollbar -mx-4 mt-12 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:hidden">
          {CHAOS_CARDS.map((c, i) => (
            <div key={c.id} className="w-[170px] shrink-0 snap-center">
              <ChaosCard card={c} size="sm" onClick={() => setSel(i)} />
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.45 }}
              className="glass-strong flex flex-col items-start gap-5 rounded-[28px] p-6 sm:flex-row sm:items-center"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-void" style={{ background: `linear-gradient(135deg, ${card.tint[0]}, ${card.tint[1]})` }}>
                <ChaosIcon icon={card.icon} size={26} />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-xl font-semibold tracking-tight">{card.name}</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10.5px] text-fg-3">{card.rarity}</span>
                </div>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-2">{card.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                <span className="flex items-center gap-1.5 font-mono text-lg">
                  {card.cost} <Coin className="h-4 w-4" />
                </span>
                <ButtonLink href="/live" size="sm">
                  Ném thử <ArrowRight size={14} />
                </ButtonLink>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
