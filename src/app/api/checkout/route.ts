import { NextResponse } from "next/server";
import { getStripe, resolveItem, siteUrl, type CheckoutRequest } from "@/lib/payments";

export async function POST(req: Request) {
  let body: CheckoutRequest;
  try {
    body = (await req.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }
  const item = resolveItem(body);
  if (!item) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });

  const stripe = getStripe();
  if (!stripe) {
    // Chưa cấu hình cổng thanh toán → chế độ demo
    return NextResponse.json({ demo: true, item });
  }

  const base = siteUrl(req.url);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      locale: "vi",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "vnd",
            unit_amount: item.amount,
            product_data: { name: item.label, description: item.description },
            ...(item.mode === "subscription"
              ? { recurring: { interval: item.cycle === "yearly" ? "year" : "month" } }
              : {}),
          },
        },
      ],
      metadata: { kind: item.kind, id: item.id, cycle: item.cycle ?? "", coins: String(item.coins) },
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing?canceled=1`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] stripe error", e);
    return NextResponse.json({ error: "Không tạo được phiên thanh toán" }, { status: 502 });
  }
}
