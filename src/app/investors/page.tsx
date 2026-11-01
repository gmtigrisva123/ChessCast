import type { Metadata } from "next";
import { InvestorsView } from "@/components/investors/investors";

export const metadata: Metadata = {
  title: "Nhà đầu tư",
  description: "ChessCast — vòng hạt giống: thị trường, mô hình kinh doanh, lộ trình và phân bổ vốn.",
};

export default function InvestorsPage() {
  return <InvestorsView />;
}
