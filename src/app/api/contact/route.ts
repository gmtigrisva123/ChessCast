import { NextResponse } from "next/server";
import { clean, isEmail, sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (clean(b.website)) return NextResponse.json({ ok: true }); // honeypot
  const name = clean(b.name, 120);
  const email = b.email;
  const company = clean(b.company, 160);
  const topic = clean(b.topic, 60);
  const message = clean(b.message, 4000);
  if (!name || !isEmail(email) || message.length < 10)
    return NextResponse.json({ error: "Please enter your name, a valid email and a message (10+ characters)." }, { status: 422 });
  const r = await sendMail(
    `[ChessCast] ${topic || "Contact"} — ${company || name}`,
    `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nTopic: ${topic}\n\n${message}`,
    email,
  );
  if (!r.ok) return NextResponse.json({ error: "Could not send — please try again later." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
