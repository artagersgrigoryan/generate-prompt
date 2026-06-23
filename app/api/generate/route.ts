import { NextRequest, NextResponse } from "next/server";
import { CLAUDE_MODEL_ID, CLAUDE_MODEL_NAME } from "@/lib/models";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anonLimit, authLimit } from "@/lib/ratelimit";
import { getTool, DEFAULT_TOOL_SLUG } from "@/lib/tools";

async function sendToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[Telegram] env vars missing");
    return;
  }

  const MAX = 4000;
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX) {
    chunks.push(text.slice(i, i + MAX));
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  for (const chunk of chunks) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: parseInt(chatId, 10), text: chunk }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram] API error:", JSON.stringify(data));
    } else {
      console.log("[Telegram] message sent OK");
    }
  }
}

function buildUserMessage(answers: Record<string, string>): string {
  const lines = Object.entries(answers)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `Q${k}: ${v}`);
  return `Here are the client's answers:\n\n${lines.join("\n")}`;
}

const MAX_ANSWER_LENGTH = 3000;
const MAX_ANSWERS = 20;

function validateAnswers(raw: unknown): raw is Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > MAX_ANSWERS) return false;
  return entries.every(
    ([k, v]) =>
      typeof k === "string" &&
      k.length <= 100 &&
      typeof v === "string" &&
      v.length <= MAX_ANSWER_LENGTH
  );
}

export async function POST(req: NextRequest) {
  // Reject bodies over 64 KB
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 65536) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: { answers: unknown; toolSlug?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validateAnswers(body.answers)) {
    return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
  }

  // Resolve the tool (defaults to the website tool for backward compatibility).
  const toolSlug =
    typeof body.toolSlug === "string" ? body.toolSlug : DEFAULT_TOOL_SLUG;
  const tool = getTool(toolSlug);
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
  }

  const session = await auth();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const limiter = session?.user?.id ? authLimit : anonLimit;
  const identifier = session?.user?.id ?? ip;
  const { success, reset } = await limiter.limit(identifier);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const userMessage = buildUserMessage(body.answers);

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: CLAUDE_MODEL_ID,
      max_tokens: tool.maxOutputTokens ?? 4096,
      system: tool.systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    const block = msg.content[0];
    const result = block.type === "text" ? block.text : "";

    const answersText = Object.entries(body.answers)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    const telegramMessage = `📋 USER ANSWERS\n\n${answersText}\n\n${"─".repeat(30)}\n\n✨ GENERATED PROMPT\n\n${result}`;
    await sendToTelegram(telegramMessage).catch((e) => console.error("[Telegram] unexpected error:", e));

    if (session?.user?.id) {
      prisma.prompt
        .create({
          data: {
            userId: session.user.id,
            toolSlug: tool.slug,
            answers: body.answers as Record<string, string>,
            result,
            model: CLAUDE_MODEL_NAME,
          },
        })
        .catch((e: unknown) =>
          console.error("[Prompt] failed to save to DB:", e)
        );
    }

    return NextResponse.json({ result, model: CLAUDE_MODEL_NAME });
  } catch (err: unknown) {
    const isOverload =
      err instanceof Error && err.message.toLowerCase().includes("overload");
    const message = isOverload
      ? "The AI service is temporarily busy. Please try again in a moment."
      : "Generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
