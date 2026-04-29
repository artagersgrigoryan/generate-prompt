"use client";

import { useTranslations } from "next-intl";

interface ProgressBarProps {
  current: number;
  total: number;
  section: string;
}

export function ProgressBar({ current, total, section }: ProgressBarProps) {
  const t = useTranslations("progress");
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span className="font-medium text-neutral-700 dark:text-neutral-300">{section}</span>
        <span>{t("stepOf", { current, total })}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-full rounded-full bg-black dark:bg-white transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
