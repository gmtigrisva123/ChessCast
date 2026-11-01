"use client";

import { motion } from "motion/react";
import { Check, Minus, X } from "lucide-react";
import { SectionLabel } from "../ui/reveal";
import { cn } from "@/lib/utils";

const ROWS = [
  { name: "Chess.com / Lichess", player: ["Xuất sắc", 3], viewer: ["Cơ bản", 1], ent: ["Không có", 0] },
  { name: "Stream cờ vua trên Twitch", player: ["Không áp dụng", 0], viewer: ["Khá", 2], ent: ["Ngẫu nhiên, không hệ thống", 1] },
  { name: "ChessCast", player: ["Tốt", 2], viewer: ["Thiết kế riêng cho việc xem", 3], ent: ["Cơ chế cốt lõi", 3], hl: true },
] as const;

function Cell({ v, hl }: { v: readonly [string, number]; hl?: boolean }) {
  const [label, score] = v;
  const Icon = score === 0 ? X : score === 1 ? Minus : Check;
  return (
    <div className="flex items-center gap-3">
      <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", hl ? "bg-ink text-lime" : score >= 2 ? "bg-lime/15 text-lime" : score === 1 ? "bg-cream/10 text-cream/60" : "bg-pink/15 text-pink")}>
        <Icon size={14} strokeWidth={3} />
      </span>
      <span className={cn("text-[15px]", hl ? "font-semibold text-ink" : "text-cream/75")}>{label}</span>
    </div>
  );
}

export function Compare() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="cmp-title">
      <div className="container-x">
        <SectionLabel>Cạnh tranh</SectionLabel>
        <h2 id="cmp-title" className="mt-4 max-w-4xl font-display text-[clamp(2.4rem,5.5vw,5rem)] font-bold uppercase leading-[0.95]">
          Chơi được. Xem được. <span className="text-pink">Gây nghiện được.</span>
        </h2>
        <div className="mt-12 overflow-x-auto rounded-[28px] border border-cream/10">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] gap-4 border-b border-cream/10 bg-ink-2 px-6 py-4 text-xs font-bold uppercase tracking-widest text-cream/45">
              <div>Nền tảng</div>
              <div>Cho người chơi</div>
              <div>Cho người xem</div>
              <div>Lớp giải trí</div>
            </div>
            {ROWS.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "relative grid grid-cols-[1.3fr_1fr_1fr_1fr] items-center gap-4 px-6 py-5",
                  "hl" in r ? "bg-lime" : "border-b border-cream/5",
                )}
              >
                <div className={cn("font-display text-xl font-bold uppercase", "hl" in r ? "text-ink" : "text-cream")}>{r.name}</div>
                <Cell v={r.player} hl={"hl" in r} />
                <Cell v={r.viewer} hl={"hl" in r} />
                <Cell v={r.ent} hl={"hl" in r} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
