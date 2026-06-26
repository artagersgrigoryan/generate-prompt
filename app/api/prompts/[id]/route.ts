import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const { result } = await req.json();

  if (typeof result !== "string" || !result.trim()) {
    return NextResponse.json({ error: "Invalid result" }, { status: 400 });
  }

  const { count } = await prisma.prompt.updateMany({
    where: { id, userId },
    data: { result },
  });

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;

  const { count } = await prisma.prompt.deleteMany({
    where: { id, userId },
  });

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
