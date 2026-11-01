import type { Metadata } from "next";
import { RoyaleView } from "@/components/royale/royale";

export const metadata: Metadata = {
  title: "Chess Royale",
  description: "100 người chơi, một lưới trận đấu, loại trực tiếp — thua là nổ khỏi màn hình.",
};

export default function RoyalePage() {
  return <RoyaleView />;
}
