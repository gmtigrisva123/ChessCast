import { NextResponse } from "next/server";
import { COURT_CASE_IDS, COURT_VOTE_REWARD } from "@/lib/catalog";
import { currentCoins, walletContext } from "@/lib/supabase/wallet";

/** Pays the Chess Court jury reward once per case per user. */
export async function POST(req: Request) {
  const ctx = await walletContext();
  if (!ctx.ok) return NextResponse.json(ctx.error.body, { status: ctx.error.status });

  const b = (await req.json().catch(() => null)) as { caseId?: string } | null;
  const caseId = b?.caseId;
  if (!caseId || !(COURT_CASE_IDS as readonly string[]).includes(caseId))
    return NextResponse.json({ error: "Unknown case" }, { status: 400 });

  const { data, error } = await ctx.db.rpc("reward_court_vote", { p_user_id: ctx.userId, p_case_id: caseId, p_amount: COURT_VOTE_REWARD });
  if (error) {
    console.error("[wallet] court reward failed", error.message);
    return NextResponse.json({ error: "Could not record the vote" }, { status: 500 });
  }
  if (data === null) return NextResponse.json({ ok: true, rewarded: false, coins: await currentCoins(ctx.userId) });
  return NextResponse.json({ ok: true, rewarded: true, coins: data as number });
}
