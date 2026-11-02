import { NextResponse } from "next/server";
import { TIP_PRESETS, chaosCardCost, type ChaosCardId } from "@/lib/catalog";
import { currentCoins, walletContext } from "@/lib/supabase/wallet";

type Body = { kind?: string; id?: string; amount?: number; target?: string };

/**
 * Deducts coins from the signed-in user's server wallet.
 * Prices are decided here from the catalog and the stored plan — never taken from the client.
 */
export async function POST(req: Request) {
  const ctx = await walletContext();
  if (!ctx.ok) return NextResponse.json(ctx.error.body, { status: ctx.error.status });

  const b = (await req.json().catch(() => null)) as Body | null;
  let amount: number | null = null;
  let ref = "";
  if (b?.kind === "card" && typeof b.id === "string") {
    const { data: w } = await ctx.db.from("wallets").select("plan").eq("user_id", ctx.userId).maybeSingle();
    amount = chaosCardCost(b.id as ChaosCardId, (w?.plan as string | undefined) ?? "free");
    ref = b.id;
  } else if (b?.kind === "tip" && (TIP_PRESETS as readonly number[]).includes(Number(b.amount))) {
    amount = Number(b.amount);
    ref = typeof b.target === "string" ? b.target.slice(0, 8) : "";
  }
  if (!amount) return NextResponse.json({ error: "Unknown item" }, { status: 400 });

  const { data, error } = await ctx.db.rpc("spend_coins", { p_user_id: ctx.userId, p_amount: amount, p_reason: b!.kind, p_ref: ref });
  if (error) {
    console.error("[wallet] spend failed", error.message);
    return NextResponse.json({ error: "Could not spend coins" }, { status: 500 });
  }
  if (data === null) {
    return NextResponse.json({ error: "Not enough coins", coins: await currentCoins(ctx.userId) }, { status: 402 });
  }
  return NextResponse.json({ ok: true, spent: amount, coins: data as number });
}
