import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: "Telegram env vars not set" }, { status: 503 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: "✅ Telegram integration is working!" }),
  });

  const data = await res.json();
  if (!data.ok) {
    return NextResponse.json({ error: data.description ?? "Failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
