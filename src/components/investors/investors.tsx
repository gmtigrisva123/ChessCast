"use client";

import { motion } from "motion/react";
import { Building2, Coins, Crown, HandCoins, Megaphone } from "lucide-react";
import { PageHero } from "../ui/page-hero";
import { Kicker } from "../ui/section";
import { Reveal, Words } from "../ui/reveal";
import { Counter } from "../ui/counter";
import { ContactForm } from "../ui/contact-form";
import { Spotlight } from "../ui/spotlight";
import { LiquidGlass } from "../ui/liquid-glass";
import { site } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const THESIS = [
  { t: "The livestream economy", b: "Audiences already pay to interact with the people they watch on Twitch, Kick and TikTok Live.", c: "#8b7cff" },
  { t: "Real-time AI entertainment", b: "AI voice and content are now cheap and fast enough to call every game — not just the ones with star players.", c: "#3ee6e0" },
  { t: "Paid gamification", b: "People happily spend on virtual items and surprise — no gambling required.", c: "#ff8a4c" },
];

const MARKET = [
  { n: 650, tag: "TAM", label: "chess players worldwide", r: 100, c: "#8b7cff" },
  { n: 120, tag: "SAM", label: "people watching online gaming & chess content", r: 66, c: "#3ee6e0" },
  { n: 2, tag: "SOM", label: "target active users in year one", r: 30, c: "#ff8a4c" },
];

const REVENUE = [
  { icon: Coins, name: "Chaos Cards", how: "Viewers buy cards that intervene directly in the live game.", who: "Live viewers" },
  { icon: Crown, name: "Memberships", how: "Unlock premium host voices and unlimited clips.", who: "Loyal fans" },
  { icon: HandCoins, name: "Tips", how: "Viewers tip so the AI hosts roast a player on request.", who: "Live viewers" },
  { icon: Megaphone, name: "Tournament sponsorship", how: "Brands sponsor amateur events with their own AI host.", who: "Sponsors" },
  { icon: Building2, name: "License / API", how: "License the entertainment layer to other chess platforms.", who: "B2B partners" },
];

const ROADMAP = [
  { phase: "Phase 1", title: "MVP launch", items: ["Web app with AI commentary", "Chaos Cards beta", "Pilots with chess communities"], now: true },
  { phase: "Phase 2", title: "Expand the show", items: ["Chess Court & Chess Royale", "Mobile apps", "New AI hosts and the first rivalry storylines"] },
  { phase: "Phase 3", title: "Scale", items: ["Sponsored amateur leagues", "License / API for other platforms", "Limited-edition smart board"] },
];

const FUNDS = [
  { pct: 40, label: "Product & engineering", c: "#8b7cff" },
  { pct: 30, label: "Growth & viral content", c: "#3ee6e0" },
  { pct: 15, label: "Operations & legal", c: "#ffc56b" },
  { pct: 15, label: "Team", c: "#ff6b9a" },
];

const TEAM = [
  ["CEO · Founder", "Game products, chess community, content-platform growth"],
  ["CTO", "Real-time AI, livestreaming, game infrastructure"],
  ["CPO · Content", "Entertainment production, livestream communities, esports"],
];

/** Honest at-a-glance round card for the hero: no invented traction, only what we commit to. */
function RoundCard() {
  const rows: [string, React.ReactNode][] = [
    ["Stage", "Seed · open"],
    ["Runway", "18 months"],
    ["Revenue streams", "5"],
    ["Betting on outcomes", <span key="z" className="text-mint">Zero</span>],
  ];
  return (
    <LiquidGlass className="relative overflow-hidden rounded-[30px] p-6 md:p-7" radius={30} bezel={18} depth={14}>
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(139,124,255,0.45),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(62,230,224,0.3),transparent_65%)] blur-2xl" />
      <div className="relative flex items-center justify-between">
        <span className="kicker text-[10px] text-fg-3">Deal room</span>
        <span className="flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 font-mono text-[10.5px] text-mint">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-mint" /> Round open
        </span>
      </div>
      <div className="relative mt-7 font-display text-[44px] font-semibold leading-none tracking-[-0.04em]">
        Seed <span className="serif-accent text-aurora">round</span>
      </div>
      <p className="relative mt-3 max-w-xs text-[13.5px] leading-relaxed text-fg-2">Building the entertainment layer for the world&apos;s oldest game.</p>
      <div className="relative mt-7 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {rows.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.6, ease: EASE }}
            className="flex items-baseline justify-between py-3 text-[14px]"
          >
            <span className="text-fg-3">{k}</span>
            <span className="font-medium text-fg">{v}</span>
          </motion.div>
        ))}
      </div>
      <div className="relative mt-5 flex h-2 gap-1 overflow-hidden rounded-full">
        {FUNDS.map((f, i) => (
          <motion.span key={f.label} className="h-full rounded-full" style={{ background: f.c }} initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ delay: 1.4 + i * 0.1, duration: 1, ease: EASE }} />
        ))}
      </div>
      <div className="relative mt-2 font-mono text-[10.5px] text-fg-3">Use of funds · see breakdown below</div>
    </LiquidGlass>
  );
}

/** Three trend curves converging on a single board. */
function Convergence() {
  const paths = [
    "M0,24 C320,24 520,110 900,110",
    "M0,110 C320,110 560,110 900,110",
    "M0,196 C320,196 520,110 900,110",
  ];
  return (
    <div className="relative mt-12 hidden md:block">
      <svg viewBox="0 0 1000 220" className="h-auto w-full overflow-visible" aria-hidden>
        <defs>
          {THESIS.map((t, i) => (
            <linearGradient key={t.t} id={`conv-${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor={t.c} stopOpacity="0" />
              <stop offset="0.35" stopColor={t.c} stopOpacity="0.9" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          ))}
          <radialGradient id="conv-glow">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.3" stopColor="#b9b0ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#6d5cff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {paths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke={`url(#conv-${i})`}
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 1.8, delay: i * 0.15, ease: EASE }}
            style={{ filter: `drop-shadow(0 0 6px ${THESIS[i].c})` }}
          />
        ))}
        <motion.circle cx={900} cy={110} r={60} fill="url(#conv-glow)" initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.6, duration: 1, ease: EASE }} style={{ transformOrigin: "900px 110px" }} />
        <motion.circle cx={900} cy={110} r={6} fill="#fff" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.7, type: "spring", stiffness: 300, damping: 14 }} style={{ transformOrigin: "900px 110px" }} />
        <motion.text x={930} y={115} className="fill-fg font-mono text-[13px]" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2 }}>
          ChessCast
        </motion.text>
        {THESIS.map((t, i) => (
          <text key={t.t} x={8} y={[16, 102, 214][i]} className="font-mono text-[12px]" fill={t.c} opacity={0.85}>
            0{i + 1} · {t.t}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** TAM / SAM / SOM as nested glowing rings (stylised, not to scale). */
function MarketRings() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" aria-hidden>
        <defs>
          {MARKET.map((m) => (
            <radialGradient key={m.tag} id={`ring-${m.tag}`} cx="50%" cy="100%" r="100%">
              <stop offset="0" stopColor={m.c} stopOpacity="0.32" />
              <stop offset="0.7" stopColor={m.c} stopOpacity="0.06" />
              <stop offset="1" stopColor={m.c} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        {MARKET.map((m, i) => {
          const r = (m.r / 100) * 190;
          const cy = 395 - r;
          return (
            <motion.g key={m.tag} initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 1.4, delay: i * 0.18, ease: EASE }} style={{ transformOrigin: "200px 395px" }}>
              <circle cx={200} cy={cy} r={r} fill={`url(#ring-${m.tag})`} />
              <motion.circle
                cx={200}
                cy={cy}
                r={r}
                fill="none"
                stroke={m.c}
                strokeWidth={1.4}
                strokeOpacity={0.85}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, delay: 0.2 + i * 0.18, ease: EASE }}
                style={{ filter: `drop-shadow(0 0 8px ${m.c})` }}
              />
              <text x={200} y={cy - r + 26} textAnchor="middle" className="font-mono text-[11px]" fill={m.c}>
                {m.tag}
              </text>
            </motion.g>
          );
        })}
      </svg>
      <div className="absolute bottom-2 right-0 font-mono text-[10px] text-fg-3">not to scale</div>
    </div>
  );
}

/** Animated donut for use of funds. */
function FundsDonut() {
  const R = 74;
  let acc = 0;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx={100} cy={100} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={18} />
        {FUNDS.map((f, i) => {
          const start = acc;
          acc += f.pct / 100;
          return (
            <g key={f.label} transform={`rotate(${start * 360 + 1.6} 100 100)`}>
              <motion.circle
                cx={100}
                cy={100}
                r={R}
                fill="none"
                stroke={f.c}
                strokeWidth={18}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: f.pct / 100 - 0.035 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.18, ease: EASE }}
                style={{ filter: `drop-shadow(0 0 10px ${f.c}88)` }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="display text-5xl">
            <Counter to={18} />
          </div>
          <div className="kicker mt-1 text-[10px] text-fg-3">months runway</div>
        </div>
      </div>
    </div>
  );
}

export function InvestorsView() {
  return (
    <>
      <PageHero kicker="Investors · Seed round" title="We're building the next *entertainment sport.*" aside={<RoundCard />}>
        Chess, live drama and an audience that plays along — all on one screen. Our seed round is open to fund the next 18 months.
      </PageHero>

      <section className="shell py-20">
        <Kicker>Thesis</Kicker>
        <Words text="Three curves. *One board.*" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" />
        <Convergence />
        <div className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {THESIS.map((t, i) => (
            <Reveal key={t.t} delay={i * 0.06}>
              <div className="group grid gap-4 py-8 md:grid-cols-[80px_1fr_1.3fr] md:items-baseline">
                <span className="font-mono text-[13px]" style={{ color: t.c }}>
                  0{i + 1}
                </span>
                <h3 className="display text-[clamp(1.6rem,3vw,2.4rem)] transition-transform duration-500 group-hover:translate-x-2">{t.t}</h3>
                <p className="text-[16px] leading-relaxed text-fg-2">{t.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-[17px] text-fg">
          ChessCast is the first platform to put all three trends <span className="serif-accent text-aurora text-[1.15em]">on a real chessboard.</span>
        </p>
      </section>

      <section className="shell py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Kicker tone="teal">Market</Kicker>
            <Words text="A huge market *nobody is watching.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" />
            <div className="mt-10 space-y-7">
              {MARKET.map((m, i) => (
                <Reveal key={m.tag} delay={i * 0.1}>
                  <div className="flex items-baseline gap-5 border-b border-white/[0.07] pb-6">
                    <span className="w-12 font-mono text-[12px]" style={{ color: m.c }}>
                      {m.tag}
                    </span>
                    <span className="display w-36 text-5xl">
                      <Counter to={m.n} />M
                    </span>
                    <span className="text-[14.5px] text-fg-2">{m.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 text-[12.5px] text-fg-3">Early estimates — to be validated with market research before use in formal documents.</p>
          </div>
          <MarketRings />
        </div>
      </section>

      <section className="shell py-20">
        <Kicker tone="ember">Revenue model</Kicker>
        <Words text="Five revenue streams. *Zero betting.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" accentClass="serif-accent text-ember" />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {REVENUE.map((r, i) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.name} delay={i * 0.06} className="h-full">
                <Spotlight className="group flex h-full flex-col p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(139,124,255,0.25),rgba(62,230,224,0.12))] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon size={19} className="text-fg" />
                  </span>
                  <div className="mt-8 font-display text-lg font-semibold tracking-tight">{r.name}</div>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-fg-2">{r.how}</p>
                  <div className="mt-5 font-mono text-[11px] text-fg-3">→ {r.who}</div>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="shell py-20">
        <Kicker>Roadmap</Kicker>
        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-[11px] hidden h-px md:block">
            <motion.div className="h-full bg-gradient-to-r from-violet via-teal to-white/10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE }} style={{ transformOrigin: "0 50%" }} />
          </div>
          {ROADMAP.map((r, i) => (
            <Reveal key={r.phase} delay={i * 0.12}>
              <div className="relative">
                <span className="relative grid h-6 w-6 place-items-center">
                  {r.now && <span className="absolute inset-0 animate-ping rounded-full bg-violet/50" />}
                  <span className={`h-3 w-3 rounded-full ${r.now ? "bg-violet shadow-[0_0_14px_4px_rgba(139,124,255,0.7)]" : "bg-white/25"}`} />
                </span>
                <div className="mt-6 font-mono text-[11px] text-fg-3">
                  {r.phase}
                  {r.now && " · in progress"}
                </div>
                <div className="display mt-2 text-3xl">{r.title}</div>
                <ul className="mt-4 space-y-2 text-[15px] text-fg-2">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="text-violet">—</span> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell py-20">
        <Spotlight className="p-7 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr_1fr] lg:items-center">
            <div>
              <Kicker tone="teal">Raising · Seed</Kicker>
              <h2 className="display mt-5 text-[clamp(2rem,4vw,3.2rem)]">
                Use of funds over <span className="serif-accent text-aurora">18 months.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] text-fg-2">Round size and terms are shared directly with interested investors.</p>
            </div>
            <FundsDonut />
            <div className="grid gap-5">
              {FUNDS.map((f, i) => (
                <Reveal key={f.label} delay={0.2 + i * 0.08}>
                  <div className="flex items-baseline gap-4 border-b border-white/[0.07] pb-4">
                    <span className="display w-20 text-4xl">
                      <Counter to={f.pct} />%
                    </span>
                    <span className="flex items-center gap-2 text-[14px] text-fg-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.c, boxShadow: `0 0 12px ${f.c}` }} />
                      {f.label}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Spotlight>
      </section>

      <section className="shell py-20">
        <Kicker>Founding team</Kicker>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {TEAM.map(([role, exp], i) => (
            <Reveal key={role} delay={i * 0.08}>
              <Spotlight className="h-full p-6">
                <div className="h-12 w-12 animate-[spin_9s_linear_infinite] rounded-full bg-[conic-gradient(from_120deg,#8b7cff,#3ee6e0,#ffc56b,#8b7cff)] p-[2px]">
                  <div className="h-full w-full rounded-full bg-night" />
                </div>
                <div className="mt-6 font-display text-lg font-semibold tracking-tight">{role}</div>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-2">{exp}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contact" className="shell grid scroll-mt-28 gap-12 py-24 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Kicker tone="ember">Get the pitch deck</Kicker>
          <Words text="Talk to *the founders.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" accentClass="serif-accent text-ember" />
          <p className="mt-5 max-w-md text-fg-2">
            Send your details to receive the full deck and book a meeting, or email us directly at{" "}
            <a href={`mailto:${site.emails.invest}`} className="text-fg underline decoration-white/20 underline-offset-4">
              {site.emails.invest}
            </a>
            .
          </p>
        </div>
        <ContactForm topics={["Seed investment", "Advisory", "Press"]} />
      </section>
    </>
  );
}
