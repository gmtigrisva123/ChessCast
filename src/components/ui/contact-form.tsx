"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function ContactForm({ topics, className }: { topics: string[]; className?: string }) {
  const [topic, setTopic] = useState(topics[0]);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("loading");
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(fd.entries()), topic }),
    });
    if (r.ok) setState("ok");
    else {
      const j = await r.json().catch(() => ({}));
      setErr(j.error ?? "Có lỗi xảy ra.");
      setState("err");
    }
  };
  const field =
    "peer w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 pb-2.5 pt-6 text-[15px] text-fg outline-none transition-colors placeholder-transparent focus:border-violet/70 focus:bg-white/[0.05]";
  const label = "pointer-events-none absolute left-4 top-2 text-[11px] text-fg-3 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-violet";
  return (
    <div className={cn("glass-strong relative overflow-hidden rounded-[28px] p-6 md:p-8", className)}>
      <AnimatePresence mode="wait">
        {state === "ok" ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[380px] place-items-center text-center">
            <div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(135deg,#8b7cff,#3ee6e0)] text-void">
                <Check size={30} strokeWidth={2.5} />
              </motion.div>
              <div className="display mt-5 text-3xl">Đã nhận được.</div>
              <p className="mt-2 text-fg-2">Đội ngũ ChessCast sẽ phản hồi trong 1 ngày làm việc.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-wrap gap-2 pb-2">
              {topics.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className={cn("relative rounded-full px-4 py-2 text-sm transition-colors", topic === t ? "text-void" : "text-fg-2 hover:text-fg")}
                >
                  {topic === t && <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  {topic !== t && <span className="absolute inset-0 rounded-full border border-white/10" />}
                  <span className="relative">{t}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <input id="cf-name" name="name" required placeholder="Họ và tên" className={field} />
                <label htmlFor="cf-name" className={label}>Họ và tên</label>
              </div>
              <div className="relative">
                <input id="cf-email" name="email" type="email" required placeholder="Email" className={field} />
                <label htmlFor="cf-email" className={label}>Email công việc</label>
              </div>
            </div>
            <div className="relative">
              <input id="cf-company" name="company" placeholder="Công ty" className={field} />
              <label htmlFor="cf-company" className={label}>Công ty / Tổ chức</label>
            </div>
            <div className="relative">
              <textarea id="cf-msg" name="message" required minLength={10} rows={5} placeholder="Lời nhắn" className={cn(field, "resize-none")} />
              <label htmlFor="cf-msg" className={label}>Bạn muốn làm gì cùng ChessCast?</label>
            </div>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {state === "err" && <p className="text-sm text-rose">{err}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={state === "loading"}>
              {state === "loading" ? <Loader2 size={18} className="animate-spin" /> : null} Gửi cho đội ngũ <ArrowUpRight size={16} />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
