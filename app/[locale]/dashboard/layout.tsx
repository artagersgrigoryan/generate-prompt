import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect("/en/auth/signin");

  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex gap-8">
        <aside className="w-44 shrink-0">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("overview")}
            </Link>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("history")}
            </Link>
            <Link
              href="/dashboard/favorites"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("favorites")}
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
