import { VelocityMarquee } from "../ui/velocity-marquee";

const WORDS = ["Live AI commentary", "Chaos Cards", "Chess Court", "Chess Royale", "Auto clips", "Three hosts, one feud"];

export function Band() {
  return (
    <section aria-hidden className="relative overflow-hidden border-y border-white/[0.06] bg-void/40 py-8 backdrop-blur-sm">
      <VelocityMarquee baseVelocity={-1.6}>
        {WORDS.map((w, i) => (
          <span key={w} className="mx-6 flex items-center gap-12">
            <span className={i % 2 ? "display-wide text-[clamp(2.6rem,6vw,5.4rem)] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)]" : "display-wide text-[clamp(2.6rem,6vw,5.4rem)] text-chrome"}>{w}</span>
            <span className="text-aurora text-4xl">✦</span>
          </span>
        ))}
      </VelocityMarquee>
    </section>
  );
}
