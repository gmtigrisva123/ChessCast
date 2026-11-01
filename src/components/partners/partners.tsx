"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, Check, Code2, Copy, Megaphone } from "lucide-react";
import { B2B_PLANS } from "@/lib/catalog";
import { PageHero } from "../ui/page-hero";
import { Kicker } from "../ui/section";
import { Words } from "../ui/reveal";
import { ContactForm } from "../ui/contact-form";
import { Spotlight } from "../ui/spotlight";
import { cn } from "@/lib/utils";

const SNIPPET = `import { ChessCast } from "@chesscast/sdk";

const cc = new ChessCast({ apiKey: process.env.CHESSCAST_KEY });

// Gắn host AI vào một ván đấu của bạn
const show = await cc.shows.create({
  gameId: "your-game-123",
  hosts: ["gambit", "zugzwang"],
  language: "vi",
});

show.on("commentary", (line) => overlay.say(line));
show.on("chaos.played", (card) => board.apply(card));`;

function highlight(line: string) {
  if (line.trim().startsWith("//")) return `<span style="color:#6c7189">${line.replace(/</g, "&lt;")}</span>`;
  return line
    .replace(/</g, "&lt;")
    .replace(/("[^"]*")/g, '<span style="color:#9ff3ff">$1</span>')
    .replace(/\b(import|from|const|await|new)\b/g, '<span style="color:#b9b0ff">$1</span>')
    .replace(/\b(on|create)\b(?=\()/g, '<span style="color:#ffc56b">$1</span>');
}

function CodeWindow() {
  const [copied, setCopied] = useState(false);
  const lines = SNIPPET.split("\n");
  return (
    <div className="glass-strong overflow-hidden rounded-[26px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
        </div>
        <span className="font-mono text-[11px] text-fg-3">show.ts</span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(SNIPPET);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 font-mono text-[11px] text-fg-3 hover:text-fg"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "đã chép" : "chép"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75]" data-lenis-prevent>
        {lines.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.05 }} className="whitespace-pre">
            <span className="mr-4 inline-block w-4 select-none text-right text-white/15">{i + 1}</span>
            <span className="text-fg/85" dangerouslySetInnerHTML={{ __html: highlight(l) || " " }} />
          </motion.div>
        ))}
      </pre>
      <div className="border-t border-white/[0.06] px-5 py-3 font-mono text-[11px] text-fg-3">Bản xem trước API · đăng ký truy cập sớm bên dưới</div>
    </div>
  );
}

const EVENTS = [
  ["commentary.line", "gambit: “THÍ XE! KHÔNG AI CẢN NỔI!”"],
  ["chaos.played", "fog · bởi viewer_2841 · 50c"],
  ["clip.ready", "clip_9f2a · 0:15 · 9:16"],
  ["court.verdict", "case_0427 · có tội 68%"],
  ["royale.eliminated", "round 3 · KnightPro89"],
  ["commentary.line", "zugzwang: “−2,4. Đúng như dự đoán.”"],
];

function EventStream() {
  const [items, setItems] = useState<{ k: number; e: (typeof EVENTS)[number]; t: string }[]>([]);
  useEffect(() => {
    let k = 0;
    const push = () => {
      const d = new Date();
      setItems((s) => [{ k: k++, e: EVENTS[k % EVENTS.length], t: d.toLocaleTimeString("vi-VN") }, ...s].slice(0, 6));
    };
    push();
    const t = setInterval(push, 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="glass-strong h-[340px] overflow-hidden rounded-[26px] p-4 font-mono text-[12px]">
      <div className="mb-3 flex items-center gap-2 text-fg-3">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-teal" /> webhook · POST /your-endpoint
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.div key={it.k} layout initial={{ opacity: 0, y: -12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0 }} className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
              <span className="text-fg-3">{it.t}</span>
              <span className="text-violet">{it.e[0]}</span>
              <span className="truncate text-fg-2">{it.e[1]}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ICONS = { sponsor: Megaphone, api: Code2, enterprise: Building2 } as const;

function Offerings() {
  const [tab, setTab] = useState(1);
  const p = B2B_PLANS[tab];
  const Icon = ICONS[p.id as keyof typeof ICONS];
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist">
        {B2B_PLANS.map((b, i) => (
          <button key={b.id} role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={cn("relative rounded-full px-5 py-2.5 text-[14px] transition-colors", tab === i ? "text-void" : "text-fg-2 hover:text-fg")}>
            {tab === i && <motion.span layoutId="b2b-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            {tab !== i && <span className="absolute inset-0 rounded-full border border-white/10" />}
            <span className="relative">{b.name}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={p.id} initial={{ opacity: 0, y: 16, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ opacity: 0, y: -10, filter: "blur(8px)" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-6">
          <Spotlight className="grid gap-8 p-7 md:grid-cols-[1.1fr_1fr] md:p-10">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#8b7cff,#3ee6e0)] text-void">
                <Icon size={22} />
              </span>
              <div className="display mt-6 text-4xl">{p.name}</div>
              <p className="mt-3 max-w-md text-[16px] leading-relaxed text-fg-2">{p.description}</p>
              <div className="mt-8 flex items-end gap-2">
                <span className="display text-5xl">{p.price}</span>
                <span className="pb-2 text-fg-3">{p.unit}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <ul className="flex-1 space-y-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15.5px] text-fg-2">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.07]">
                      <Check size={12} strokeWidth={3} className="text-teal" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-fg font-medium text-void transition-transform active:scale-95">
                {p.cta} <ArrowUpRight size={16} />
              </a>
            </div>
          </Spotlight>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PartnersView() {
  return (
    <>
      <PageHero kicker="Đối tác & API" title="Đưa *sân khấu* tới nền tảng của bạn." tone="teal" aside={<CodeWindow />}>
        Thương hiệu tài trợ giải đấu với host AI mang giọng riêng. Nền tảng cờ vua tích hợp bình luận AI, Chaos Cards và clip tự động chỉ với vài dòng code.
      </PageHero>

      <section className="shell py-20">
        <Kicker tone="teal">Cách hợp tác</Kicker>
        <Words text="Ba cách để *cùng tạo kịch tính.*" className="display mb-10 mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" />
        <Offerings />
      </section>

      <section id="api" className="shell grid scroll-mt-28 items-center gap-12 py-24 lg:grid-cols-2">
        <div>
          <Kicker>Webhook thời gian thực</Kicker>
          <Words text="Mọi khoảnh khắc là *một sự kiện.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" />
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-fg-2">Bình luận, Chaos Cards, clip, phán quyết Court, loại khỏi Royale — tất cả được đẩy tới hệ thống của bạn ngay khi xảy ra, kèm SLA 99,9% cho gói API.</p>
        </div>
        <EventStream />
      </section>

      <section id="contact" className="shell grid scroll-mt-28 gap-12 py-24 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Kicker tone="ember">Liên hệ</Kicker>
          <Words text="Kể cho chúng tôi *về sân khấu của bạn.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" accentClass="serif-accent text-ember" />
          <p className="mt-5 max-w-md text-fg-2">Giải đấu, nền tảng hay thương hiệu — bản demo tuỳ biến sẵn sàng trong 24 giờ.</p>
        </div>
        <ContactForm topics={["Tài trợ giải đấu", "License / API", "Enterprise", "Khác"]} />
      </section>
    </>
  );
}
