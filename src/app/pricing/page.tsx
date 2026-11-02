import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingView } from "@/components/pricing/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "ChessCast memberships — Fan Pro and Chaos Lord — plus Chaos Coin packs.",
};

export default function PricingPage() {
  return (
    <Suspense>
      <PricingView />
    </Suspense>
  );
}
