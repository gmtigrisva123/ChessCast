"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { site } from "@/lib/site";
import { Logo } from "../ui/logo";

const cols = [
  { title: "Product", links: [["/live", "Live Arena"], ["/royale", "Chess Royale"], ["/court", "Chess Court"], ["/pricing", "Pricing"]] },
  { title: "Business", links: [["/partners", "Sponsorships"], ["/partners#api", "License / API"], ["/investors", "Investors"], [`mailto:${site.emails.partners}`, "Partnerships"]] },
  { title: "Legal", links: [["/terms", "Terms"], ["/privacy", "Privacy"], ["/terms#coins", "Coin policy"], [`mailto:${site.emails.support}`, "Support"]] },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const o = useTransform(scrollYProgress, [0.3, 1], [0, 1]);
  const w = useTransform(scrollYProgress, [0.2, 1], [80, 125]);
  const fvs = useTransform(w, (v) => `"wght" 800, "wdth" ${v.toFixed(0)}`);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "footer" }) });
    setState(r.ok ? "ok" : "err");
  };
  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/[0.06] bg-void/60">
      <div className="pointer-events-none absolute bottom-[-40%] left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full bg-iris/20 blur-[140px]" />
      <div className="shell relative grid gap-14 py-20 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-fg-2">A stage for every chess game. AI hosts call the moves, the crowd joins in, and the best moments travel everywhere.</p>
          <form onSubmit={submit} className="mt-7 flex max-w-sm items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 focus-within:border-violet/60">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Get the tournament schedule"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-fg-3"
              aria-label="Email"
            />
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-fg text-void transition-transform hover:scale-105" aria-label="Subscribe" disabled={state === "loading"}>
              {state === "ok" ? <Check size={17} /> : <ArrowRight size={17} />}
            </button>
          </form>
          {state === "ok" && <p className="mt-2 text-sm text-teal">You&apos;re in. See you at the next match.</p>}
          {state === "err" && <p className="mt-2 text-sm text-rose">That email doesn&apos;t look right.</p>}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <div className="kicker text-fg-3">{c.title}</div>
              <ul className="mt-4 space-y-3">
                {c.links.map(([href, label]) => (
                  <li key={label}>
                    <Link href={href} className="text-[14.5px] text-fg-2 transition-colors hover:text-fg">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="relative select-none overflow-hidden" aria-hidden>
        <motion.div style={{ y, opacity: o, fontVariationSettings: fvs }} className="text-center font-display text-[15vw] leading-[0.82] tracking-[-0.06em]">
          <span className="bg-gradient-to-b from-white/[0.16] to-white/0 bg-clip-text text-transparent">chesscast</span>
        </motion.div>
      </div>
      <div className="shell relative flex flex-col gap-3 border-t border-white/[0.06] py-6 text-xs text-fg-3 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} ChessCast · Coins are virtual entertainment items — no cash value, never used for betting.</span>
        <div className="flex gap-5">
          {Object.entries(site.socials).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer" className="capitalize hover:text-fg">
              {k}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
