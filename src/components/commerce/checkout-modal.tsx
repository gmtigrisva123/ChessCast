"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { getCoinPack, getPlan } from "@/lib/catalog";
import { useUI, useWallet } from "@/lib/store";
import { formatNum, formatVnd } from "@/lib/utils";
import { Button } from "../ui/button";
import { Coin } from "./coin";

type Item = { label: string; description: string; amount: number; coins: number; kind: "coin" | "plan"; id: string; cycle?: "monthly" | "yearly" };

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 520,
        y: -Math.random() * 380 - 80,
        r: Math.random() * 720 - 360,
        c: ["#d8ff3c", "#ff4d6a", "#48e5ff", "#f2efe7", "#9b7bff"][i % 5],
        s: 6 + Math.random() * 8,
        d: Math.random() * 0.2,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute block rounded-[2px]"
          style={{ width: b.s, height: b.s * 0.5, background: b.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 520], opacity: [1, 1, 0], rotate: b.r }}
          transition={{ duration: 1.8, delay: b.d, ease: [0.2, 0.8, 0.4, 1] }}
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
      return { kind: "coin", id: p.id, label: `Gói ${p.name}`, description: `${formatNum(p.coins)} coin${p.bonus ? ` + ${formatNum(p.bonus)} thưởng` : ""}`, amount: p.price, coins: p.coins + p.bonus };
    }
    const p = getPlan(req.id);
    if (!p) return null;
    const yearly = req.cycle === "yearly";
    return {
      kind: "plan",
      id: p.id,
      cycle: yearly ? "yearly" : "monthly",
      label: `${p.name} · ${yearly ? "Theo năm" : "Theo tháng"}`,
      description: p.tagline,
      amount: yearly ? p.yearly : p.monthly,
      coins: yearly ? p.monthlyCoins * 12 : p.monthlyCoins,
    };
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
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind, id: item.id, cycle: item.cycle }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Lỗi thanh toán");
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
    await new Promise((r) => setTimeout(r, 1300));
    purchase({ label: item.label, amount: item.amount, coins: item.coins, provider: "demo" });
    if (item.kind === "plan") setPlan(item.id as "pro" | "lord", item.cycle ?? "monthly");
    setPhase("done");
    toast({ title: "Thanh toán thành công!", body: item.coins ? `+${formatNum(item.coins)} Chaos Coins đã vào ví.` : undefined });
  };

  return (
    <AnimatePresence>
      {req && item && (
        <motion.div className="fixed inset-0 z-[85] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={phase === "processing" ? undefined : close} />
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Thanh toán"
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-cream/10 bg-ink-2 shadow-2xl"
            initial={{ y: 60, scale: 0.94, rotateX: 12, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ y: 40, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            style={{ transformPerspective: 900 }}
          >
            <div className="relative overflow-hidden bg-lime p-6 text-ink">
              <div className="checker-bg absolute inset-0 opacity-30 mix-blend-multiply" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="eyebrow text-ink/60">Thanh toán</div>
                  <div className="mt-1 font-display text-3xl font-bold uppercase leading-none">{item.label}</div>
                  <div className="mt-2 text-sm text-ink/70">{item.description}</div>
                </div>
                <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-ink/10 hover:bg-ink/20" aria-label="Đóng">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="relative p-6">
              {phase === "done" && <Confetti />}
              <div className="flex items-center justify-between border-b border-cream/10 pb-4">
                <span className="text-cream/60">Tổng cộng</span>
                <span className="font-display text-3xl font-bold">{formatVnd(item.amount)}</span>
              </div>
              {item.coins > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink-3/70 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-cream/70">
                    <Coin className="h-5 w-5" /> Nhận vào ví
                  </span>
                  <span className="font-semibold text-lime">+{formatNum(item.coins)} coin</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {phase === "review" || phase === "loading" || phase === "error" ? (
                  <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Button className="mt-6 w-full" size="lg" onClick={pay} disabled={phase === "loading"}>
                      {phase === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
                      Thanh toán an toàn
                    </Button>
                    {err && <p className="mt-3 text-center text-sm text-pink">{err}</p>}
                    <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-cream/45">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0 text-lime" />
                      Thông tin thẻ được xử lý trực tiếp bởi cổng thanh toán, ChessCast không lưu số thẻ. Coin là vật phẩm giải trí ảo, không quy đổi thành tiền, không dùng để cá cược.
                    </p>
                  </motion.div>
                ) : phase === "demo" || phase === "processing" ? (
                  <motion.div key="demo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6">
                    <div className="rounded-2xl border border-dashed border-lime/40 bg-lime/5 p-4 text-sm text-cream/75">
                      <b className="text-lime">Chế độ demo.</b> Cổng thanh toán chưa được kết nối nên không có khoản tiền thật nào bị trừ. Xác nhận để trải nghiệm luồng mua hàng.
                    </div>
                    <Button className="mt-4 w-full" size="lg" onClick={confirmDemo} disabled={phase === "processing"}>
                      {phase === "processing" ? <Loader2 className="animate-spin" size={18} /> : null}
                      {phase === "processing" ? "Đang xử lý…" : "Xác nhận thanh toán thử"}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 text-center">
                    <motion.div
                      className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-ink"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Check size={30} strokeWidth={3} />
                    </motion.div>
                    <div className="mt-3 font-display text-2xl font-bold uppercase">Xong! Hỗn loạn thôi.</div>
                    <Button className="mt-5 w-full" variant="cream" onClick={close}>
                      Tiếp tục
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
