import { PlanCards } from "../commerce/plan-cards";
import { Kicker } from "../ui/section";
import { Words } from "../ui/reveal";
import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-36" aria-labelledby="price-title">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <Kicker>Gói thành viên</Kicker>
          <Words id="price-title" text="Xem miễn phí. *Lên đời* khi bạn muốn nhiều hơn." className="display mt-5 text-[clamp(2.3rem,5vw,4.2rem)]" />
        </div>
        <PlanCards className="mt-12" />
        <p className="mt-10 text-center text-sm text-fg-3">
          Cần thêm coin để quậy?{" "}
          <Link href="/pricing#coins" className="text-fg-2 underline decoration-white/20 underline-offset-4 hover:text-fg">
            Xem các gói Chaos Coins
          </Link>
        </p>
      </div>
    </section>
  );
}
