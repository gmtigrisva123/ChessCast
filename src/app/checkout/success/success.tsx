"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { useWallet } from "@/lib/store";
import { ButtonLink } from "@/components/ui/button";
import { formatNum } from "@/lib/utils";

type Item = { kind: "coin" | "plan"; id: string; cycle?: "monthly" | "yearly"; label: string; amount: number; coins: number };

export function SuccessView() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");
  const [item, setItem] = useState<Item | null>(null);
  useEffect(() => {
    if (!sessionId) {
      setState("err");
      return;
    }
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((j: { paid?: boolean; item?: Item }) => {
        if (!j.paid || !j.item) throw new Error();
        const w = useWallet.getState();
        w.purchase({ label: j.item.label, amount: j.item.amount, coins: j.item.coins, provider: "stripe" }, sessionId);
        if (j.item.kind === "plan") w.setPlan(j.item.id as "pro" | "lord", j.item.cycle ?? "monthly");
        setItem(j.item);
        setState("ok");
      })
      .catch(() => setState("err"));
  }, [sessionId]);

  return (
    <section className="container-x grid min-h-[80vh] place-items-center pt-28 text-center">
      <div className="max-w-lg">
        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 text-cream/60">
            <Loader2 className="animate-spin" /> Đang xác nhận thanh toán…
          </div>
        )}
        {state === "ok" && item && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime text-ink">
              <Check size={36} strokeWidth={3} />
            </motion.div>
            <h1 className="mt-6 font-display text-5xl font-bold uppercase">Thanh toán thành công</h1>
            <p className="mt-3 text-cream/65">
              {item.label}
              {item.coins > 0 && (
                <>
                  {" "}— <b className="text-lime">+{formatNum(item.coins)} Chaos Coins</b> đã vào ví.
                </>
              )}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <ButtonLink href="/live">Vào Arena quậy ngay</ButtonLink>
              <ButtonLink href="/" variant="outline">
                Trang chủ
              </ButtonLink>
            </div>
          </motion.div>
        )}
        {state === "err" && (
          <div>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-pink text-ink">
              <X size={36} strokeWidth={3} />
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold uppercase">Chưa xác nhận được thanh toán</h1>
            <p className="mt-3 text-cream/60">Nếu bạn đã bị trừ tiền, vui lòng liên hệ hỗ trợ kèm mã phiên thanh toán.</p>
            <ButtonLink href="/pricing" className="mt-6">
              Quay lại bảng giá
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
