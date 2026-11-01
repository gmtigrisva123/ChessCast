import type { Metadata } from "next";
import { ArenaView } from "@/components/arena/arena";

export const metadata: Metadata = {
  title: "Arena Live",
  description: "Xem trận cờ 3D với 3 host AI bình luận, ném Chaos Cards và tip để host cà khịa kỳ thủ.",
};

export default function LivePage() {
  return <ArenaView />;
}
