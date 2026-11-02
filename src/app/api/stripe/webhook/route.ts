import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, resolveItem } from "@/lib/payments";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    // Async variant uses Web Crypto, which is what Cloudflare Workers provide.
    event = await stripe.webhooks.constructEventAsync(raw, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const md = s.metadata ?? {};
      const userId = s.client_reference_id || md.user_id || "";
      // Re-resolve from the catalog so coin amounts never come from client-controlled data.
      const item = resolveItem({
        kind: md.kind as "coin" | "plan",
        id: md.id ?? "",
        cycle: (md.cycle || undefined) as "monthly" | "yearly" | undefined,
      });
      const db = getSupabaseAdmin();
      if (!db || !userId || !item) {
        console.info("[stripe] checkout completed (not credited server-side)", s.id, { signedIn: Boolean(userId), db: Boolean(db) });
        break;
      }
      const { error } = await db.rpc("credit_checkout", {
        p_user_id: userId,
        p_session_id: s.id,
        p_kind: item.kind,
        p_item_id: item.id,
        p_cycle: item.cycle ?? "",
        p_coins: item.coins,
        p_amount_cents: s.amount_total ?? item.amount,
      });
      if (error) {
        console.error("[stripe] credit failed", s.id, error.message);
        // 500 makes Stripe retry; credit_checkout is idempotent per session.
        return NextResponse.json({ error: "Credit failed" }, { status: 500 });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.info("[stripe] subscription canceled", sub.id);
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
