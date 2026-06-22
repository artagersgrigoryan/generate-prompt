import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const userId = await requireAuth();
  if (userId instanceof NextResponse) return userId;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const favoritesOnly = searchParams.get("favorites") === "true";

  const where = {
    userId,
    ...(favoritesOnly ? { isFavorite: true } : {}),
  };

  const [prompts, total] = await Promise.all([
    prisma.prompt.findMany({
      where,
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
    prisma.prompt.count({ where }),
  ]);

  return NextResponse.json({ prompts, total, page, limit });
}
