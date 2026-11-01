import type { Metadata } from "next";
import { RoyaleView } from "@/components/royale/royale";

export const metadata: Metadata = {
  title: "Chess Royale",
  description: "100 players, one bracket, straight knockout — lose and you blow up off the screen.",
};

export default function RoyalePage() {
  return <RoyaleView />;
}
