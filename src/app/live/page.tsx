import type { Metadata } from "next";
import { ArenaView } from "@/components/arena/arena";

export const metadata: Metadata = {
  title: "Live Arena",
  description: "Watch 3D chess with three AI hosts calling every move, throw Chaos Cards and tip the hosts to roast the players.",
};

export default function LivePage() {
  return <ArenaView />;
}
