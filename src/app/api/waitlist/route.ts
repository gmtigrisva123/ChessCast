import { NextResponse } from "next/server";
import { clean, isEmail, sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || !isEmail(b.email)) return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  const source = clean(b.source, 60) || "website";
  await sendMail(`[ChessCast] New signup (${source})`, `Email: ${b.email}\nSource: ${source}`);
  return NextResponse.json({ ok: true });
}
