"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { HOST_LIST, HOSTS, speak, type HostId } from "@/lib/hosts";
import { HostOrb, VoiceBars } from "../ui/orb";
import { Kicker } from "../ui/section";
import { Words } from "../ui/reveal";
import { cn } from "@/lib/utils";

const SAMPLES: Record<HostId, string[]> = {
  gambit: ["THÍ XE! THÍ CẢ HẬU! ĐÂY MỚI LÀ CỜ VUA!", "Khán giả ơi, ném Chaos Card đi, tôi chịu hết nổi rồi!", "Zugzwang, ông thấy chưa? Đó gọi là ĐAM MÊ!"],
  zugzwang: ["Nước đi này làm thế cờ tụt 2,4 tốt. Tôi không bất ngờ.", "Gambit, la hét không làm nước đi chính xác hơn.", "Nhập thành. Quyết định hợp lý đầu tiên trong 14 nước."],
  blunder: ["Ối dồi ôi, bạn này đánh cờ như đang chơi caro!", "Tip 50 coin là tôi cà khịa liền, nói là làm!", "Vua chạy như bị đòi nợ, cả nhà ơi!"],
};

function Typing({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 24);
    return () => clearInterval(t);
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] animate-pulse-soft bg-fg" />
    </>
  );
}

export function Voices() {
  const [id, setId] = useState<HostId>("gambit");
  const [k, setK] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const host = HOSTS[id];
  useEffect(() => {
    const t = setInterval(() => setK((v) => v + 1), 4200);
    return () => clearInterval(t);
  }, []);
  const line = SAMPLES[id][k % SAMPLES[id].length];
  return (
    <section className="relative py-24 md:py-36" aria-labelledby="voices-title">
      <div className="shell grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Kicker>Dàn host AI</Kicker>
          <Words id="voices-title" text="Ba cá tính. *Ba giọng nói.* Một mối thù kéo dài ba mùa." className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" />
          <div className="mt-10 space-y-2" role="tablist" aria-label="Chọn host">
            {HOST_LIST.map((h) => (
              <button
                key={h.id}
                role="tab"
                aria-selected={id === h.id}
                onClick={() => {
                  setId(h.id);
                  setK(0);
                }}
                className={cn("relative flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors", id === h.id ? "" : "hover:bg-white/[0.03]")}
              >
                {id === h.id && <motion.span layoutId="voice-tab" className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.05]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <HostOrb id={h.id} size={40} talking={id === h.id} className="relative" />
                <div className="relative flex-1">
                  <div className="font-medium">{h.name}</div>
                  <div className="text-[13px] text-fg-3">{h.role}</div>
                </div>
                <span className="relative font-mono text-[11px] text-fg-3">{h.handle}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="relative mx-auto grid aspect-square w-full max-w-[520px] place-items-center">
            <div className="absolute inset-[8%] rounded-full border border-white/[0.06]" />
            <div className="absolute inset-[22%] rounded-full border border-dashed border-white/[0.06]" />
            <motion.div key={id} initial={{ scale: 0.6, opacity: 0, filter: "blur(20px)" }} animate={{ scale: 1, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
              <HostOrb id={id} size={240} talking />
            </motion.div>
            <div className="absolute bottom-[4%] left-1/2 w-[min(420px,92%)] -translate-x-1/2">
              <div className="glass-strong rounded-3xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium" style={{ color: host.color }}>
                    {host.name}
                  </span>
                  <VoiceBars color={host.color} />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={id + k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 min-h-[48px] text-[15px] leading-snug text-fg">
                    <Typing text={line} />
                  </motion.p>
                </AnimatePresence>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                  <p className="text-[12.5px] leading-snug text-fg-3">{host.bio}</p>
                  <button
                    onClick={() => {
                      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                      speak(line, id, true);
                      setSpeaking(true);
                      setTimeout(() => setSpeaking(false), 2500);
                    }}
                    className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-fg px-4 text-[13px] font-medium text-void"
                  >
                    <Volume2 size={15} className={speaking ? "animate-pulse" : ""} /> Nghe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
