import { Hero } from "@/components/home/hero";
import { Band } from "@/components/home/band";
import { Manifesto } from "@/components/home/manifesto";
import { Story } from "@/components/home/story";
import { LiveRail } from "@/components/home/live-rail";
import { Bento } from "@/components/home/bento";
import { Deck } from "@/components/home/deck";
import { Voices } from "@/components/home/voices";
import { Pricing } from "@/components/home/pricing";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Band />
      <Manifesto />
      <Story />
      <LiveRail />
      <Bento />
      <Deck />
      <Voices />
      <Pricing />
      <FinalCta />
    </>
  );
}
