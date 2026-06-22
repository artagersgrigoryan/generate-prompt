import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;

  const prompt = await prisma.prompt.findUnique({
    where: { id, userId },
    select: { isFavorite: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.prompt.update({
    where: { id, userId },
    data: { isFavorite: !prompt.isFavorite },
    select: { isFavorite: true },
  });

  return NextResponse.json({ isFavorite: updated.isFavorite });
}
