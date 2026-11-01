"use client";

import { motion } from "motion/react";
import { Globe2, Rocket, Users, Zap } from "lucide-react";
import { PageHero } from "../ui/page-hero";
import { Reveal, SectionLabel } from "../ui/reveal";
import { Counter } from "../ui/counter";
import { ContactForm } from "../ui/contact-form";
import { Compare } from "../home/compare";
import { site } from "@/lib/site";

const MARKET = [
  { n: 650, label: "người chơi cờ vua toàn cầu", tag: "TAM", color: "#d8ff3c", size: 100 },
  { n: 120, label: "người xem nội dung game & cờ vua trực tuyến", tag: "SAM", color: "#48e5ff", size: 64 },
  { n: 2, label: "người dùng hoạt động mục tiêu năm đầu", tag: "SOM", color: "#ff4d6a", size: 30 },
];

const REVENUE = [
  ["Chaos Cards", "Khán giả mua thẻ hỗn loạn để can thiệp trực tiếp vào trận đấu", "Khán giả xem live"],
  ["Subscription", "Mở khóa giọng bình luận viên cao cấp và clip không giới hạn", "Người dùng trung thành"],
  ["Tip / Donate", "Khán giả tip để AI host “cà khịa” người chơi theo yêu cầu", "Khán giả xem live"],
  ["Tài trợ giải đấu", "Thương hiệu tài trợ giải đấu nghiệp dư với bình luận viên AI riêng", "Nhà tài trợ"],
  ["License / API", "Bán lớp giải trí hóa này cho các nền tảng cờ vua khác", "Đối tác B2B"],
];

const ROADMAP = [
  { icon: Zap, phase: "Giai đoạn 1", title: "Ra mắt MVP", items: ["Web app với AI bình luận cơ bản", "Chaos Cards bản beta", "Thử nghiệm với cộng đồng cờ vua hiện có"], status: "Đang triển khai" },
  { icon: Users, phase: "Giai đoạn 2", title: "Mở rộng giải trí", items: ["Ra mắt Chess Court và Chess Royale", "Ứng dụng di động", "Host AI thứ hai, mở màn cốt truyện thù hằn"], status: "Tiếp theo" },
  { icon: Globe2, phase: "Giai đoạn 3", title: "Quy mô hóa", items: ["Giải đấu nghiệp dư có tài trợ", "License / API cho nền tảng cờ vua khác", "Smart board phần cứng, phiên bản giới hạn"], status: "Tầm nhìn" },
];

const FUNDS = [
  { pct: 40, label: "Sản phẩm & kỹ thuật", color: "#d8ff3c" },
  { pct: 30, label: "Tăng trưởng & nội dung viral", color: "#ff4d6a" },
  { pct: 15, label: "Vận hành & pháp lý", color: "#48e5ff" },
  { pct: 15, label: "Đội ngũ", color: "#9b7bff" },
];

function Donut() {
  const R = 80;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg viewBox="-110 -110 220 220" className="h-full w-full -rotate-90">
      <circle r={R} fill="none" stroke="rgba(242,239,231,0.06)" strokeWidth="28" />
      {FUNDS.map((f, i) => {
        const len = (f.pct / 100) * C;
        const off = acc;
        acc += len;
        return (
          <motion.circle
            key={f.label}
            r={R}
            fill="none"
            stroke={f.color}
            strokeWidth="28"
            strokeDasharray={`${len - 3} ${C}`}
            initial={{ strokeDashoffset: -off + len }}
            whileInView={{ strokeDashoffset: -off }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ opacity: 1 }}
          />
        );
      })}
    </svg>
  );
}

const TEAM = [
  { code: "CEO", role: "Nhà sáng lập / CEO", exp: "Sản phẩm game, cộng đồng cờ vua, tăng trưởng nền tảng nội dung" },
  { code: "CTO", role: "CTO", exp: "Kỹ thuật AI thời gian thực, livestream, hạ tầng game" },
  { code: "CPO", role: "Giám đốc Sản phẩm / Nội dung", exp: "Sản xuất nội dung giải trí, cộng đồng livestream, esports" },
];

export function InvestorsView() {
  return (
    <>
      <PageHero label="Nhà đầu tư · Vòng hạt giống" title="Môn thể thao" accent="giải trí tiếp theo.">
        ChessCast đặt ba xu hướng — kinh tế livestream, AI giải trí thời gian thực và gamification có trả phí — lên một bàn cờ vua thật. Chúng tôi đang gọi vốn vòng Seed cho 18 tháng vận hành.
      </PageHero>

      <section className="container-x py-16">
        <SectionLabel>Thị trường</SectionLabel>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            {MARKET.map((m, i) => (
              <motion.div
                key={m.tag}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border"
                style={{ width: `${m.size}%`, height: `${m.size}%`, borderColor: m.color, background: `radial-gradient(circle at 50% 100%, ${m.color}22, transparent 70%)` }}
              >
                <span className="absolute left-1/2 top-3 -translate-x-1/2 font-display text-lg font-bold" style={{ color: m.color }}>
                  {m.tag}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="space-y-4">
            {MARKET.map((m, i) => (
              <Reveal key={m.tag} delay={i * 0.1}>
                <div className="flex items-center gap-5 rounded-[24px] border border-cream/10 bg-ink-2 p-6">
                  <div className="font-display text-6xl font-bold leading-none md:text-7xl" style={{ color: m.color }}>
                    <Counter to={m.n} />M
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-cream/45">{m.tag}</div>
                    <div className="text-cream/75">{m.label}</div>
                  </div>
                </div>
              </Reveal>
            ))}
            <p className="text-xs text-cream/40">Số liệu là ước tính ban đầu, cần được xác thực bằng nghiên cứu thị trường trước khi đưa vào tài liệu chính thức.</p>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <SectionLabel>Mô hình kinh doanh</SectionLabel>
        <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] md:text-6xl">5 nguồn thu, 0 cá cược.</h2>
        <div className="mt-8 overflow-x-auto rounded-[28px] border border-cream/10">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-ink-2 text-xs uppercase tracking-widest text-cream/45">
              <tr>
                <th className="px-6 py-4 font-bold">Nguồn thu</th>
                <th className="px-6 py-4 font-bold">Cách hoạt động</th>
                <th className="px-6 py-4 font-bold">Ai trả tiền</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE.map(([a, b, c], i) => (
                <motion.tr key={a} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="border-t border-cream/5">
                  <td className="px-6 py-5 font-display text-xl font-bold uppercase text-lime">{a}</td>
                  <td className="px-6 py-5 text-cream/75">{b}</td>
                  <td className="px-6 py-5 text-cream/60">{c}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-cream/45">Tất cả nguồn thu đều là cơ chế giải trí ảo — không phải cá cược trên kết quả trận đấu.</p>
      </section>

      <section className="container-x py-16">
        <SectionLabel>Lộ trình ra mắt</SectionLabel>
        <div className="relative mt-10 grid gap-5 lg:grid-cols-3">
          <div className="absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-lime via-pink to-violet lg:block" />
          {ROADMAP.map((r, i) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.phase} delay={i * 0.12}>
                <div className="relative h-full rounded-[28px] border border-cream/10 bg-ink-2 p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime text-ink">
                      <Icon size={22} />
                    </span>
                    <span className="rounded-full border border-cream/15 px-3 py-1 text-xs text-cream/60">{r.status}</span>
                  </div>
                  <div className="mt-5 text-xs font-bold uppercase tracking-widest text-pink">{r.phase}</div>
                  <div className="mt-1 font-display text-3xl font-bold uppercase">{r.title}</div>
                  <ul className="mt-4 space-y-2 text-cream/70">
                    {r.items.map((it) => (
                      <li key={it} className="flex gap-2">
                        <span className="text-lime">✦</span> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Compare />

      <section className="container-x py-16">
        <div className="grid items-center gap-10 rounded-[32px] bg-ink-2 p-6 md:p-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionLabel>Gọi vốn · Seed</SectionLabel>
            <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] md:text-6xl">
              Phân bổ <span className="text-lime">vốn</span>
            </h2>
            <p className="mt-4 text-cream/60">Thời gian vận hành dự kiến 18 tháng. Quy mô vòng gọi vốn và điều khoản được chia sẻ trực tiếp với nhà đầu tư quan tâm.</p>
            <div className="mt-6 space-y-3">
              {FUNDS.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: f.color }} />
                  <span className="flex-1 text-cream/75">{f.label}</span>
                  <span className="font-display text-2xl font-bold">{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <Donut />
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <Rocket className="mx-auto text-lime" />
                <div className="mt-1 font-display text-3xl font-bold uppercase">18 tháng</div>
                <div className="text-xs uppercase tracking-widest text-cream/45">runway</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <SectionLabel>Đội ngũ sáng lập</SectionLabel>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TEAM.map((t, i) => (
            <Reveal key={t.role} delay={i * 0.1}>
              <div className="h-full rounded-[28px] border border-cream/10 bg-ink-2 p-7">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-lime to-cyan font-display text-lg font-bold text-ink">{t.code}</div>
                <div className="mt-5 font-display text-2xl font-bold uppercase">{t.role}</div>
                <p className="mt-2 text-cream/60">{t.exp}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contact" className="container-x scroll-mt-28 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionLabel tone="pink">Nhận pitch deck</SectionLabel>
            <h2 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] md:text-6xl">Nói chuyện với nhà sáng lập</h2>
            <p className="mt-4 text-cream/60">
              Gửi thông tin để nhận pitch deck đầy đủ và lịch hẹn. Hoặc email trực tiếp{" "}
              <a href={`mailto:${site.emails.invest}`} className="text-lime hover:underline">
                {site.emails.invest}
              </a>
              .
            </p>
          </div>
          <ContactForm topics={["Đầu tư vòng Seed", "Cố vấn", "Báo chí"]} />
        </div>
      </section>
    </>
  );
}
