"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { useWallet } from "@/lib/store";
import { useAccount } from "@/lib/account";
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
        if (useAccount.getState().email !== null) {
          // Signed in: the webhook credits the account; pull the server wallet (twice, in case the webhook is a beat behind).
          useAccount.getState().refresh();
          setTimeout(() => useAccount.getState().refresh(), 4000);
          setItem(j.item);
          setState("ok");
          return;
        }
        w.purchase({ label: j.item.label, amount: j.item.amount, coins: j.item.coins, provider: "stripe" }, sessionId);
        if (j.item.kind === "plan") w.setPlan(j.item.id as "pro" | "lord", j.item.cycle ?? "monthly");
        setItem(j.item);
        setState("ok");
      })
      .catch(() => setState("err"));
  }, [sessionId]);

  return (
    <section className="shell grid min-h-[80vh] place-items-center pt-28 text-center">
      <div className="max-w-lg">
        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 text-fg-2">
            <Loader2 className="animate-spin" /> Confirming your payment…
          </div>
        )}
        {state === "ok" && item && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[linear-gradient(135deg,#8b7cff,#3ee6e0)] text-void">
              <Check size={36} strokeWidth={3} />
            </motion.div>
            <h1 className="display mt-6 text-5xl">Payment successful</h1>
            <p className="mt-3 text-fg-2">
              {item.label}
              {item.coins > 0 && (
                <>
                  {" "}— <b className="text-teal">+{formatNum(item.coins)} Chaos Coins</b> added to your wallet.
                </>
              )}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <ButtonLink href="/live">Go cause some chaos</ButtonLink>
              <ButtonLink href="/" variant="glass">
                Home
              </ButtonLink>
            </div>
          </motion.div>
        )}
        {state === "err" && (
          <div>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-rose text-void">
              <X size={36} strokeWidth={3} />
            </div>
            <h1 className="display mt-6 text-4xl">We couldn&apos;t confirm the payment</h1>
            <p className="mt-3 text-fg-2">If you were charged, contact support with your checkout session ID.</p>
            <ButtonLink href="/pricing" className="mt-6">
              Back to pricing
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
