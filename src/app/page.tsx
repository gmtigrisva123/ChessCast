import { Hero } from "@/components/home/hero";
import { Ticker } from "@/components/home/ticker";
import { Opportunity } from "@/components/home/opportunity";
import { Pillars } from "@/components/home/pillars";
import { ChaosShowcase } from "@/components/home/chaos-showcase";
import { Hosts } from "@/components/home/hosts";
import { Flywheel } from "@/components/home/flywheel";
import { Modes } from "@/components/home/modes";
import { PricingPreview } from "@/components/home/pricing-preview";
import { Compare } from "@/components/home/compare";
import { VisionCta } from "@/components/home/vision-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Opportunity />
      <Pillars />
      <ChaosShowcase />
      <Hosts />
      <Flywheel />
      <Modes />
      <PricingPreview />
      <Compare />
      <VisionCta />
    </>
  );
}
