import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership before deleting
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (prompt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.prompt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
