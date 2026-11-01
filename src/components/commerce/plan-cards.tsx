"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { COIN_PACKS, PLANS } from "@/lib/catalog";
import { useUI, useWallet } from "@/lib/store";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatNum, formatVnd } from "@/lib/utils";
import { Button } from "../ui/button";
import { Spotlight } from "../ui/spotlight";
import { Coin } from "./coin";

export function BillingToggle({ value, onChange }: { value: "monthly" | "yearly"; onChange: (v: "monthly" | "yearly") => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1" role="tablist" aria-label="Chu kỳ thanh toán">
      {(["monthly", "yearly"] as const).map((v) => (
        <button
          key={v}
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={cn("relative rounded-full px-5 py-2 text-[13.5px] transition-colors", value === v ? "text-void" : "text-fg-2 hover:text-fg")}
        >
          {value === v && <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
          <span className="relative z-10 flex items-center gap-1.5">
            {v === "monthly" ? "Hàng tháng" : "Hàng năm"}
            {v === "yearly" && <span className={cn("rounded-full px-1.5 py-px font-mono text-[10px]", value === v ? "bg-void/10" : "bg-teal/15 text-teal")}>−20%</span>}
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
      <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
        {PLANS.map((p, i) => {
          const price = cycle === "yearly" ? p.yearly : p.monthly;
          const isCurrent = mounted && current === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={cn("relative", p.highlight && "lg:-my-4")}
            >
              <Spotlight className={cn("flex h-full flex-col p-7", p.highlight && "beam bg-gradient-to-b from-iris/[0.16] to-white/[0.02]")}>
                {p.highlight && <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-iris/40 blur-[60px]" />}
                <div className="relative flex items-center justify-between">
                  <div className="font-display text-lg font-semibold tracking-tight">{p.name}</div>
                  {p.highlight && <span className="rounded-full bg-fg px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-void">Được chọn nhiều</span>}
                </div>
                <p className="relative mt-1 text-sm text-fg-2">{p.tagline}</p>
                <div className="relative mt-8 flex h-14 items-end gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={cycle + p.id}
                      initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
                      exit={{ y: -24, opacity: 0, filter: "blur(6px)" }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="display text-[44px] leading-none tabular-nums"
                    >
                      {price === 0 ? "0₫" : formatVnd(price)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="pb-1.5 text-sm text-fg-3">{price === 0 ? "mãi mãi" : cycle === "yearly" ? "/ năm" : "/ tháng"}</span>
                </div>
                {p.monthlyCoins > 0 ? (
                  <div className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-fg-2">
                    <Coin className="h-3.5 w-3.5" /> {formatNum(p.monthlyCoins)} coin mỗi tháng
                  </div>
                ) : (
                  <div className="relative mt-3 h-[26px]" />
                )}
                <div className="relative my-7 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <ul className="relative flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14.5px] text-fg-2">
                      <span className={cn("mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full", p.highlight ? "bg-[linear-gradient(135deg,#8b7cff,#3ee6e0)] text-void" : "bg-white/[0.07] text-fg")}>
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="relative mt-9 w-full"
                  size="lg"
                  variant={p.highlight ? "primary" : "glass"}
                  disabled={isCurrent || p.id === "free"}
                  onClick={() => open({ kind: "plan", id: p.id, cycle })}
                >
                  {isCurrent ? "Gói hiện tại" : p.id === "free" ? "Đang dùng miễn phí" : <>Chọn {p.name} <ArrowUpRight size={16} /></>}
                </Button>
              </Spotlight>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CoinStack({ n }: { n: number }) {
  return (
    <div className="relative h-16 w-16 [perspective:400px]">
      {Array.from({ length: n }).map((_, k) => (
        <motion.div
          key={k}
          className="absolute left-0 right-0 mx-auto"
          style={{ bottom: k * 7, zIndex: k }}
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 6 + k, repeat: Infinity, ease: "linear", delay: k * 0.3 }}
        >
          <Coin className="mx-auto h-12 w-12 drop-shadow-[0_8px_16px_rgba(109,92,255,0.5)]" />
        </motion.div>
      ))}
    </div>
  );
}

export function CoinPacks() {
  const open = useUI((s) => s.openCheckout);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {COIN_PACKS.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
        >
          <Spotlight className="h-full">
            <button onClick={() => open({ kind: "coin", id: p.id })} className="group relative flex h-full w-full flex-col p-6 text-left" aria-label={`Mua gói ${p.name}`}>
              <div className="flex items-start justify-between">
                <CoinStack n={Math.min(4, i + 1)} />
                {p.tag && <span className="rounded-full border border-teal/30 bg-teal/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-teal">{p.tag}</span>}
              </div>
              <div className="mt-6 text-sm text-fg-3">{p.name}</div>
              <div className="display mt-1 text-4xl tabular-nums">
                {formatNum(p.coins)}
                {p.bonus > 0 && <span className="ml-2 align-middle font-mono text-sm font-normal tracking-normal text-teal">+{formatNum(p.bonus)}</span>}
              </div>
              <div className="mt-6 flex w-full items-center justify-between border-t border-white/[0.07] pt-4">
                <span className="font-mono text-[15px]">{formatVnd(p.price)}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] transition-all duration-500 group-hover:rotate-45 group-hover:bg-fg group-hover:text-void">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </button>
          </Spotlight>
        </motion.div>
      ))}
    </div>
  );
}
