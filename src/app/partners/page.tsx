import type { Metadata } from "next";
import { PartnersView } from "@/components/partners/partners";

export const metadata: Metadata = {
  title: "Đối tác & API",
  description: "Tài trợ giải đấu với host AI riêng, License/API để đưa lớp giải trí ChessCast vào nền tảng cờ vua của bạn.",
};

export default function PartnersPage() {
  return <PartnersView />;
}
