import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  const userId = result;

  const toolSlug = req.nextUrl.searchParams.get("toolSlug");
  if (!toolSlug) {
    return NextResponse.json({ error: "Missing toolSlug" }, { status: 400 });
  }

  const profile = await prisma.userToolProfile.findUnique({
    where: { userId_toolSlug: { userId, toolSlug } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ answers: profile.answers });
}

export async function PUT(req: NextRequest) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  const userId = result;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { toolSlug, answers } = body as { toolSlug: string; answers: Record<string, string> };
  if (!toolSlug || !answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Merge with existing answers so a partial save never silently drops previously-stored keys.
  const existing = await prisma.userToolProfile.findUnique({
    where: { userId_toolSlug: { userId, toolSlug } },
    select: { answers: true },
  });
  const merged = { ...(existing?.answers as Record<string, string> ?? {}), ...answers };

  await prisma.userToolProfile.upsert({
    where: { userId_toolSlug: { userId, toolSlug } },
    create: { userId, toolSlug, answers: merged },
    update: { answers: merged },
  });

  return NextResponse.json({ ok: true });
}
