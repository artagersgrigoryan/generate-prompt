import { NextRequest, NextResponse } from "next/server";
import { CLAUDE_MODEL_ID, CLAUDE_MODEL_NAME } from "@/lib/models";

const SYSTEM_PROMPT = `You are an expert web designer and senior developer writing a briefing document for an AI coding tool or developer. Based on the client answers, write a single cohesive prompt starting with "Build a website for..." that a developer can act on immediately without asking a single follow-up question.

Cover every section below in this exact order, written as flowing professional prose — no bullet points, no markdown headers, no numbered lists:

1. Project identity — what the website is, who it serves, what makes it unique, and the core value it delivers to visitors.

2. Design direction — visual style, color palette with specific hex values when provided, typography mood (e.g. geometric sans for modernity, editorial serif for authority), spacing feel (tight and dense vs open and airy), and the overall aesthetic the UI should evoke.

3. Tone and copy — the voice of the website, how headlines should feel, how CTAs should be phrased, the emotional register of all writing across the site.

4. Pages and content — each required page with a clear description of its purpose, the key sections or content blocks it must contain, and the hierarchy of information within it.

5. Features and functionality — every interactive element, form, animation, third-party integration, and special behaviour the site needs, described precisely enough to implement without guessing.

6. Code quality and architecture — specify the component breakdown and naming conventions, semantic HTML requirements, accessibility standards to meet (ARIA roles, keyboard navigation, focus management, colour contrast), performance practices to follow (lazy loading images, minimal JavaScript, code splitting if applicable), error states and loading states that must be handled, and any patterns or shortcuts to avoid.

7. Tech stack — the recommended platform or framework and the clear reasoning behind the choice given this project's scale, content, and functionality needs.

8. Content handling — state exactly what content is ready to use, what should use realistic placeholder text that matches the brand, and what copy the developer or AI should write from scratch guided by the tone described above. If the client has indicated they have existing copy or images ready, explicitly instruct the developer to look for that content attached directly after this prompt and to use it as the primary source — it overrides any placeholder or AI-written copy for those sections.

Make the brief precise, inspiring, and complete. Every decision should feel intentional.

Always write the brief in English, even if some of the client's answers are in a different language.`;

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

const MAX_ANSWER_LENGTH = 2000;
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

  let body: { answers: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validateAnswers(body.answers)) {
    return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
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
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
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
