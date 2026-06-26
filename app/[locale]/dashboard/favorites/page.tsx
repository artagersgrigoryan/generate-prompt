import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PromptCard } from "@/components/dashboard/PromptCard";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const t = await getTranslations("dashboard");

  const prompts = await prisma.prompt.findMany({
    where: { userId: session!.user.id, isFavorite: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, result: true, model: true, isFavorite: true, createdAt: true, toolSlug: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {t("favorites")}
      </h1>

      {prompts.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">{t("noFavorites")}</p>
      ) : (
        <div className="space-y-2">
          {prompts.map((p: (typeof prompts)[number]) => (
            <PromptCard
              key={p.id}
              prompt={{ ...p, createdAt: p.createdAt.toISOString() }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
