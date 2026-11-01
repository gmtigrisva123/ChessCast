import "server-only";
import Stripe from "stripe";
import { CURRENCY, getCoinPack, getPlan } from "./catalog";

export type CheckoutRequest = { kind: "coin" | "plan"; id: string; cycle?: "monthly" | "yearly" };

export type ResolvedItem = {
  kind: "coin" | "plan";
  id: string;
  cycle?: "monthly" | "yearly";
  label: string;
  description: string;
  amount: number; // cents
  coins: number;
  mode: "payment" | "subscription";
};

export function resolveItem(req: CheckoutRequest): ResolvedItem | null {
  if (req.kind === "coin") {
    const p = getCoinPack(req.id);
    if (!p) return null;
    return {
      kind: "coin",
      id: p.id,
      label: `${p.name} pack — ${p.coins + p.bonus} Chaos Coins`,
      description: `${p.coins} coins${p.bonus ? ` + ${p.bonus} bonus` : ""}. Virtual entertainment items with no cash value.`,
      amount: p.price,
      coins: p.coins + p.bonus,
      mode: "payment",
    };
  }
  if (req.kind === "plan") {
    const p = getPlan(req.id);
    if (!p || p.id === "free") return null;
    const cycle = req.cycle === "yearly" ? "yearly" : "monthly";
    return {
      kind: "plan",
      id: p.id,
      cycle,
      label: `ChessCast ${p.name} (${cycle === "yearly" ? "yearly" : "monthly"})`,
      description: p.tagline,
      amount: cycle === "yearly" ? p.yearly : p.monthly,
      coins: cycle === "yearly" ? p.monthlyCoins * 12 : p.monthlyCoins,
      mode: "subscription",
    };
  }
  return null;
}

let stripe: Stripe | null = null;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) stripe = new Stripe(key);
  return stripe;
}

export function siteUrl(reqUrl?: string) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (reqUrl) return new URL(reqUrl).origin;
  return "http://localhost:3000";
}

export { CURRENCY };
