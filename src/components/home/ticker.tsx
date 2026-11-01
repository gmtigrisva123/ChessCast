import { Marquee } from "../ui/marquee";

const A = ["AI bình luận có cá tính", "Chaos Cards", "Chess Court", "Chess Royale", "Clip viral tự động", "Host có thù hằn"];
const B = ["Không chỉ xem", "Can thiệp", "Ném sương mù", "Hoán đổi quân", "Nước đi ngẫu nhiên", "Bồi thẩm đoàn"];

export function Ticker() {
  return (
    <section aria-hidden className="relative z-10 -mt-[1px] overflow-hidden py-14">
      <div className="-rotate-2 scale-105 bg-lime py-4 text-ink shadow-[0_20px_60px_-20px_rgba(216,255,60,0.5)]">
        <Marquee duration={28}>
          {A.map((t) => (
            <span key={t} className="mx-5 flex items-center gap-5 font-display text-3xl font-bold uppercase md:text-5xl">
              {t} <span className="text-pink">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
      <div className="relative -mt-3 rotate-[1.5deg] scale-105 border-y border-cream/10 bg-ink-2 py-3">
        <Marquee duration={34} reverse>
          {B.map((t) => (
            <span key={t} className="text-stroke-thin mx-5 flex items-center gap-5 font-display text-3xl font-bold uppercase text-cream/60 md:text-5xl">
              {t} <span className="text-lime [-webkit-text-stroke:0]">◆</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
