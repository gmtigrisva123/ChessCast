"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Coins, Crown, Gavel, Handshake, Home, LineChart, Search, Swords, Trophy, Wallet } from "lucide-react";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string; hint: string; icon: typeof Home; run: () => void; group: string };

export function CommandMenu() {
  const open = useUI((s) => s.commandOpen);
  const setOpen = useUI((s) => s.setCommandOpen);
  const setWallet = useUI((s) => s.setWalletOpen);
  const openCheckout = useUI((s) => s.openCheckout);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => router.push(href);
    return [
      { id: "home", label: "Trang chủ", hint: "/", icon: Home, run: go("/"), group: "Đi tới" },
      { id: "live", label: "Arena trực tiếp", hint: "/live", icon: Swords, run: go("/live"), group: "Đi tới" },
      { id: "royale", label: "Chess Royale", hint: "/royale", icon: Trophy, run: go("/royale"), group: "Đi tới" },
      { id: "court", label: "Chess Court", hint: "/court", icon: Gavel, run: go("/court"), group: "Đi tới" },
      { id: "pricing", label: "Bảng giá", hint: "/pricing", icon: Coins, run: go("/pricing"), group: "Đi tới" },
      { id: "partners", label: "Đối tác & API", hint: "/partners", icon: Handshake, run: go("/partners"), group: "Đi tới" },
      { id: "investors", label: "Nhà đầu tư", hint: "/investors", icon: LineChart, run: go("/investors"), group: "Đi tới" },
      { id: "wallet", label: "Mở ví coin", hint: "Ví", icon: Wallet, run: () => setWallet(true), group: "Hành động" },
      { id: "buy", label: "Mua gói 650 coin", hint: "119.000₫", icon: Coins, run: () => openCheckout({ kind: "coin", id: "fan" }), group: "Hành động" },
      { id: "pro", label: "Nâng cấp Fan Pro", hint: "79.000₫/tháng", icon: Crown, run: () => openCheckout({ kind: "plan", id: "pro", cycle: "monthly" }), group: "Hành động" },
    ];
  }, [router, setWallet, openCheckout]);

  const filtered = items.filter((i) => (i.label + i.hint).toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUI.getState().commandOpen);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => input.current?.focus(), 30);
    }
  }, [open]);

  const run = (i: Item) => {
    setOpen(false);
    i.run();
  };

  let lastGroup = "";
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[14vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-void/70 backdrop-blur-md" onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-label="Bảng lệnh"
            className="glass-strong relative w-full max-w-xl overflow-hidden rounded-3xl"
            initial={{ y: -16, scale: 0.97, filter: "blur(8px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5">
              <Search size={18} className="text-fg-3" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setIdx((i) => Math.min(filtered.length - 1, i + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setIdx((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter" && filtered[idx]) run(filtered[idx]);
                }}
                placeholder="Tìm trang, mua coin, nâng cấp…"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-fg-3"
                aria-label="Tìm lệnh"
              />
              <span className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-fg-3">ESC</span>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
              {filtered.length === 0 && <div className="px-4 py-10 text-center text-sm text-fg-3">Không tìm thấy gì cho “{q}”.</div>}
              {filtered.map((it, i) => {
                const header = it.group !== lastGroup ? it.group : null;
                lastGroup = it.group;
                const Icon = it.icon;
                return (
                  <div key={it.id}>
                    {header && <div className="kicker px-3 pb-1 pt-3 text-[10px] text-fg-3">{header}</div>}
                    <button
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => run(it)}
                      className={cn("relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[14px] transition-colors", idx === i ? "text-fg" : "text-fg-2")}
                    >
                      {idx === i && <motion.span layoutId="cmd-active" className="absolute inset-0 rounded-2xl bg-white/[0.07]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-white/[0.05] ring-1 ring-white/10">
                        <Icon size={15} />
                      </span>
                      <span className="relative flex-1">{it.label}</span>
                      <span className="relative font-mono text-[11px] text-fg-3">{it.hint}</span>
                      {idx === i && <ArrowRight size={14} className="relative text-violet" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
