"use client";

import { motion } from "motion/react";
import { Building2, Coins, Crown, HandCoins, Megaphone } from "lucide-react";
import { PageHero } from "../ui/page-hero";
import { Kicker } from "../ui/section";
import { Reveal, Words } from "../ui/reveal";
import { Counter } from "../ui/counter";
import { ContactForm } from "../ui/contact-form";
import { Spotlight } from "../ui/spotlight";
import { site } from "@/lib/site";

const THESIS = [
  ["Kinh tế livestream", "Khán giả đã quen trả tiền để tương tác với người họ đang xem trên Twitch, Kick, TikTok Live."],
  ["AI giải trí thời gian thực", "Giọng nói và nội dung AI đủ rẻ, đủ nhanh để bình luận mọi trận — không chỉ trận của ngôi sao."],
  ["Gamification có trả phí", "Người dùng sẵn sàng chi cho vật phẩm ảo và yếu tố bất ngờ, mà không cần tới cờ bạc."],
];

const MARKET = [
  { n: 650, tag: "TAM", label: "người chơi cờ vua toàn cầu", w: 100, tint: "linear-gradient(90deg,#6d5cff,#8b7cff)" },
  { n: 120, tag: "SAM", label: "người xem nội dung game & cờ vua trực tuyến", w: 62, tint: "linear-gradient(90deg,#4d8dff,#3ee6e0)" },
  { n: 2, tag: "SOM", label: "người dùng hoạt động mục tiêu năm đầu", w: 18, tint: "linear-gradient(90deg,#ff8a4c,#ff6b9a)" },
];

const REVENUE = [
  { icon: Coins, name: "Chaos Cards", how: "Khán giả mua lá bài để can thiệp trực tiếp vào trận đấu", who: "Khán giả xem live" },
  { icon: Crown, name: "Gói thành viên", how: "Mở khoá giọng host cao cấp và clip không giới hạn", who: "Người dùng trung thành" },
  { icon: HandCoins, name: "Tip", how: "Khán giả tip để host AI “cà khịa” kỳ thủ theo yêu cầu", who: "Khán giả xem live" },
  { icon: Megaphone, name: "Tài trợ giải đấu", how: "Thương hiệu tài trợ giải nghiệp dư với host AI riêng", who: "Nhà tài trợ" },
  { icon: Building2, name: "License / API", how: "Bán lớp giải trí cho các nền tảng cờ vua khác", who: "Đối tác B2B" },
];

const ROADMAP = [
  { phase: "Giai đoạn 1", title: "Ra mắt MVP", items: ["Web app với AI bình luận", "Chaos Cards bản beta", "Thử nghiệm cùng cộng đồng cờ vua"], now: true },
  { phase: "Giai đoạn 2", title: "Mở rộng giải trí", items: ["Chess Court & Chess Royale", "Ứng dụng di động", "Host AI mới, mở màn cốt truyện thù hằn"] },
  { phase: "Giai đoạn 3", title: "Quy mô hoá", items: ["Giải nghiệp dư có tài trợ", "License / API cho nền tảng khác", "Smart board phiên bản giới hạn"] },
];

const FUNDS = [
  { pct: 40, label: "Sản phẩm & kỹ thuật", c: "#8b7cff" },
  { pct: 30, label: "Tăng trưởng & nội dung viral", c: "#3ee6e0" },
  { pct: 15, label: "Vận hành & pháp lý", c: "#ffc56b" },
  { pct: 15, label: "Đội ngũ", c: "#ff6b9a" },
];

const TEAM = [
  ["CEO · Nhà sáng lập", "Sản phẩm game, cộng đồng cờ vua, tăng trưởng nền tảng nội dung"],
  ["CTO", "AI thời gian thực, livestream, hạ tầng game"],
  ["CPO · Nội dung", "Sản xuất nội dung giải trí, cộng đồng livestream, esports"],
];

export function InvestorsView() {
  return (
    <>
      <PageHero kicker="Nhà đầu tư · Vòng Seed" title="Chúng tôi đang xây *môn thể thao giải trí* tiếp theo.">
        Cờ vua, kịch tính sống và khán giả chủ động hội tụ trên cùng một màn hình. Vòng hạt giống đang mở cho 18 tháng vận hành.
      </PageHero>

      <section className="shell py-20">
        <Kicker>Luận điểm</Kicker>
        <div className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {THESIS.map(([t, b], i) => (
            <Reveal key={t} delay={i * 0.06}>
              <div className="grid gap-4 py-8 md:grid-cols-[80px_1fr_1.3fr] md:items-baseline">
                <span className="font-mono text-[13px] text-fg-3">0{i + 1}</span>
                <h3 className="display text-[clamp(1.6rem,3vw,2.4rem)]">{t}</h3>
                <p className="text-[16px] leading-relaxed text-fg-2">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-[17px] text-fg">
          ChessCast là nền tảng đầu tiên đặt cả ba xu hướng này <span className="serif-accent text-aurora text-[1.15em]">lên một bàn cờ thật.</span>
        </p>
      </section>

      <section className="shell py-20">
        <Kicker tone="teal">Thị trường</Kicker>
        <Words text="Một thị trường lớn *chưa ai xem.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" />
        <div className="mt-12 space-y-6">
          {MARKET.map((m, i) => (
            <div key={m.tag} className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
              <div>
                <div className="display text-5xl">
                  <Counter to={m.n} />M
                </div>
                <div className="mt-1 text-[13.5px] text-fg-2">
                  <span className="font-mono text-fg-3">{m.tag} · </span>
                  {m.label}
                </div>
              </div>
              <div className="h-14 overflow-hidden rounded-2xl bg-white/[0.03]">
                <motion.div className="h-full rounded-2xl" style={{ background: m.tint }} initial={{ width: 0 }} whileInView={{ width: `${m.w}%` }} viewport={{ once: true }} transition={{ duration: 1.4, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12.5px] text-fg-3">Số liệu ước tính ban đầu, cần xác thực bằng nghiên cứu thị trường trước khi đưa vào tài liệu chính thức.</p>
      </section>

      <section className="shell py-20">
        <Kicker tone="ember">Mô hình doanh thu</Kicker>
        <Words text="Năm dòng tiền. *Không một đồng cá cược.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" accentClass="serif-accent text-ember" />
        <div className="mt-12 grid gap-3 md:grid-cols-5">
          {REVENUE.map((r, i) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.name} delay={i * 0.06} className="h-full">
                <Spotlight className="flex h-full flex-col p-5">
                  <Icon size={20} className="text-violet" />
                  <div className="mt-8 font-display text-lg font-semibold tracking-tight">{r.name}</div>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-fg-2">{r.how}</p>
                  <div className="mt-5 font-mono text-[11px] text-fg-3">→ {r.who}</div>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="shell py-20">
        <Kicker>Lộ trình</Kicker>
        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-[11px] hidden h-px md:block">
            <motion.div className="h-full bg-gradient-to-r from-violet via-teal to-white/10" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "0 50%" }} />
          </div>
          {ROADMAP.map((r, i) => (
            <Reveal key={r.phase} delay={i * 0.12}>
              <div className="relative">
                <span className="relative grid h-6 w-6 place-items-center">
                  {r.now && <span className="absolute inset-0 animate-ping rounded-full bg-violet/50" />}
                  <span className={`h-3 w-3 rounded-full ${r.now ? "bg-violet shadow-[0_0_14px_4px_rgba(139,124,255,0.7)]" : "bg-white/25"}`} />
                </span>
                <div className="mt-6 font-mono text-[11px] text-fg-3">
                  {r.phase}
                  {r.now && " · đang triển khai"}
                </div>
                <div className="display mt-2 text-3xl">{r.title}</div>
                <ul className="mt-4 space-y-2 text-[15px] text-fg-2">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="text-violet">—</span> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell py-20">
        <Spotlight className="p-7 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <Kicker tone="teal">Gọi vốn · Seed</Kicker>
              <h2 className="display mt-5 text-[clamp(2rem,4vw,3.2rem)]">
                Phân bổ vốn cho <span className="serif-accent text-aurora">18 tháng.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] text-fg-2">Quy mô vòng và điều khoản được chia sẻ trực tiếp với nhà đầu tư quan tâm.</p>
            </div>
            <div>
              <div className="flex h-16 gap-1 overflow-hidden rounded-2xl">
                {FUNDS.map((f, i) => (
                  <motion.div key={f.label} className="h-full rounded-xl" style={{ background: f.c }} initial={{ width: 0 }} whileInView={{ width: `${f.pct}%` }} viewport={{ once: true }} transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {FUNDS.map((f) => (
                  <div key={f.label} className="flex items-baseline gap-3">
                    <span className="display text-3xl">{f.pct}%</span>
                    <span className="flex items-center gap-2 text-[13.5px] text-fg-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: f.c }} />
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Spotlight>
      </section>

      <section className="shell py-20">
        <Kicker>Đội ngũ sáng lập</Kicker>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {TEAM.map(([role, exp], i) => (
            <Reveal key={role} delay={i * 0.08}>
              <Spotlight className="h-full p-6">
                <div className="h-12 w-12 rounded-full bg-[conic-gradient(from_120deg,#8b7cff,#3ee6e0,#ffc56b,#8b7cff)] p-[2px]">
                  <div className="h-full w-full rounded-full bg-night" />
                </div>
                <div className="mt-6 font-display text-lg font-semibold tracking-tight">{role}</div>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-2">{exp}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contact" className="shell grid scroll-mt-28 gap-12 py-24 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <Kicker tone="ember">Nhận pitch deck</Kicker>
          <Words text="Nói chuyện với *nhà sáng lập.*" className="display mt-5 text-[clamp(2.2rem,4.4vw,3.6rem)]" accentClass="serif-accent text-ember" />
          <p className="mt-5 max-w-md text-fg-2">
            Gửi thông tin để nhận deck đầy đủ và lịch hẹn, hoặc email trực tiếp{" "}
            <a href={`mailto:${site.emails.invest}`} className="text-fg underline decoration-white/20 underline-offset-4">
              {site.emails.invest}
            </a>
            .
          </p>
        </div>
        <ContactForm topics={["Đầu tư vòng Seed", "Cố vấn", "Báo chí"]} />
      </section>
    </>
  );
}
