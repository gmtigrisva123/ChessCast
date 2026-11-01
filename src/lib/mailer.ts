import "server-only";

export async function sendMail(subject: string, text: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "hello@chesscast.io";
  if (!key) {
    console.info(`[mail:demo] ${subject}\n${text}`);
    return { ok: true, demo: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ChessCast <noreply@chesscast.io>",
      to: [to],
      subject,
      text,
      reply_to: replyTo,
    }),
  });
  return { ok: res.ok, demo: false };
}

export const isEmail = (s: unknown): s is string => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length < 200;
export const clean = (s: unknown, max = 2000) => (typeof s === "string" ? s.trim().slice(0, max) : "");
