import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(req: NextRequest) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { name: true, email: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
