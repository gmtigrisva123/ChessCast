import "server-only";
import { getSupabaseAdmin, getSupabaseServer } from "./server";

/**
 * Resolves the signed-in user plus a privileged client for wallet writes.
 * Returns a ready-made error response body + status when that is not possible.
 */
export async function walletContext() {
  const sb = await getSupabaseServer();
  if (!sb) return { ok: false, error: { body: { error: "Accounts are not configured" }, status: 503 } } as const;
  const { data } = await sb.auth.getUser();
  if (!data.user) return { ok: false, error: { body: { error: "Sign in first" }, status: 401 } } as const;
  const db = getSupabaseAdmin();
  if (!db) return { ok: false, error: { body: { error: "Server wallet is not configured" }, status: 503 } } as const;
  return { ok: true, userId: data.user.id, sb, db } as const;
}

export async function currentCoins(userId: string) {
  const db = getSupabaseAdmin();
  const { data } = (await db?.from("wallets").select("coins").eq("user_id", userId).maybeSingle()) ?? { data: null };
  return (data?.coins as number | undefined) ?? 0;
}
