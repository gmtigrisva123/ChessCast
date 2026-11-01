import { ArrowLeftRight, CloudFog, Dices, Snowflake, Sparkles, Activity, type LucideProps } from "lucide-react";
import type { ChaosCard } from "@/lib/catalog";

const MAP = { fog: CloudFog, dice: Dices, swap: ArrowLeftRight, freeze: Snowflake, spotlight: Sparkles, quake: Activity } as const;

export function ChaosIcon({ icon, ...p }: { icon: ChaosCard["icon"] } & LucideProps) {
  const I = MAP[icon];
  return <I {...p} />;
}
