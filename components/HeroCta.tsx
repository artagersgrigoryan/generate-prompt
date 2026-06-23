"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { readWizardDraft } from "@/lib/draft";
import { DEFAULT_TOOL_SLUG } from "@/lib/tools/slugs";

export default function HeroCta() {
  const t = useTranslations("home");
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    setHasDraft(readWizardDraft(DEFAULT_TOOL_SLUG) !== null);
  }, []);

  return (
    <Link
      href={`/tools/${DEFAULT_TOOL_SLUG}`}
      className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
    >
      {hasDraft ? t("heroCtaContinue") : t("heroCta")}
    </Link>
  );
}
