"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, CreditCard, Plus, ShieldCheck, Undo2 } from "lucide-react";
import { CHAOS_CARDS } from "@/lib/catalog";
import { useUI } from "@/lib/store";
import { PlanCards, CoinPacks } from "../commerce/plan-cards";
import { PageHero } from "../ui/page-hero";
import { Kicker } from "../ui/section";
import { Reveal, Words } from "../ui/reveal";
import { ChaosCard } from "../ui/chaos-card";
import { LiquidGlass } from "../ui/liquid-glass";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Are Chaos Coins gambling?",
    a: "No. Coins are virtual entertainment items that trigger in-show effects (Chaos Cards, tips for the hosts). They can't be exchanged for money, can't be withdrawn, and are never used to bet on the result of a game.",
  },
  {
    q: "How can I pay?",
    a: "Visa, Mastercard, American Express and the wallets our payment processor supports where available, such as Apple Pay and Google Pay. Card details are handled directly by Stripe — ChessCast never stores your card number.",
  },
  {
    q: "Can I cancel my membership at any time?",
    a: "Yes. Turn off renewal whenever you like — your perks stay active until the end of the period you've paid for, and any coins you've received stay in your wallet.",
  },
  {
    q: "What if a Chaos Card can't take effect?",
    a: "If the position doesn't allow the card to work (for example, there are no pieces left to swap), the system refuses to activate it and no coins are charged.",
  },
  {
    q: "Do players agree to the chaos?",
    a: "Yes. Only games where both players switch on Chaos Mode accept Chaos Cards, and players earn a revenue share from every card thrown into their game.",
  },
  {
    q: "We're a business. Can we sponsor a tournament?",
    a: "See the Partners page for sponsorship packages and License / API, or send us the contact form — the team replies within one business day.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {FAQ.map((f, i) => (
        <div key={f.q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="group flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={open === i}>
            <span className={cn("font-display text-[19px] font-medium tracking-tight transition-colors", open === i ? "text-fg" : "text-fg-2 group-hover:text-fg")}>{f.q}</span>
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors", open === i ? "border-transparent bg-fg text-void" : "border-white/10 text-fg-2")}>
              <Plus size={16} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0, filter: "blur(6px)" }} animate={{ height: "auto", opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <p className="max-w-2xl pb-7 text-[15.5px] leading-relaxed text-fg-2">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function CanceledNotice() {
  const sp = useSearchParams();
  const toast = useUI((s) => s.toast);
  useEffect(() => {
    if (sp.get("canceled")) toast({ title: "Payment canceled", body: "You haven't been charged. Come back any time.", tone: "neutral" });
  }, [sp, toast]);
  return null;
}

const TRUST = [
  { icon: CreditCard, t: "Secure checkout", b: "Payments run on Stripe" },
  { icon: Undo2, t: "Cancel anytime", b: "Perks last the full period" },
  { icon: BadgeCheck, t: "Never gambling", b: "Coins can't be cashed out" },
];

function TrustStrip() {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      {TRUST.map((x, i) => {
        const Icon = x.icon;
        return (
          <motion.div key={x.t} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <LiquidGlass className="flex items-center gap-3 rounded-[22px] px-4 py-3.5" radius={22} bezel={12} depth={10}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.07] text-teal">
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-fg">{x.t}</span>
                <span className="block text-[12.5px] text-fg-3">{x.b}</span>
              </span>
            </LiquidGlass>
          </motion.div>
        );
      })}
    </div>
  );
}

export function PricingView() {
  return (
    <>
      <CanceledNotice />
      <PageHero kicker="Pricing" title="Watch for free. *Cause chaos your way.*">
        Every game is free to watch. Memberships unlock premium host voices and unlimited clips; Chaos Coins put the game in your hands.
      </PageHero>
      <section className="shell pb-24">
        <PlanCards />
        <TrustStrip />
      </section>

      <section id="coins" className="shell scroll-mt-28 py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Kicker tone="teal">Chaos Coins</Kicker>
            <Words text="Top up. *Unleash chaos.*" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" />
          </div>
          <p className="max-w-sm text-fg-2">The bigger the pack, the bigger the bonus. Coins never expire and work in every live game.</p>
        </div>
        <div className="mt-12">
          <CoinPacks />
        </div>
      </section>

      <section className="shell py-24">
        <Kicker tone="ember">Card prices</Kicker>
        <Words text="Six ways to *cause trouble.*" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" accentClass="serif-accent text-ember" />
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {CHAOS_CARDS.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <ChaosCard card={c} />
            </Reveal>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal/20 bg-teal/[0.04] p-4 text-[14px] text-fg-2">
          <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={18} />
          Fan Pro and Chaos Lord members save 10% on every Chaos Card. If a card can't activate, you're never charged.
        </div>
      </section>

      <section className="shell grid gap-12 py-24 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <Kicker>FAQ</Kicker>
          <Words text="Questions? *Ask away.*" className="display mt-5 text-[clamp(2.2rem,4.2vw,3.4rem)]" />
          <p className="mt-5 max-w-sm text-[15px] text-fg-2">Every ChessCast revenue stream is virtual entertainment — never betting on the outcome of a game.</p>
        </div>
        <Faq />
      </section>
    </>
  );
}
