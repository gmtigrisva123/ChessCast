"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, ShieldCheck } from "lucide-react";
import { CHAOS_CARDS } from "@/lib/catalog";
import { useUI } from "@/lib/store";
import { PlanCards, CoinPacks } from "../commerce/plan-cards";
import { PageHero } from "../ui/page-hero";
import { Kicker } from "../ui/section";
import { Reveal, Words } from "../ui/reveal";
import { ChaosCard } from "../ui/chaos-card";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Chaos Coins có phải là cá cược không?",
    a: "Không. Coin là vật phẩm giải trí ảo dùng để kích hoạt hiệu ứng trong show (Chaos Cards, tip cho host). Coin không quy đổi thành tiền, không rút ra được và không bao giờ dùng để đặt cược vào kết quả trận đấu.",
  },
  {
    q: "Tôi thanh toán bằng gì?",
    a: "Thẻ Visa, Mastercard, JCB và các phương thức ví điện tử mà cổng thanh toán hỗ trợ. Thông tin thẻ được cổng thanh toán xử lý trực tiếp, ChessCast không lưu số thẻ.",
  },
  {
    q: "Tôi có thể huỷ gói thành viên bất cứ lúc nào?",
    a: "Có. Bạn huỷ gia hạn bất kỳ lúc nào; quyền lợi vẫn giữ đến hết chu kỳ đã thanh toán. Coin đã nhận vẫn nằm trong ví.",
  },
  {
    q: "Chaos Card không có tác dụng thì sao?",
    a: "Nếu thế cờ không cho phép lá bài phát huy (ví dụ không còn quân để hoán đổi), hệ thống từ chối kích hoạt và bạn không bị trừ coin.",
  },
  {
    q: "Kỳ thủ có đồng ý bị can thiệp không?",
    a: "Có. Chỉ những trận mà cả hai kỳ thủ bật chế độ “Hỗn loạn” mới nhận Chaos Cards, và kỳ thủ được chia sẻ doanh thu từ những lá bài ném vào trận của họ.",
  },
  {
    q: "Doanh nghiệp muốn tài trợ giải đấu thì sao?",
    a: "Xem trang Đối tác để biết các gói tài trợ và License/API, hoặc gửi form liên hệ — đội ngũ phản hồi trong 1 ngày làm việc.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {FAQ.map((f, i) => (
        <div key={f.q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="group flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={open === i}>
            <span className={cn("font-display text-[19px] font-medium tracking-tight transition-colors", open === i ? "text-fg" : "text-fg-2 group-hover:text-fg")}>{f.q}</span>
            <motion.span animate={{ rotate: open === i ? 45 : 0 }} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors", open === i ? "border-transparent bg-fg text-void" : "border-white/10 text-fg-2")}>
              <Plus size={16} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0, filter: "blur(6px)" }} animate={{ height: "auto", opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                <p className="max-w-2xl pb-7 text-[15.5px] leading-relaxed text-fg-2">{f.a}</p>
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
      <PageHero kicker="Bảng giá" title="Xem miễn phí. *Quậy theo cách của bạn.*">
        Mọi trận đều xem được. Gói thành viên mở khoá giọng host cao cấp và clip không giới hạn; Chaos Coins để bạn tự tay bẻ lái trận đấu.
      </PageHero>
      <section className="shell pb-24">
        <PlanCards />
      </section>

      <section id="coins" className="shell scroll-mt-28 py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Kicker tone="teal">Chaos Coins</Kicker>
            <Words text="Nạp coin. *Thả hỗn loạn.*" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" />
          </div>
          <p className="max-w-sm text-fg-2">Gói càng lớn, thưởng càng nhiều. Coin không hết hạn và dùng được ở mọi trận live.</p>
        </div>
        <div className="mt-12">
          <CoinPacks />
        </div>
      </section>

      <section className="shell py-24">
        <Kicker tone="ember">Giá từng lá bài</Kicker>
        <Words text="Sáu cách để *làm loạn.*" className="display mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]" accentClass="serif-accent text-ember" />
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {CHAOS_CARDS.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <ChaosCard card={c} />
            </Reveal>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal/20 bg-teal/[0.04] p-4 text-[14px] text-fg-2">
          <ShieldCheck className="mt-0.5 shrink-0 text-teal" size={18} />
          Thành viên Fan Pro và Chaos Lord được giảm 10% mọi Chaos Card. Lá bài không kích hoạt được thì không bị trừ coin.
        </div>
      </section>

      <section className="shell grid gap-12 py-24 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <Kicker>Câu hỏi thường gặp</Kicker>
          <Words text="Còn thắc mắc? *Hỏi đi.*" className="display mt-5 text-[clamp(2.2rem,4.2vw,3.4rem)]" />
          <p className="mt-5 max-w-sm text-[15px] text-fg-2">Mọi nguồn thu của ChessCast là cơ chế giải trí ảo — không phải cá cược trên kết quả trận đấu.</p>
        </div>
        <Faq />
      </section>
    </>
  );
}
