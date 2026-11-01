"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Check, Copy, Webhook } from "lucide-react";
import { B2B_PLANS } from "@/lib/catalog";
import { PageHero } from "../ui/page-hero";
import { Reveal, SectionLabel } from "../ui/reveal";
import { Tilt } from "../ui/tilt";
import { ContactForm } from "../ui/contact-form";
import { Counter } from "../ui/counter";
import { cn } from "@/lib/utils";

function BrandedBoard() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [62, 48]), { stiffness: 120, damping: 15 });
  const rz = useSpring(useTransform(mx, [-1, 1], [-38, -22]), { stiffness: 120, damping: 15 });
  return (
    <div
      className="relative grid aspect-square w-full max-w-md place-items-center justify-self-end [perspective:1200px]"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
    >
      <motion.div style={{ rotateX: rx, rotateZ: rz }} className="relative aspect-square w-[78%] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-2xl bg-ink shadow-[0_60px_80px_-20px_rgba(0,0,0,0.9)]" style={{ transform: "translateZ(-22px)" }} />
        <div className="absolute -inset-3 rounded-[22px] border-2 border-lime bg-ink-2 shadow-[0_0_40px_rgba(216,255,60,0.35)]" />
        <div className="relative grid h-full w-full grid-cols-8 overflow-hidden rounded-lg">
          {Array.from({ length: 64 }, (_, i) => (
            <div key={i} className={(Math.floor(i / 8) + i) % 2 ? "bg-[#2a2d36]" : "bg-[#b8b09a]"} />
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center" style={{ transform: "translateZ(30px)" }}>
          <div className="rounded-2xl bg-pink px-5 py-3 text-center font-display text-2xl font-bold uppercase text-ink shadow-2xl">
            Thương hiệu
            <br />
            của bạn
          </div>
        </div>
        {[
          ["♜", "8%", "8%"],
          ["♛", "40%", "70%"],
          ["♞", "75%", "20%"],
        ].map(([g, l, t]) => (
          <span key={g} className="absolute text-5xl text-cream drop-shadow-[0_10px_8px_rgba(0,0,0,0.6)]" style={{ left: l, top: t, transform: "translateZ(40px) rotateX(-60deg)" }}>
            {g}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const SNIPPET = `import { ChessCast } from "@chesscast/sdk";

const cc = new ChessCast({ apiKey: process.env.CHESSCAST_KEY });

// 1. Gắn host AI vào một ván đấu của bạn
const show = await cc.shows.create({
  gameId: "lichess:abc123",
  hosts: ["gambit", "zugzwang"],
  language: "vi",
});

// 2. Nhận bình luận theo thời gian thực
show.on("commentary", (line) => overlay.say(line.host, line.text));

// 3. Bật Chaos Cards cho khán giả của bạn
show.on("chaos.played", (card) => board.apply(card.effect));`;

const EVENTS = ["commentary.line", "chaos.played", "clip.ready", "court.verdict", "royale.eliminated"];

export function PartnersView() {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <PageHero label="Đối tác · B2B" title="Lớp giải trí" accent="cho mọi bàn cờ." aside={<BrandedBoard />}>
        Thương hiệu tài trợ giải đấu với host AI mang giọng riêng. Nền tảng cờ vua tích hợp bình luận AI, Chaos Cards và clip viral chỉ bằng vài dòng code.
      </PageHero>

      <section className="container-x py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            [3, "nguồn doanh thu B2B"],
            [99.9, "% SLA cho gói API"],
            [24, "giờ để tích hợp bản thử"],
            [5, "loại webhook sự kiện"],
          ].map(([n, l]) => (
            <Reveal key={l as string}>
              <div className="rounded-[24px] border border-cream/10 bg-ink-2 p-6">
                <div className="font-display text-5xl font-bold text-lime">
                  <Counter to={n as number} format={(v) => (Number.isInteger(n) ? Math.round(v).toString() : v.toFixed(1))} />
                </div>
                <div className="mt-1 text-sm text-cream/55">{l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-20">
        <SectionLabel>Gói doanh nghiệp</SectionLabel>
        <h2 className="mt-3 max-w-3xl font-display text-5xl font-bold uppercase leading-[0.95] md:text-7xl">Chọn cách bạn chơi cùng ChessCast</h2>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {B2B_PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1}>
              <Tilt max={6} className="rounded-[28px]">
                <div className={cn("flex h-full flex-col rounded-[28px] border p-7", i === 1 ? "border-lime/60 bg-gradient-to-b from-lime/10 to-ink-2" : "border-cream/10 bg-ink-2")}>
                  <div className="font-display text-3xl font-bold uppercase">{p.name}</div>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="font-display text-5xl font-bold">{p.price}</span>
                    <span className="pb-1 text-sm text-cream/50">{p.unit}</span>
                  </div>
                  <p className="mt-3 text-cream/60">{p.description}</p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[15px] text-cream/80">
                        <Check size={16} className="mt-1 shrink-0 text-lime" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className={cn("mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full font-semibold transition-transform active:scale-95", i === 1 ? "bg-lime text-ink" : "border border-cream/20 hover:border-lime hover:text-lime")}>
                    {p.cta} <ArrowUpRight size={16} />
                  </a>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="api" className="container-x scroll-mt-28 py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionLabel>License / API</SectionLabel>
            <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] md:text-6xl">
              Ba bước. <span className="text-lime">Một show.</span>
            </h2>
            <p className="mt-4 text-cream/60">SDK cho web và mobile, REST API và webhook. Bạn giữ người chơi, chúng tôi mang kịch tính tới bàn cờ của bạn.</p>
            <div className="mt-6 space-y-2">
              {EVENTS.map((e, i) => (
                <motion.div
                  key={e}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-xl bg-ink-2 px-4 py-2.5 font-mono text-sm"
                >
                  <Webhook size={14} className="text-lime" /> {e}
                </motion.div>
              ))}
            </div>
          </div>
          <Reveal>
            <div className="overflow-hidden rounded-[24px] border border-cream/10 bg-[#0d0e12] shadow-2xl">
              <div className="flex items-center justify-between border-b border-cream/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-pink" />
                  <span className="h-3 w-3 rounded-full bg-[#ffd23c]" />
                  <span className="h-3 w-3 rounded-full bg-lime" />
                </div>
                <span className="font-mono text-xs text-cream/40">show.ts</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(SNIPPET);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="flex items-center gap-1 text-xs text-cream/50 hover:text-lime"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Đã chép" : "Chép"}
                </button>
              </div>
              <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed" data-lenis-prevent>
                <code>
                  {SNIPPET.split("\n").map((line, i) => (
                    <div key={i} className="whitespace-pre">
                      <span className="mr-4 inline-block w-5 select-none text-right text-cream/20">{i + 1}</span>
                      <span
                        className={cn(
                          line.trim().startsWith("//") ? "text-cream/35" : "text-cream/85",
                        )}
                        dangerouslySetInnerHTML={{
                          __html: line.trim().startsWith("//")
                            ? line.replace(/</g, "&lt;")
                            : line
                                .replace(/</g, "&lt;")
                                .replace(/("[^"]*")/g, '<span style="color:#d8ff3c">$1</span>')
                                .replace(/\b(import|from|const|await|new)\b/g, '<span style="color:#ff4d6a">$1</span>')
                                .replace(/\b(on|create)\b(?=\()/g, '<span style="color:#48e5ff">$1</span>'),
                        }}
                      />
                    </div>
                  ))}
                </code>
              </pre>
              <div className="border-t border-cream/10 px-5 py-3 text-xs text-cream/40">Bản xem trước API — đăng ký truy cập sớm qua form liên hệ bên dưới.</div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contact" className="container-x scroll-mt-28 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionLabel>Liên hệ</SectionLabel>
            <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] md:text-6xl">
              Cùng tạo <span className="text-pink">kịch tính.</span>
            </h2>
            <p className="mt-4 text-cream/60">Kể cho chúng tôi về giải đấu, nền tảng hay thương hiệu của bạn. Bản demo tùy biến sẵn sàng trong 24 giờ.</p>
          </div>
          <ContactForm topics={["Tài trợ giải đấu", "License / API", "Enterprise", "Khác"]} />
        </div>
      </section>
    </>
  );
}
