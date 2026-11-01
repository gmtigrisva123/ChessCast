import type { Metadata } from "next";
import { CourtView } from "@/components/court/court";

export const metadata: Metadata = {
  title: "Chess Court",
  description: "The audience's courtroom: an AI prosecutor, a jury of viewers and penalties served live on stream.",
};

export default function CourtPage() {
  return <CourtView />;
}
