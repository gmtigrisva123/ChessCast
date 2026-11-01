"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { HOST_LIST, speak, type HostId } from "@/lib/hosts";
import { HostAvatar } from "../ui/host-avatar";
import { SectionLabel, SplitText } from "../ui/reveal";
import { Tilt } from "../ui/tilt";

export function Hosts() {
  const [talking, setTalking] = useState<HostId | null>(null);
  const play = (id: HostId, text: string) => {
    setTalking(id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    speak(text, id, true);
    setTimeout(() => setTalking(null), 2600);
  };
  return (
    <section className="relative py-28 md:py-36" aria-labelledby="hosts-title">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel>Dàn host AI</SectionLabel>
            <h2 id="hosts-title" className="mt-4 font-display text-[clamp(2.6rem,6.5vw,6rem)] font-bold uppercase leading-[0.93]">
              <SplitText text="Ba cái miệng." className="block" />
              <SplitText text="Một mối thù." className="block text-lime" delay={0.1} />
            </h2>
          </div>
          <p className="max-w-md text-cream/60">
            Mỗi host có giọng nói, cá tính và cốt truyện riêng. Mối thù Gambit — Zugzwang đã bước sang <b className="text-cream">mùa 3</b>, và khán giả có thể tip để MC Blunder “cà khịa” bất kỳ ai.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {HOST_LIST.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <Tilt max={8} className="rounded-[28px]">
                <div className="relative h-full overflow-hidden rounded-[28px] border border-cream/10 bg-ink-2 p-7">
                  <div className="absolute inset-x-0 top-0 h-40 opacity-40" style={{ background: `radial-gradient(ellipse at 50% 0%, ${h.color}, transparent 70%)` }} />
                  <div className="relative flex items-start justify-between">
                    <HostAvatar id={h.id} size={104} talking={talking === h.id} />
                    <span className="rounded-full border border-cream/10 px-3 py-1 text-xs text-cream/50">{h.handle}</span>
                  </div>
                  <h3 className="relative mt-6 font-display text-3xl font-bold uppercase" style={{ color: h.color }}>
                    {h.name}
                  </h3>
                  <div className="relative text-sm font-medium text-cream/50">{h.role}</div>
                  <p className="relative mt-4 text-[15px] leading-relaxed text-cream/70">{h.bio}</p>
                  <blockquote className="relative mt-5 border-l-2 pl-4 font-display text-xl font-semibold uppercase italic leading-tight" style={{ borderColor: h.color }}>
                    “{h.catchphrase}”
                  </blockquote>
                  <div className="relative mt-6 grid grid-cols-2 gap-3">
                    {h.stats.map((s) => (
                      <div key={s.label} className="rounded-2xl bg-ink-3/70 p-3">
                        <div className="font-display text-2xl font-bold">{s.value}</div>
                        <div className="text-xs text-cream/45">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => play(h.id, h.catchphrase)}
                    className="relative mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-cream/15 py-3 text-sm font-semibold transition-colors hover:border-current"
                    style={{ color: h.color }}
                  >
                    {talking === h.id ? <Volume2 size={16} className="animate-pulse" /> : <Mic size={16} />}
                    {talking === h.id ? "Đang nói…" : "Nghe thử giọng"}
                  </button>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
