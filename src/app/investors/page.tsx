import type { Metadata } from "next";
import { InvestorsView } from "@/components/investors/investors";

export const metadata: Metadata = {
  title: "Investors",
  description: "ChessCast seed round — market, business model, roadmap and use of funds.",
};

export default function InvestorsPage() {
  return <InvestorsView />;
}
