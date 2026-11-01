import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * Bình luận AI thời gian thực (tuỳ chọn).
 * Khi chưa đặt ANTHROPIC_API_KEY, route trả 204 và client tự dùng bộ bình luận dựng sẵn.
 */

const PERSONAS = {
  gambit:
    "Bạn là Captain Gambit — host bình luận cờ vua cuồng nhiệt, hét to, mê thí quân, hay dùng chữ IN HOA và dấu chấm than. Đang có mối thù với GS. Zugzwang.",
  zugzwang:
    "Bạn là GS. Zugzwang — chuyên gia phân tích lạnh lùng, nói bằng con số, mỉa mai tinh tế, không bao giờ cười.",
  blunder:
    "Bạn là MC Blunder — host Gen Z chuyên cà khịa, dùng tiếng lóng Việt Nam, hài hước nhưng không xúc phạm hay thô tục.",
} as const;

type Body = {
  host?: keyof typeof PERSONAS;
  san?: string;
  fen?: string;
  player?: string;
  opponent?: string;
  event?: string;
};

let client: Anthropic | null = null;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return new NextResponse(null, { status: 204 });
  const b = (await req.json().catch(() => null)) as Body | null;
  if (!b?.san || !b.host || !(b.host in PERSONAS)) return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });

  client ??= new Anthropic();
  const clip = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : "");

  try {
    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: `${PERSONAS[b.host]}
Bạn bình luận trực tiếp một ván cờ trên ChessCast. Trả lời bằng tiếng Việt, đúng MỘT câu (tối đa 30 từ), giữ đúng cá tính nhân vật. Không bịa nước đi khác ngoài nước được cung cấp. Không nhắc đến cá cược.`,
      messages: [
        {
          role: "user",
          content: `Kỳ thủ vừa đi: ${clip(b.player, 40)}. Đối thủ: ${clip(b.opponent, 40)}.
Nước đi: ${clip(b.san, 12)}
FEN sau nước đi: ${clip(b.fen, 100)}
${b.event ? `Sự kiện: ${clip(b.event, 120)}` : ""}`,
        },
      ],
    });
    if (res.stop_reason === "refusal") return new NextResponse(null, { status: 204 });
    const text = res.content
      .filter((c): c is Anthropic.Beta.BetaTextBlock => c.type === "text")
      .map((c) => c.text)
      .join(" ")
      .trim();
    if (!text) return new NextResponse(null, { status: 204 });
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return new NextResponse(null, { status: 204 });
    if (error instanceof Anthropic.APIError) console.error("[commentary]", error.status, error.message);
    return new NextResponse(null, { status: 204 });
  }
}
