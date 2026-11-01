import type { Metadata } from "next";
import { CourtView } from "@/components/court/court";

export const metadata: Metadata = {
  title: "Chess Court",
  description: "Tòa án của khán giả: AI công tố, bồi thẩm đoàn khán giả, hình phạt là thử thách trên livestream.",
};

export default function CourtPage() {
  return <CourtView />;
}
