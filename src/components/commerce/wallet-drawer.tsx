"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";
import { Clapperboard, Crown, Receipt, Trash2, X } from "lucide-react";
import { useUI, useWallet } from "@/lib/store";
import { PLANS } from "@/lib/catalog";
import { formatNum, formatVnd } from "@/lib/utils";
import { Coin } from "./coin";
import { ButtonLink } from "../ui/button";

export function WalletDrawer() {
  const open = useUI((s) => s.walletOpen);
  const setOpen = useUI((s) => s.setWalletOpen);
  const w = useWallet();
  const plan = PLANS.find((p) => p.id === w.plan)!;

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Ví ChessCast"
            data-lenis-prevent
            className="fixed right-0 top-0 z-[81] flex h-dvh w-full max-w-md flex-col overflow-y-auto border-l border-cream/10 bg-ink-2"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-cream/10 p-5">
              <div>
                <div className="eyebrow text-cream/50">Ví của bạn</div>
                <input
                  value={w.username}
                  onChange={(e) => w.setUsername(e.target.value.slice(0, 20))}
                  className="mt-1 w-full bg-transparent font-display text-2xl font-bold text-cream outline-none focus:text-lime"
                  aria-label="Tên hiển thị"
                />
              </div>
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-cream/10 hover:border-lime hover:text-lime" aria-label="Đóng ví">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="relative overflow-hidden rounded-3xl bg-lime p-6 text-ink">
                <div className="checker-bg absolute inset-0 opacity-30 mix-blend-multiply" />
                <div className="relative">
                  <div className="eyebrow text-ink/60">Chaos Coins</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Coin className="h-10 w-10" />
                    <motion.span key={w.coins} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-6xl font-bold leading-none">
                      {formatNum(w.coins)}
                    </motion.span>
                  </div>
                  <p className="mt-3 text-sm text-ink/70">Coin là vật phẩm giải trí ảo, không quy đổi thành tiền và không dùng để cá cược.</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ButtonLink href="/pricing#coins" variant="cream" onClick={() => setOpen(false)}>
                  Nạp coin
                </ButtonLink>
                <ButtonLink href="/live" variant="outline" onClick={() => setOpen(false)}>
                  Dùng ngay
                </ButtonLink>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-cream/10 bg-ink-3/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-pink/15 text-pink">
                    <Crown size={18} />
                  </span>
                  <div>
                    <div className="text-sm text-cream/60">Gói hiện tại</div>
                    <div className="font-semibold">{plan.name}</div>
                  </div>
                </div>
                {w.plan === "free" ? (
                  <Link href="/pricing" onClick={() => setOpen(false)} className="text-sm font-semibold text-lime hover:underline">
                    Nâng cấp →
                  </Link>
                ) : (
                  <span className="text-xs text-cream/50">
                    Gia hạn {w.planRenewsAt ? new Date(w.planRenewsAt).toLocaleDateString("vi-VN") : ""}
                  </span>
                )}
              </div>

              <h3 className="mt-8 flex items-center gap-2 text-sm font-semibold text-cream/70">
                <Clapperboard size={16} /> Clip cao trào đã lưu ({w.clips.length})
              </h3>
              <div className="mt-3 space-y-2">
                {w.clips.length === 0 && <p className="text-sm text-cream/40">Chưa có clip. AI sẽ tự cắt khoảnh khắc kịch tính khi bạn xem live.</p>}
                {w.clips.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-3/60 px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{c.title}</div>
                      <div className="text-xs text-cream/40">
                        {c.san} · {new Date(c.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <button onClick={() => w.removeClip(c.id)} className="text-cream/30 hover:text-pink" aria-label="Xóa clip">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <h3 className="mt-8 flex items-center gap-2 text-sm font-semibold text-cream/70">
                <Receipt size={16} /> Lịch sử giao dịch
              </h3>
              <div className="mt-3 space-y-2 pb-8">
                {w.orders.length === 0 && <p className="text-sm text-cream/40">Chưa có giao dịch nào.</p>}
                {w.orders.slice(0, 10).map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl bg-ink-3/60 px-3 py-2.5 text-sm">
                    <div>
                      <div className="font-medium">{o.label}</div>
                      <div className="text-xs text-cream/40">
                        {new Date(o.createdAt).toLocaleString("vi-VN")} · {o.provider === "demo" ? "Demo" : "Stripe"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatVnd(o.amount)}</div>
                      {o.coins > 0 && <div className="text-xs text-lime">+{formatNum(o.coins)} ◈</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
