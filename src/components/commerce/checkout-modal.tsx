"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { getCoinPack, getPlan } from "@/lib/catalog";
import { useUI, useWallet } from "@/lib/store";
import { formatMoney, formatNum } from "@/lib/utils";
import { Button } from "../ui/button";
import { Coin } from "./coin";

type Item = { label: string; description: string; amount: number; coins: number; kind: "coin" | "plan"; id: string; cycle?: "monthly" | "yearly" };

function Burst() {
  const bits = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({ id: i, a: (i / 40) * Math.PI * 2, d: 120 + Math.random() * 160, c: ["#8b7cff", "#3ee6e0", "#ffc56b", "#ff6b9a", "#fff"][i % 5], s: 4 + Math.random() * 5 })),
    [],
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-[42%]">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute block rounded-full"
          style={{ width: b.s, height: b.s, background: b.c, boxShadow: `0 0 10px ${b.c}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(b.a) * b.d, y: Math.sin(b.a) * b.d, opacity: 0, scale: 0.3 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

export function CheckoutModal() {
  const req = useUI((s) => s.checkout);
  const close = () => useUI.getState().openCheckout(null);
  const toast = useUI((s) => s.toast);
  const purchase = useWallet((s) => s.purchase);
  const setPlan = useWallet((s) => s.setPlan);
  const [phase, setPhase] = useState<"review" | "loading" | "demo" | "processing" | "done" | "error">("review");
  const [err, setErr] = useState<string | null>(null);

  const item: Item | null = useMemo(() => {
    if (!req) return null;
    if (req.kind === "coin") {
      const p = getCoinPack(req.id);
      if (!p) return null;
      return { kind: "coin", id: p.id, label: `${p.name} pack`, description: `${formatNum(p.coins)} coins${p.bonus ? ` + ${formatNum(p.bonus)} bonus` : ""}`, amount: p.price, coins: p.coins + p.bonus };
    }
    const p = getPlan(req.id);
    if (!p) return null;
    const yearly = req.cycle === "yearly";
    return { kind: "plan", id: p.id, cycle: yearly ? "yearly" : "monthly", label: `${p.name} · ${yearly ? "yearly" : "monthly"}`, description: p.tagline, amount: yearly ? p.yearly : p.monthly, coins: yearly ? p.monthlyCoins * 12 : p.monthlyCoins };
  }, [req]);

  useEffect(() => {
    if (req) {
      setPhase("review");
      setErr(null);
    }
  }, [req]);

  const pay = async () => {
    if (!item) return;
    setPhase("loading");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: item.kind, id: item.id, cycle: item.cycle }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Payment error");
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      if (j.demo) setPhase("demo");
    } catch (e) {
      setErr((e as Error).message);
      setPhase("error");
    }
  };

  const confirmDemo = async () => {
    if (!item) return;
    setPhase("processing");
    await new Promise((r) => setTimeout(r, 1200));
    purchase({ label: item.label, amount: item.amount, coins: item.coins, provider: "demo" });
    if (item.kind === "plan") setPlan(item.id as "pro" | "lord", item.cycle ?? "monthly");
    setPhase("done");
    toast({ title: "Payment successful", body: item.coins ? `+${formatNum(item.coins)} Chaos Coins added to your wallet.` : undefined });
  };

  return (
    <AnimatePresence>
      {req && item && (
        <motion.div className="fixed inset-0 z-[85] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-void/75 backdrop-blur-lg" onClick={phase === "processing" ? undefined : close} />
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Checkout"
            className="glass-strong relative w-full max-w-[420px] overflow-hidden rounded-[30px]"
            initial={{ y: 40, scale: 0.94, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28, filter: { type: "tween", duration: 0.45, ease: "easeOut" } }}
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-iris/40 blur-[70px]" />
            <div className="relative p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="kicker text-fg-3">Secure checkout</div>
                  <div className="display mt-2 text-[28px]">{item.label}</div>
                  <div className="mt-1 text-sm text-fg-2">{item.description}</div>
                </div>
                <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-fg-2 hover:text-fg" aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              {phase === "done" && <Burst />}
              <div className="mt-6 space-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-2">Total</span>
                  <span className="font-mono text-lg text-fg">{formatMoney(item.amount)}</span>
                </div>
                {item.coins > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-fg-2">
                      <Coin className="h-4 w-4" /> Added to wallet
                    </span>
                    <span className="font-mono text-teal">+{formatNum(item.coins)}</span>
                  </div>
                )}
              </div>
              <AnimatePresence mode="wait">
                {phase === "review" || phase === "loading" || phase === "error" ? (
                  <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <Button className="mt-5 w-full" size="lg" onClick={pay} disabled={phase === "loading"}>
                      {phase === "loading" ? <Loader2 className="animate-spin" size={17} /> : <Lock size={15} />} Continue to payment
                    </Button>
                    {err && <p className="mt-3 text-center text-sm text-rose">{err}</p>}
                    <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-fg-3">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0 text-teal" />
                      Card details are handled directly by the payment provider — ChessCast never stores card numbers. Coins are virtual entertainment items and are never used for betting.
                    </p>
                  </motion.div>
                ) : phase === "demo" || phase === "processing" ? (
                  <motion.div key="d" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5">
                    <div className="rounded-2xl border border-dashed border-violet/40 bg-violet/[0.06] p-4 text-[13px] leading-relaxed text-fg-2">
                      <b className="text-fg">Demo mode.</b> No payment provider is connected yet, so no real money will be charged.
                    </div>
                    <Button className="mt-3 w-full" size="lg" variant="aurora" onClick={confirmDemo} disabled={phase === "processing"}>
                      {phase === "processing" ? <Loader2 className="animate-spin" size={17} /> : null}
                      {phase === "processing" ? "Processing…" : "Confirm test payment"}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="ok" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 text-center">
                    <motion.div
                      className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#8b7cff,#3ee6e0)] text-void"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Check size={26} strokeWidth={2.5} />
                    </motion.div>
                    <div className="display mt-4 text-2xl">Done. Take the stage.</div>
                    <Button className="mt-5 w-full" variant="glass" onClick={close}>
                      Continue
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
