import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const favoritesOnly = searchParams.get("favorites") === "true";

  const [prompts, total] = await prisma.$transaction([
    prisma.prompt.findMany({
      where: {
        userId: session.user.id,
        ...(favoritesOnly ? { isFavorite: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        result: true,
        model: true,
        isFavorite: true,
        createdAt: true,
      },
    }),
    prisma.prompt.count({
      where: {
        userId: session.user.id,
        ...(favoritesOnly ? { isFavorite: true } : {}),
      },
    }),
  ]);

  return NextResponse.json({ prompts, total, page, limit });
}
