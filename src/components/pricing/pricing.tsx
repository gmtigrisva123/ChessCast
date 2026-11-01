"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import { CHAOS_CARDS } from "@/lib/catalog";
import { useUI } from "@/lib/store";
import { PlanCards, CoinPacks } from "../commerce/plan-cards";
import { PageHero } from "../ui/page-hero";
import { SectionLabel } from "../ui/reveal";
import { Coin } from "../commerce/coin";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Chaos Coins có phải là cá cược không?",
    a: "Không. Coin là vật phẩm giải trí ảo dùng để kích hoạt hiệu ứng trong show (Chaos Cards, tip cho host). Coin không quy đổi thành tiền, không rút ra được và không bao giờ dùng để đặt cược vào kết quả trận đấu.",
  },
  {
    q: "Tôi thanh toán bằng gì?",
    a: "Thẻ Visa, Mastercard, JCB, American Express cùng Apple Pay và Google Pay qua cổng thanh toán Stripe. Thông tin thẻ được xử lý trực tiếp bởi cổng thanh toán, ChessCast không lưu số thẻ.",
  },
  {
    q: "Tôi có thể huỷ gói thành viên bất cứ lúc nào?",
    a: "Có. Bạn huỷ gia hạn bất kỳ lúc nào; quyền lợi vẫn giữ đến hết chu kỳ đã thanh toán. Coin hàng tháng đã nhận vẫn nằm trong ví.",
  },
  {
    q: "Chaos Card không có tác dụng thì sao?",
    a: "Nếu thế cờ không cho phép lá bài phát huy (ví dụ không còn Mã/Tượng để hoán đổi), hệ thống từ chối kích hoạt và bạn không bị trừ coin.",
  },
  {
    q: "Kỳ thủ có đồng ý bị can thiệp không?",
    a: "Có. Chỉ những trận mà cả hai kỳ thủ bật chế độ “Hỗn loạn” mới nhận Chaos Cards. Kỳ thủ được chia sẻ doanh thu từ Chaos Cards ném vào trận của họ.",
  },
  {
    q: "Doanh nghiệp muốn tài trợ giải đấu thì liên hệ ở đâu?",
    a: "Xem trang Đối tác để biết các gói Tài trợ giải đấu và License/API, hoặc gửi form liên hệ — đội ngũ sẽ phản hồi trong 1 ngày làm việc.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-cream/10 overflow-hidden rounded-[28px] border border-cream/10 bg-ink-2">
      {FAQ.map((f, i) => (
        <div key={f.q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6" aria-expanded={open === i}>
            <span className="text-lg font-semibold">{f.q}</span>
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors", open === i ? "bg-lime text-ink" : "bg-ink-3 text-cream")}>
              {open === i ? <Minus size={16} /> : <Plus size={16} />}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <p className="px-5 pb-6 text-cream/65 md:px-6">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function CanceledNotice() {
  const sp = useSearchParams();
  const toast = useUI((s) => s.toast);
  useEffect(() => {
    if (sp.get("canceled")) toast({ title: "Đã huỷ thanh toán", body: "Bạn chưa bị trừ tiền. Quay lại bất cứ lúc nào.", tone: "neutral" });
  }, [sp, toast]);
  return null;
}

export function PricingView() {
  return (
    <>
      <CanceledNotice />
      <PageHero label="Bảng giá" title="Xem miễn phí." accent="Quậy có phí.">
        Ai cũng xem được mọi trận. Gói thành viên mở khóa giọng host cao cấp và clip không giới hạn; Chaos Coins để bạn tự tay làm đảo lộn trận đấu.
      </PageHero>
      <section className="container-x pb-20">
        <PlanCards />
      </section>

      <section id="coins" className="container-x scroll-mt-28 py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <SectionLabel>Chaos Coins</SectionLabel>
            <h2 className="mt-3 font-display text-5xl font-bold uppercase md:text-7xl">
              Nạp coin, <span className="text-lime">thả hỗn loạn.</span>
            </h2>
          </div>
          <p className="max-w-sm text-cream/60">Gói càng lớn, thưởng càng nhiều. Coin không hết hạn và dùng được ở mọi trận live.</p>
        </div>
        <div className="mt-10">
          <CoinPacks />
        </div>
      </section>

      <section className="container-x py-20">
        <SectionLabel tone="pink">Bảng giá Chaos Cards</SectionLabel>
        <div className="mt-8 overflow-hidden rounded-[28px] border border-cream/10">
          {CHAOS_CARDS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-cream/5 bg-ink-2 px-5 py-4 last:border-0 md:grid-cols-[auto_1.2fr_2fr_auto]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: c.accent + "22", color: c.accent }}>
                {c.glyph}
              </span>
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs uppercase tracking-widest" style={{ color: c.accent }}>
                  {c.rarity} · {c.durationLabel}
                </div>
              </div>
              <p className="hidden text-sm text-cream/60 md:block">{c.description}</p>
              <span className="flex items-center gap-1.5 font-display text-2xl font-bold">
                {c.cost} <Coin className="h-5 w-5" />
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-10 py-20 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionLabel>Câu hỏi thường gặp</SectionLabel>
          <h2 className="mt-3 font-display text-5xl font-bold uppercase">Hỏi gì cũng được</h2>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-lime/30 bg-lime/5 p-4 text-sm text-cream/75">
            <ShieldCheck className="mt-0.5 shrink-0 text-lime" size={18} />
            Tất cả nguồn thu của ChessCast đều là cơ chế giải trí ảo — không phải cá cược trên kết quả trận đấu.
          </div>
        </div>
        <Faq />
      </section>
    </>
  );
}
