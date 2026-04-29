"use client";

import { useTranslations } from "next-intl";
import { questions, Question } from "@/lib/questions";
import { Button } from "@/components/ui/Button";

interface ReviewScreenProps {
  answers: Record<number, string>;
  onEdit: (step: number) => void;
  onGenerate: () => void;
  onBack: () => void;
  apiError: string;
  getQuestionLabel: (id: number) => string;
  getSectionLabel: (section: string) => string;
}

function formatAnswer(q: Question, raw: string): string | null {
  if (!raw || !raw.trim()) return null;

  if (q.type === "fields") {
    try {
      const obj = JSON.parse(raw) as Record<string, string>;
      const parts = (q.fields ?? [])
        .filter((f) => obj[f.key]?.trim())
        .map((f) => `${f.label}: ${obj[f.key].trim()}`);
      return parts.length ? parts.join(" · ") : null;
    } catch {
      return null;
    }
  }

  if (q.type === "multi") {
    try {
      const arr = (JSON.parse(raw) as string[])
        .filter((o) => o !== "Write it myself")
        .map((o) => (o.startsWith("Custom: ") ? o.replace("Custom: ", "") : o))
        .filter(Boolean);
      return arr.length ? arr.join(", ") : null;
    } catch {
      return raw || null;
    }
  }
  const cleaned = raw.startsWith("Custom: ") ? raw.replace("Custom: ", "") : raw;
  return cleaned.trim() || null;
}

const SECTIONS = (() => {
  const map: { label: string; ids: number[] }[] = [];
  const seen = new Set<string>();
  for (const q of questions) {
    if (!seen.has(q.section)) {
      seen.add(q.section);
      map.push({ label: q.section, ids: [] });
    }
    map[map.length - 1].ids.push(q.id);
  }
  return map;
})();

export function ReviewScreen({
  answers,
  onEdit,
  onGenerate,
  onBack,
  apiError,
  getQuestionLabel,
  getSectionLabel,
}: ReviewScreenProps) {
  const t = useTranslations("review");

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {t("subtitle")}
          </p>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t("title")}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("desc")}</p>
        </div>

        {/* Answer groups */}
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.label} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {getSectionLabel(section.label)}
              </h2>
              <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 overflow-hidden dark:divide-neutral-800 dark:border-neutral-700">
                {section.ids.map((id) => {
                  const q = questions[id - 1];
                  const formatted = formatAnswer(q, answers[id] ?? "");
                  const skipped = formatted === null;

                  return (
                    <div
                      key={id}
                      className="flex items-start justify-between gap-4 px-4 py-3 bg-white hover:bg-neutral-50 transition-colors group dark:bg-neutral-900 dark:hover:bg-neutral-800"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs text-neutral-400">
                          {getQuestionLabel(id)}
                        </p>
                        {skipped ? (
                          <p className="text-sm italic text-neutral-300 dark:text-neutral-600">
                            {q.required ? t("notAnswered") : t("skipped")}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-neutral-900 break-words dark:text-neutral-100">
                            {formatted}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onEdit(id)}
                        className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                      >
                        {t("editBtn")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {apiError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:border-red-900 dark:text-red-400">
            {apiError}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onBack}>
            {t("backBtn")}
          </Button>
          <Button onClick={onGenerate}>
            {t("generateBtn")}
          </Button>
        </div>
      </div>
    </main>
  );
}
