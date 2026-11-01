import { NextResponse } from "next/server";
import { getStripe, resolveItem } from "@/lib/payments";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    const paid = s.payment_status === "paid" || s.payment_status === "no_payment_required";
    const md = s.metadata ?? {};
    const item = resolveItem({
      kind: md.kind as "coin" | "plan",
      id: md.id ?? "",
      cycle: (md.cycle || undefined) as "monthly" | "yearly" | undefined,
    });
    return NextResponse.json({ paid, sessionId: s.id, item });
  } catch {
    return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
  }
}
