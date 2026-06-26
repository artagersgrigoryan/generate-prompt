import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12 text-center">
      <div className="space-y-6">
        <p className="select-none text-[8rem] font-bold leading-none text-neutral-200 dark:text-neutral-800">
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {t("title")}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
        >
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
