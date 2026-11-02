import { NextResponse } from "next/server";
import { CURRENCY, getStripe, resolveItem, siteUrl, type CheckoutRequest } from "@/lib/payments";
import { getUserId } from "@/lib/supabase/server";

export async function POST(req: Request) {
  let body: CheckoutRequest;
  try {
    body = (await req.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const item = resolveItem(body);
  if (!item) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const stripe = getStripe();
  if (!stripe) {
    // No payment provider configured → demo mode
    return NextResponse.json({ demo: true, item });
  }

  const base = siteUrl(req.url);
  const userId = await getUserId();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      locale: "auto",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: item.amount,
            product_data: { name: item.label, description: item.description },
            ...(item.mode === "subscription"
              ? { recurring: { interval: item.cycle === "yearly" ? "year" : "month" } }
              : {}),
          },
        },
      ],
      ...(userId ? { client_reference_id: userId } : {}),
      metadata: { kind: item.kind, id: item.id, cycle: item.cycle ?? "", coins: String(item.coins), user_id: userId ?? "" },
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] stripe error", e);
    return NextResponse.json({ error: "Could not create a checkout session" }, { status: 502 });
  }
}
