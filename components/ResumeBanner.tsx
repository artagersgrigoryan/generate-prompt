"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import {
  WIZARD_TOTAL_QUESTIONS,
  clearWizardDraft,
  readWizardDraft,
  type WizardDraft,
} from "@/lib/draft";

export default function ResumeBanner() {
  const t = useTranslations("home");
  const router = useRouter();
  const [draft, setDraft] = useState<WizardDraft | null>(null);

  useEffect(() => {
    setDraft(readWizardDraft());
  }, []);

  if (!draft) return null;

  let positionLabel: string;
  if (draft.phase === "result") {
    positionLabel = t("resumeBriefReady");
  } else if (draft.phase === "review") {
    positionLabel = t("resumeReadyReview");
  } else {
    const current = Math.max(1, draft.step || 1);
    positionLabel = t("resumePosition", {
      current,
      total: WIZARD_TOTAL_QUESTIONS,
    });
  }

  function handleStartFresh() {
    clearWizardDraft();
    setDraft(null);
    router.push("/generator");
  }

  return (
    <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {t("resumeBadge")}
          </span>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span className="text-neutral-500 dark:text-neutral-400">
            {positionLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartFresh}
            className="rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {t("resumeStartFresh")}
          </button>
          <Link
            href="/generator"
            className="rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
          >
            {t("resumeContinue")}
          </Link>
        </div>
      </div>
    </div>
  );
}
