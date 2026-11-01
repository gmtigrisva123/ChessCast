import { NextResponse } from "next/server";
import { clean, isEmail, sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || !isEmail(b.email)) return NextResponse.json({ error: "Email không hợp lệ" }, { status: 422 });
  const source = clean(b.source, 60) || "website";
  await sendMail(`[ChessCast] Đăng ký mới (${source})`, `Email: ${b.email}\nNguồn: ${source}`);
  return NextResponse.json({ ok: true });
}
