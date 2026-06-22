import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { Link } from "@/i18n/routing";

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");

  const [prompts, total, favoriteCount] = await prisma.$transaction([
    prisma.prompt.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, result: true, model: true, isFavorite: true, createdAt: true },
    }),
    prisma.prompt.count({ where: { userId: session!.user.id } }),
    prisma.prompt.count({ where: { userId: session!.user.id, isFavorite: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {session!.user.name ?? session!.user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{total}</p>
          <p className="mt-0.5 text-sm text-neutral-500">{t("totalPrompts")}</p>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{favoriteCount}</p>
          <p className="mt-0.5 text-sm text-neutral-500">{t("totalFavorites")}</p>
        </div>
      </div>

      {/* Recent prompts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("recentPrompts")}
          </h2>
          {total > 5 && (
            <Link
              href="/dashboard/history"
              className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              {t("viewAll")} →
            </Link>
          )}
        </div>
        {prompts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-700">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">{t("noPrompts")}</p>
            <Link
              href="/generator"
              className="mt-3 inline-block text-sm font-medium text-neutral-700 underline underline-offset-2 dark:text-neutral-300"
            >
              {t("generateFirst")}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {prompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={{ ...p, createdAt: p.createdAt.toISOString() }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
