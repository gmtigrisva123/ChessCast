import { NextResponse } from "next/server";
import { clean, isEmail, sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  if (clean(b.website)) return NextResponse.json({ ok: true }); // honeypot
  const name = clean(b.name, 120);
  const email = b.email;
  const company = clean(b.company, 160);
  const topic = clean(b.topic, 60);
  const message = clean(b.message, 4000);
  if (!name || !isEmail(email) || message.length < 10)
    return NextResponse.json({ error: "Vui lòng điền tên, email hợp lệ và lời nhắn (tối thiểu 10 ký tự)." }, { status: 422 });
  const r = await sendMail(
    `[ChessCast] ${topic || "Liên hệ"} — ${company || name}`,
    `Tên: ${name}\nEmail: ${email}\nCông ty: ${company}\nChủ đề: ${topic}\n\n${message}`,
    email,
  );
  if (!r.ok) return NextResponse.json({ error: "Không gửi được, thử lại sau." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
