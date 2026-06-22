import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PromptCard } from "@/components/dashboard/PromptCard";

export default async function HistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const t = await getTranslations("dashboard");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const limit = 20;

  const userId = session!.user.id;

  const [prompts, total] = await Promise.all([
    prisma.prompt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, result: true, model: true, isFavorite: true, createdAt: true },
    }),
    prisma.prompt.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {t("history")}
      </h1>

      {prompts.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">{t("noPrompts")}</p>
      ) : (
        <>
          <div className="space-y-2">
            {prompts.map((p: (typeof prompts)[number]) => (
              <PromptCard
                key={p.id}
                prompt={{ ...p, createdAt: p.createdAt.toISOString() }}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <p className="text-sm text-neutral-400">
                {t("pageOf", { page, total: totalPages })}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`?page=${page - 1}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    {t("previous")}
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`?page=${page + 1}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    {t("next")}
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
