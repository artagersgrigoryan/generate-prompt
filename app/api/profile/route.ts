import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const toolSlug = req.nextUrl.searchParams.get("toolSlug");
  if (!toolSlug) {
    return NextResponse.json({ error: "Missing toolSlug" }, { status: 400 });
  }

  const profile = await prisma.userToolProfile.findUnique({
    where: { userId_toolSlug: { userId: session.user.id, toolSlug } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ answers: profile.answers });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { toolSlug, answers } = body as { toolSlug: string; answers: Record<string, string> };
  if (!toolSlug || !answers) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.userToolProfile.upsert({
    where: { userId_toolSlug: { userId: session.user.id, toolSlug } },
    create: { userId: session.user.id, toolSlug, answers },
    update: { answers },
  });

  return NextResponse.json({ ok: true });
}
