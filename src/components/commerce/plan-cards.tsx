"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { COIN_PACKS, PLANS } from "@/lib/catalog";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatNum, formatVnd } from "@/lib/utils";
import { Button } from "../ui/button";
import { Tilt } from "../ui/tilt";
import { Coin } from "./coin";

export function BillingToggle({ value, onChange }: { value: "monthly" | "yearly"; onChange: (v: "monthly" | "yearly") => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-cream/10 bg-ink-2 p-1" role="tablist" aria-label="Chu kỳ thanh toán">
      {(["monthly", "yearly"] as const).map((v) => (
        <button
          key={v}
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={cn("relative rounded-full px-5 py-2 text-sm font-semibold transition-colors", value === v ? "text-ink" : "text-cream/60 hover:text-cream")}
        >
          {value === v && <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
          <span className="relative z-10">
            {v === "monthly" ? "Theo tháng" : "Theo năm"}
            {v === "yearly" && <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]", value === v ? "bg-ink/15" : "bg-pink/20 text-pink")}>-20%</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

export function PlanCards({ className }: { className?: string }) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const open = useUI((s) => s.openCheckout);
  const current = useWallet((s) => s.plan);
  const mounted = useMounted();
  return (
    <div className={className}>
      <div className="flex justify-center">
        <BillingToggle value={cycle} onChange={setCycle} />
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p, i) => {
          const price = cycle === "yearly" ? p.yearly : p.monthly;
          const isCurrent = mounted && current === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Tilt max={6} className="h-full rounded-[28px]">
                <div
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-[28px] border p-7",
                    p.highlight ? "border-lime/60 bg-gradient-to-b from-lime/[0.12] to-ink-2" : "border-cream/10 bg-ink-2",
                  )}
                >
                  {p.highlight && (
                    <>
                      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/25 blur-3xl" />
                      <span className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">
                        <Sparkles size={12} /> Phổ biến nhất
                      </span>
                    </>
                  )}
                  <div className="relative">
                    <div className="font-display text-3xl font-bold uppercase">{p.name}</div>
                    <p className="mt-1 text-sm text-cream/60">{p.tagline}</p>
                    <div className="mt-6 flex items-end gap-1">
                      <motion.span key={cycle + p.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-5xl font-bold leading-none">
                        {price === 0 ? "0₫" : formatVnd(price)}
                      </motion.span>
                      <span className="pb-1 text-sm text-cream/50">{price === 0 ? "mãi mãi" : cycle === "yearly" ? "/ năm" : "/ tháng"}</span>
                    </div>
                    {p.monthlyCoins > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink-3 px-3 py-1 text-xs font-semibold text-lime">
                        <Coin className="h-3.5 w-3.5" /> +{formatNum(p.monthlyCoins)} coin mỗi tháng
                      </div>
                    )}
                  </div>
                  <ul className="relative mt-6 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[15px] text-cream/80">
                        <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", p.highlight ? "bg-lime text-ink" : "bg-cream/10 text-lime")}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="relative mt-8 w-full"
                    size="lg"
                    variant={p.highlight ? "lime" : p.id === "free" ? "outline" : "cream"}
                    disabled={isCurrent || p.id === "free"}
                    onClick={() => open({ kind: "plan", id: p.id, cycle })}
                  >
                    {isCurrent ? "Gói hiện tại" : p.id === "free" ? "Miễn phí — đã kích hoạt" : `Nâng cấp ${p.name}`}
                  </Button>
                </div>
              </Tilt>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function CoinPacks() {
  const open = useUI((s) => s.openCheckout);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COIN_PACKS.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformPerspective: 900 }}
        >
          <Tilt max={10} className="rounded-3xl">
            <button
              onClick={() => open({ kind: "coin", id: p.id })}
              className="group relative flex w-full flex-col items-start overflow-hidden rounded-3xl border border-cream/10 bg-ink-2 p-6 text-left transition-colors hover:border-lime/60"
              data-cursor="view"
              data-cursor-label="Mua"
            >
              <div className="checker-bg absolute inset-0 opacity-40" />
              {p.tag && <span className="absolute right-4 top-4 rounded-full bg-pink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">{p.tag}</span>}
              <div className="relative flex items-center">
                {Array.from({ length: Math.min(4, i + 1) }).map((_, k) => (
                  <motion.span
                    key={k}
                    className="-ml-2 first:ml-0"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.2 }}
                  >
                    <Coin className="h-10 w-10 drop-shadow-[0_6px_14px_rgba(216,255,60,0.35)]" />
                  </motion.span>
                ))}
              </div>
              <div className="relative mt-5 text-sm font-semibold uppercase tracking-widest text-cream/50">{p.name}</div>
              <div className="relative mt-1 font-display text-4xl font-bold">
                {formatNum(p.coins)}
                {p.bonus > 0 && <span className="ml-2 text-lg text-lime">+{formatNum(p.bonus)}</span>}
              </div>
              <div className="relative mt-5 flex w-full items-center justify-between border-t border-cream/10 pt-4">
                <span className="text-lg font-semibold">{formatVnd(p.price)}</span>
                <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink transition-transform duration-300 group-hover:scale-110">Mua</span>
              </div>
            </button>
          </Tilt>
        </motion.div>
      ))}
    </div>
  );
}
