import { NextRequest, NextResponse } from "next/server";
import { inMemoryLimiter } from "@/lib/ratelimit";

// Short window so we can observe the limit without waiting an hour.
// 3 requests per 10 seconds, keyed by IP.
const testLimit = inMemoryLimiter(3, 10_000);

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { success, reset } = await testLimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Rate limited", retryAfterSeconds: Math.ceil((reset - Date.now()) / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } }
    );
  }

  return NextResponse.json({ ok: true, message: "Request allowed" });
}
