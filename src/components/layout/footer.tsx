"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { site } from "@/lib/site";
import { Logo } from "../ui/logo";
import { Marquee } from "../ui/marquee";

const cols = [
  {
    title: "Sản phẩm",
    links: [
      { href: "/live", label: "Xem Live" },
      { href: "/royale", label: "Chess Royale" },
      { href: "/court", label: "Chess Court" },
      { href: "/pricing", label: "Bảng giá & Coin" },
    ],
  },
  {
    title: "Doanh nghiệp",
    links: [
      { href: "/partners", label: "Tài trợ giải đấu" },
      { href: "/partners#api", label: "License / API" },
      { href: "/investors", label: "Nhà đầu tư" },
      { href: `mailto:${site.emails.partners}`, label: "Liên hệ hợp tác" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { href: "/terms", label: "Điều khoản sử dụng" },
      { href: "/privacy", label: "Chính sách bảo mật" },
      { href: "/terms#coin", label: "Chính sách Chaos Coin" },
      { href: `mailto:${site.emails.support}`, label: "Hỗ trợ" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    const r = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "footer" }) });
    setState(r.ok ? "ok" : "err");
  };
  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-ink">
      <Marquee className="border-b border-cream/10 py-5" duration={40}>
        {["AI bình luận có cá tính", "Chaos Cards", "Chess Court", "Chess Royale", "Clip viral tự động", "Không phải cá cược"].map((t) => (
          <span key={t} className="mx-6 flex items-center gap-6 font-display text-3xl font-bold uppercase text-cream/15">
            {t} <span className="text-lime/40">✦</span>
          </span>
        ))}
      </Marquee>
      <div className="container-x relative grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-cream/60">{site.tagline} Nơi khán giả không chỉ xem, mà can thiệp vào trận đấu.</p>
          <form onSubmit={submit} className="mt-6 flex max-w-sm items-center gap-2 rounded-full border border-cream/15 bg-ink-2 p-1.5 focus-within:border-lime">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email nhận tin giải đấu mới"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-cream/35"
              aria-label="Email"
            />
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-ink" aria-label="Đăng ký" disabled={state === "loading"}>
              {state === "ok" ? <Check size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>
          {state === "ok" && <p className="mt-2 text-sm text-lime">Đã đăng ký! Hẹn gặp ở trận tiếp theo.</p>}
          {state === "err" && <p className="mt-2 text-sm text-pink">Email chưa hợp lệ, thử lại nhé.</p>}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.title}>
              <div className="eyebrow text-cream/40">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="group inline-flex items-center gap-1 text-cream/75 transition-colors hover:text-lime">
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-lime transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="relative select-none overflow-hidden">
        <motion.div
          initial={{ y: "40%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-stroke-thin text-center font-display text-[19vw] font-bold uppercase leading-[0.8] text-cream/15"
          aria-hidden
        >
          ChessCast
        </motion.div>
      </div>
      <div className="container-x flex flex-col items-start justify-between gap-3 border-t border-cream/10 py-6 text-xs text-cream/40 sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} ChessCast. Mọi nguồn thu là cơ chế giải trí ảo — không phải cá cược trên kết quả trận đấu.</span>
        <div className="flex gap-4">
          {Object.entries(site.socials).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer" className="uppercase tracking-widest hover:text-lime">
              {k}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
