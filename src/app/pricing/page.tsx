import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingView } from "@/components/pricing/pricing";

export const metadata: Metadata = {
  title: "Bảng giá",
  description: "Gói thành viên Fan Pro, Chaos Lord và các gói Chaos Coins của ChessCast.",
};

export default function PricingPage() {
  return (
    <Suspense>
      <PricingView />
    </Suspense>
  );
}
