"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function ContactForm({ topics, defaultTopic, className }: { topics: string[]; defaultTopic?: string; className?: string }) {
  const [topic, setTopic] = useState(defaultTopic ?? topics[0]);
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
  const field = "w-full rounded-2xl border border-cream/10 bg-ink-3/60 px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-cream/35 focus:border-lime";
  return (
    <div className={cn("relative overflow-hidden rounded-[28px] border border-cream/10 bg-ink-2 p-6 md:p-8", className)}>
      <AnimatePresence mode="wait">
        {state === "ok" ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid min-h-[380px] place-items-center text-center">
            <div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-ink">
                <Check size={30} strokeWidth={3} />
              </motion.div>
              <div className="mt-4 font-display text-3xl font-bold uppercase">Đã nhận!</div>
              <p className="mt-2 text-cream/60">Đội ngũ ChessCast sẽ phản hồi trong 1 ngày làm việc.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTopic(t)}
                  className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-colors", topic === t ? "border-lime bg-lime text-ink" : "border-cream/15 text-cream/70 hover:border-cream/40")}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Họ và tên" className={field} aria-label="Họ và tên" />
              <input name="email" type="email" required placeholder="Email công việc" className={field} aria-label="Email" />
            </div>
            <input name="company" placeholder="Công ty / Tổ chức" className={field} aria-label="Công ty" />
            <textarea name="message" required minLength={10} rows={5} placeholder="Bạn muốn làm gì cùng ChessCast?" className={cn(field, "resize-none")} aria-label="Lời nhắn" />
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {state === "err" && <p className="text-sm text-pink">{err}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={state === "loading"}>
              {state === "loading" ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />} Gửi cho đội ngũ
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
