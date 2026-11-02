import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Magic-link / OAuth landing: swaps the one-time code for a session cookie. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const sb = await getSupabaseServer();
  if (sb && code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(dest, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=1", url.origin));
}
