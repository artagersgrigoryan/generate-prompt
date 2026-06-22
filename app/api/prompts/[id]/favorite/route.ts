import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { userId: true, isFavorite: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (prompt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.prompt.update({
    where: { id },
    data: { isFavorite: !prompt.isFavorite },
    select: { isFavorite: true },
  });

  return NextResponse.json({ isFavorite: updated.isFavorite });
}
