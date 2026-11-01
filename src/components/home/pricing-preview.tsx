import { PlanCards } from "../commerce/plan-cards";
import { SectionLabel, SplitText } from "../ui/reveal";
import { ButtonLink } from "../ui/button";

export function PricingPreview() {
  return (
    <section className="relative py-28 md:py-36" aria-labelledby="price-title" id="pricing">
      <div className="container-x">
        <div className="text-center">
          <SectionLabel className="justify-center">Kinh doanh · Gói thành viên</SectionLabel>
          <h2 id="price-title" className="mx-auto mt-4 max-w-4xl font-display text-[clamp(2.6rem,6.5vw,6rem)] font-bold uppercase leading-[0.93]">
            <SplitText text="Xem miễn phí." className="block" />
            <SplitText text="Hỗn loạn có phí." className="block text-lime" delay={0.1} />
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-cream/60">Ai cũng xem được mọi trận. Muốn giọng host cao cấp, clip vô hạn và coin hàng tháng để quậy tung bàn cờ? Lên đời thôi.</p>
        </div>
        <PlanCards className="mt-12" />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-cream/50">
          Cần thêm coin?{" "}
          <ButtonLink href="/pricing#coins" variant="outline" size="sm">
            Xem các gói Chaos Coins
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
