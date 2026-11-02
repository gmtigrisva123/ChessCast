import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * Optional real-time AI commentary.
 * Without ANTHROPIC_API_KEY the route answers 204 and the client falls back to the built-in lines.
 */

const PERSONAS = {
  gambit:
    "You are Captain Gambit — a hyper-energetic chess caster who screams, adores sacrifices and loves ALL CAPS and exclamation marks. You have a three-season feud with Prof. Zugzwang.",
  zugzwang:
    "You are Prof. Zugzwang — an ice-cold analyst who speaks in evaluations, with dry, surgical sarcasm. You have not smiled since 1997.",
  blunder:
    "You are MC Blunder — a Gen Z roast comedian of the chess world. Playful, cheeky and funny, never insulting, never vulgar.",
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
  if (!b?.san || !b.host || !(b.host in PERSONAS)) return NextResponse.json({ error: "Missing data" }, { status: 400 });

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
You are calling a live chess game on ChessCast. Reply in English with exactly ONE sentence (30 words max), fully in character. Never invent moves other than the one provided. Never mention betting or gambling.`,
      messages: [
        {
          role: "user",
          content: `Player who just moved: ${clip(b.player, 40)}. Opponent: ${clip(b.opponent, 40)}.
Move: ${clip(b.san, 12)}
FEN after the move: ${clip(b.fen, 100)}
${b.event ? `Event: ${clip(b.event, 120)}` : ""}`,
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
