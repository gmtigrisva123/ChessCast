"use client";

import { motion } from "motion/react";
import { CHAOS_CARDS } from "@/lib/catalog";
import { HoloCard } from "../ui/holo-card";
import { SectionLabel, SplitText } from "../ui/reveal";
import { ButtonLink } from "../ui/button";
import { ArrowUpRight } from "lucide-react";

export function ChaosShowcase() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36" aria-labelledby="chaos-title">
      <div className="pointer-events-none absolute left-1/2 top-40 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-pink/10 blur-[120px]" />
      <div className="container-x relative">
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionLabel tone="pink">Sản phẩm · Chaos Cards</SectionLabel>
            <h2 id="chaos-title" className="mt-4 font-display text-[clamp(2.6rem,7vw,6.5rem)] font-bold uppercase leading-[0.93]">
              <SplitText text="Bộ bài" className="block" />
              <SplitText text="hỗn loạn." className="block text-pink" delay={0.1} />
            </h2>
          </div>
          <div>
            <p className="text-lg text-cream/65">
              Mỗi lá bài là một cú plot-twist mà <b className="text-cream">khán giả</b> trả coin để kích hoạt. Rê chuột lên lá bài để thấy lớp foil holographic — bấm để ném thử trong trận live.
            </p>
            <ButtonLink href="/live" className="mt-6" variant="pink" magnetic>
              Ném thử ngay <ArrowUpRight size={18} />
            </ButtonLink>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-6">
          {CHAOS_CARDS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 80, rotate: (i - 2.5) * 6, rotateY: 90 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 1000 }}
              className={i % 2 ? "xl:mt-10" : ""}
            >
              <HoloCard card={c} compact />
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-cream/40">
          Chaos Coins là vật phẩm giải trí ảo — không quy đổi thành tiền và không bao giờ dùng để cá cược kết quả trận đấu.
        </p>
      </div>
    </section>
  );
}
