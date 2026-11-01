import type { Metadata } from "next";
import { PartnersView } from "@/components/partners/partners";

export const metadata: Metadata = {
  title: "Partners & API",
  description: "Sponsor tournaments with your own AI host, or license the ChessCast entertainment layer for your chess platform.",
};

export default function PartnersPage() {
  return <PartnersView />;
}
