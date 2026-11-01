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
          <motion.div className="fixed inset-0 z-[80] bg-void/60 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-label="Ví ChessCast"
            data-lenis-prevent
            className="glass-strong fixed bottom-3 right-3 top-3 z-[81] flex w-[calc(100%-24px)] max-w-[420px] flex-col overflow-y-auto rounded-[28px]"
            initial={{ x: "110%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "110%", opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            <div className="flex items-center justify-between p-5">
              <div className="min-w-0">
                <div className="kicker text-fg-3">Ví của bạn</div>
                <input
                  value={w.username}
                  onChange={(e) => w.setUsername(e.target.value.slice(0, 20))}
                  className="mt-1 w-full bg-transparent font-display text-xl font-semibold tracking-tight text-fg outline-none focus:text-violet"
                  aria-label="Tên hiển thị"
                />
              </div>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-fg-2 hover:text-fg" aria-label="Đóng ví">
                <X size={16} />
              </button>
            </div>
            <div className="px-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(139,124,255,0.45),transparent_55%),radial-gradient(90%_80%_at_0%_100%,rgba(62,230,224,0.3),transparent_60%)]" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="kicker text-fg-2">Chaos Coins</span>
                    <Coin className="h-8 w-8" />
                  </div>
                  <motion.div key={w.coins} initial={{ y: 10, opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }} className="display mt-6 text-6xl tabular-nums">
                    {formatNum(w.coins)}
                  </motion.div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-fg-2">Vật phẩm giải trí ảo — không quy đổi thành tiền, không dùng để cá cược.</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ButtonLink href="/pricing#coins" onClick={() => setOpen(false)}>
                  Nạp coin
                </ButtonLink>
                <ButtonLink href="/live" variant="glass" onClick={() => setOpen(false)}>
                  Dùng trong Arena
                </ButtonLink>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet/15 text-violet">
                    <Crown size={17} />
                  </span>
                  <div>
                    <div className="text-xs text-fg-3">Gói hiện tại</div>
                    <div className="text-[15px] font-medium">{plan.name}</div>
                  </div>
                </div>
                {w.plan === "free" ? (
                  <Link href="/pricing" onClick={() => setOpen(false)} className="text-sm text-violet hover:underline">
                    Nâng cấp
                  </Link>
                ) : (
                  <span className="text-xs text-fg-3">Gia hạn {w.planRenewsAt ? new Date(w.planRenewsAt).toLocaleDateString("vi-VN") : ""}</span>
                )}
              </div>

              <h3 className="mt-8 flex items-center gap-2 text-[13px] font-medium text-fg-2">
                <Clapperboard size={15} /> Clip đã lưu · {w.clips.length}
              </h3>
              <div className="mt-3 space-y-1.5">
                {w.clips.length === 0 && <p className="text-[13px] text-fg-3">AI sẽ tự cắt khoảnh khắc kịch tính khi bạn xem Arena.</p>}
                {w.clips.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px]">{c.title}</div>
                      <div className="font-mono text-[11px] text-fg-3">
                        {c.san} · {new Date(c.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <button onClick={() => w.removeClip(c.id)} className="text-fg-3 hover:text-rose" aria-label="Xóa clip">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <h3 className="mt-8 flex items-center gap-2 text-[13px] font-medium text-fg-2">
                <Receipt size={15} /> Giao dịch
              </h3>
              <div className="mt-3 space-y-1.5 pb-8">
                {w.orders.length === 0 && <p className="text-[13px] text-fg-3">Chưa có giao dịch.</p>}
                {w.orders.slice(0, 10).map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5 text-sm">
                    <div>
                      <div className="text-[13.5px]">{o.label}</div>
                      <div className="font-mono text-[11px] text-fg-3">
                        {new Date(o.createdAt).toLocaleDateString("vi-VN")} · {o.provider === "demo" ? "demo" : "stripe"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[13px]">{formatVnd(o.amount)}</div>
                      {o.coins > 0 && <div className="font-mono text-[11px] text-teal">+{formatNum(o.coins)}</div>}
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
