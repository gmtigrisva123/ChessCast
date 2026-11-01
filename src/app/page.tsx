import { Hero } from "@/components/home/hero";
import { LiveRail } from "@/components/home/live-rail";
import { Story } from "@/components/home/story";
import { Bento } from "@/components/home/bento";
import { Deck } from "@/components/home/deck";
import { Voices } from "@/components/home/voices";
import { Manifesto } from "@/components/home/manifesto";
import { Pricing } from "@/components/home/pricing";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <LiveRail />
      <Story />
      <Manifesto />
      <Bento />
      <Deck />
      <Voices />
      <Pricing />
      <FinalCta />
    </>
  );
}
