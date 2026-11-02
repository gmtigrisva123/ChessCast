import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/** The signed-in user's server-side wallet. `enabled: false` = accounts are not configured (demo mode). */
export async function GET() {
  const sb = await getSupabaseServer();
  if (!sb) return NextResponse.json({ enabled: false, signedIn: false });
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ enabled: true, signedIn: false });
  const { data: wallet } = await sb.from("wallets").select("coins, plan, plan_renews_at").eq("user_id", auth.user.id).maybeSingle();
  return NextResponse.json({
    enabled: true,
    signedIn: true,
    email: auth.user.email ?? null,
    coins: wallet?.coins ?? 0,
    plan: wallet?.plan ?? "free",
    planRenewsAt: wallet?.plan_renews_at ? Date.parse(wallet.plan_renews_at) : null,
  });
}
