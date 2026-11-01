"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Gavel, Swords, Trophy } from "lucide-react";
import { SectionLabel } from "../ui/reveal";
import { Tilt } from "../ui/tilt";
import { Counter } from "../ui/counter";

export function Modes() {
  return (
    <section className="py-24 md:py-32" aria-labelledby="modes-title">
      <div className="container-x">
        <SectionLabel>Chế độ chơi</SectionLabel>
        <h2 id="modes-title" className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,5rem)] font-bold uppercase leading-[0.95]">
          Không chỉ một ván cờ. <span className="text-lime">Cả một vũ trụ.</span>
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
          <Tilt max={5} className="rounded-[28px] lg:col-span-2 lg:row-span-2">
            <Link href="/royale" className="group relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-[28px] bg-violet p-8 text-ink" data-cursor="view" data-cursor-label="Vào">
              <div className="absolute inset-0 grid grid-cols-10 gap-2 p-6 opacity-[0.12]">
                {Array.from({ length: 100 }, (_, i) => (
                  <motion.span
                    key={i}
                    className="rounded-md bg-ink"
                    animate={{ opacity: [1, 1, 0.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity, delay: (i * 37) % 60 / 10 }}
                  />
                ))}
              </div>
              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet">
                  <Trophy size={14} /> Chess Royale · Mùa 1
                </span>
                <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" size={36} />
              </div>
              <div className="relative">
                <div className="font-display text-[clamp(3.5rem,8vw,7.5rem)] font-bold uppercase leading-[0.95]">
                  <Counter to={100} /> người.
                </div>
                <div className="mt-1 font-display text-[clamp(1.8rem,3.6vw,3.4rem)] font-bold uppercase leading-[1]">Một người sống sót.</div>
                <p className="mt-4 max-w-md text-ink/75">Lưới trận đấu loại trực tiếp. Thua là “nổ” khỏi màn hình. Mỗi vòng có host AI riêng và Chaos Cards từ khán giả.</p>
              </div>
            </Link>
          </Tilt>
          <Tilt max={8} className="rounded-[28px]">
            <Link href="/court" className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[28px] bg-cyan p-7 text-ink" data-cursor="view" data-cursor-label="Xử">
              <div className="flex items-center justify-between">
                <Gavel size={34} />
                <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" size={28} />
              </div>
              <div>
                <div className="font-display text-4xl font-bold uppercase leading-[0.95]">Chess Court</div>
                <p className="mt-2 text-sm text-ink/70">AI công tố buộc tội, khán giả làm bồi thẩm đoàn, hình phạt phát sóng trực tiếp.</p>
              </div>
            </Link>
          </Tilt>
          <Tilt max={8} className="rounded-[28px]">
            <Link href="/live" className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-[28px] bg-pink p-7 text-ink" data-cursor="view" data-cursor-label="Xem">
              <div className="flex items-center justify-between">
                <Swords size={34} />
                <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" size={28} />
              </div>
              <div>
                <div className="font-display text-4xl font-bold uppercase leading-[0.95]">Arena Live</div>
                <p className="mt-2 text-sm text-ink/70">Xem trận 3D, nghe 3 host AI cãi nhau và tự tay ném Chaos Card hoặc tự cầm quân.</p>
              </div>
            </Link>
          </Tilt>
        </div>
      </div>
    </section>
  );
}
