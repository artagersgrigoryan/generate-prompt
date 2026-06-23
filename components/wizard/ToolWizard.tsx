"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations, useMessages } from "next-intl";
import type { Question } from "@/lib/questions";
import type { ToolSection } from "@/lib/tools/types";
import { wizardKey } from "@/lib/draft";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepNavigator } from "@/components/wizard/StepNavigator";
import { QuestionStep } from "@/components/wizard/QuestionStep";
import { ResultScreen } from "@/components/wizard/ResultScreen";
import { ReviewScreen } from "@/components/wizard/ReviewScreen";
import { Button } from "@/components/ui/Button";

type Phase = "wizard" | "review" | "loading" | "result";

interface ToolWizardProps {
  toolSlug: string;
  questions: Question[];
  sections: ToolSection[];
  /** Answer values that mean "I already have content" — shows the attach reminder. */
  existingContentOptions?: string[];
  /** Optional dev-only sample result for the preview button. */
  devPreviewResult?: string;
}

function LoadingDots({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 rounded-full bg-black dark:bg-white"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <p className="text-sm text-neutral-500">{text}</p>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export function ToolWizard({
  toolSlug,
  questions,
  sections,
  existingContentOptions,
  devPreviewResult,
}: ToolWizardProps) {
  const t = useTranslations("generator");
  const messages = useMessages();
  const qmsgs = (messages.questions ?? {}) as Record<string, string>;
  const secMsgs = (messages.sections ?? {}) as Record<
    string,
    { label: string; short: string }
  >;

  const TOTAL = questions.length;
  const SESSION_KEY = wizardKey(toolSlug);

  // Map English Question.section -> i18n sections key.
  const sectionKey = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of sections) m[s.name] = s.key;
    return m;
  }, [sections]);

  const byId = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [phase, setPhase] = useState<Phase>("wizard");
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [skipWarning, setSkipWarning] = useState(false);
  const [result, setResult] = useState("");
  const [resultModel, setResultModel] = useState("");
  const [apiError, setApiError] = useState("");

  const restoredRef = useRef(false);

  useEffect(() => {
    if (!restoredRef.current) {
      restoredRef.current = true;
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const s = JSON.parse(raw) as Partial<{
          step: number;
          answers: Record<number, string>;
          phase: Phase;
          result: string;
          resultModel: string;
        }>;
        if (s.step !== undefined) setStep(s.step);
        if (s.answers) setAnswers(s.answers);
        if (s.phase && s.phase !== "loading") setPhase(s.phase);
        if (s.result) setResult(s.result);
        if (s.resultModel) setResultModel(s.resultModel);
      } catch {}
      return;
    }
    if (phase === "loading") return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ step, answers, phase, result, resultModel }));
    } catch {}
  }, [SESSION_KEY, step, answers, phase, result, resultModel]);

  const currentQ = step >= 1 && step <= TOTAL ? byId.get(step) ?? null : null;

  function getQuestionLabel(id: number): string {
    return qmsgs[`q${id}label`] || byId.get(id)?.label || "";
  }

  function getSectionLabel(section: string): string {
    const key = sectionKey[section] ?? section;
    return secMsgs[key]?.label ?? section;
  }

  function getSectionShort(section: string): string {
    const key = sectionKey[section] ?? section;
    return secMsgs[key]?.short ?? section;
  }

  function isAnswerEmpty(q: Question, val: string): boolean {
    if (!val || !val.trim()) return true;
    if (q.type === "multi") {
      try {
        const arr = JSON.parse(val) as string[];
        return (
          arr.filter(
            (o) => o !== "Write it myself" && !o.startsWith("Custom: ")
          ).length === 0 && !arr.some((o) => o.startsWith("Custom: "))
        );
      } catch {
        return true;
      }
    }
    if (q.type === "fields") {
      try {
        const obj = JSON.parse(val) as Record<string, string>;
        return Object.values(obj).every((v) => !v?.trim());
      } catch {
        return true;
      }
    }
    return !val.trim();
  }

  function validate(): boolean {
    if (!currentQ) return true;
    const val = answers[currentQ.id] ?? "";
    if (!currentQ.required) return true;

    if (currentQ.type === "fields") {
      try {
        const obj = JSON.parse(val) as Record<string, string>;
        const missing = (currentQ.fields ?? []).filter(
          (f) => f.required && !obj[f.key]?.trim()
        );
        if (missing.length) {
          setErrors((e) => ({ ...e, [currentQ.id]: t("errorFillFields") }));
          return false;
        }
      } catch {
        setErrors((e) => ({ ...e, [currentQ.id]: t("errorFillFields") }));
        return false;
      }
      setErrors((e) => {
        const n = { ...e };
        delete n[currentQ.id];
        return n;
      });
      return true;
    }

    if (currentQ.type === "multi") {
      try {
        const arr = JSON.parse(val) as string[];
        if (
          arr.filter((o) => !o.startsWith("Custom: ")).length === 0 &&
          !arr.some((o) => o.startsWith("Custom: "))
        ) {
          setErrors((e) => ({ ...e, [currentQ.id]: t("errorSelectOne") }));
          return false;
        }
        if (
          arr.includes("Write it myself") &&
          !arr.some((o) => o.startsWith("Custom: "))
        ) {
          setErrors((e) => ({ ...e, [currentQ.id]: t("errorCustomAnswer") }));
          return false;
        }
      } catch {
        setErrors((e) => ({ ...e, [currentQ.id]: t("errorSelectOne") }));
        return false;
      }
    } else {
      if (!val.trim()) {
        setErrors((e) => ({ ...e, [currentQ.id]: t("errorRequired") }));
        return false;
      }
      if (val === "Custom: ") {
        setErrors((e) => ({ ...e, [currentQ.id]: t("errorCustomAnswer") }));
        return false;
      }
    }
    setErrors((e) => {
      const n = { ...e };
      delete n[currentQ.id];
      return n;
    });
    return true;
  }

  function advance() {
    setSkipWarning(false);
    if (editingFromReview) {
      setEditingFromReview(false);
      setPhase("review");
      return;
    }
    if (step < TOTAL) {
      setStep((s) => s + 1);
    } else {
      setPhase("review");
    }
  }

  function handleNext() {
    if (!validate()) return;
    if (
      currentQ &&
      !currentQ.required &&
      isAnswerEmpty(currentQ, answers[currentQ.id] ?? "") &&
      !skipWarning
    ) {
      setSkipWarning(true);
      return;
    }
    advance();
  }

  function handleBack() {
    setSkipWarning(false);
    if (editingFromReview) {
      setEditingFromReview(false);
      setPhase("review");
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  }

  function handleEditFromReview(stepId: number) {
    setStep(stepId);
    setEditingFromReview(true);
    setPhase("wizard");
  }

  function buildPayload(): Record<string, string> {
    const payload: Record<string, string> = {};
    for (const q of questions) {
      const raw = answers[q.id] ?? "";
      if (!raw) continue;

      if (q.type === "fields") {
        try {
          const obj = JSON.parse(raw) as Record<string, string>;
          const parts = (q.fields ?? [])
            .filter((f) => obj[f.key]?.trim())
            .map((f) => `${f.label}: ${obj[f.key].trim()}`);
          if (parts.length) payload[q.label] = parts.join(", ");
        } catch {
          /* skip */
        }
      } else if (q.type === "multi") {
        try {
          const arr = (JSON.parse(raw) as string[])
            .map((o) => (o.startsWith("Custom: ") ? o.replace("Custom: ", "") : o))
            .filter((o) => o !== "Write it myself");
          payload[`Q${q.id} — ${q.label}`] = arr.join(", ");
        } catch {
          payload[`Q${q.id} — ${q.label}`] = raw;
        }
      } else {
        payload[`Q${q.id} — ${q.label}`] = raw.startsWith("Custom: ")
          ? raw.replace("Custom: ", "")
          : raw;
      }
    }
    return payload;
  }

  async function generate() {
    setPhase("loading");
    setApiError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug, answers: buildPayload() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setResult(data.result);
      setResultModel(data.model);
      setPhase("result");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("review");
    }
  }

  function previewResult() {
    if (!devPreviewResult) return;
    setResult(devPreviewResult);
    setResultModel("Claude Haiku");
    setPhase("result");
  }

  function startOver() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setStep(0);
    setAnswers({});
    setErrors({});
    setResult("");
    setResultModel("");
    setApiError("");
    setEditingFromReview(false);
    setPhase("wizard");
  }

  const hasExistingContent = (existingContentOptions ?? []).some((opt) =>
    Object.values(answers).includes(opt)
  );

  // ── Result ──────────────────────────────────────────────────────────────────
  if (phase === "result") {
    return (
      <main className="min-h-screen bg-white px-4 py-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-2xl">
          <ResultScreen
            result={result}
            modelName={resultModel}
            hasExistingContent={hasExistingContent}
            onRegenerate={generate}
            onStartOver={startOver}
            loading={false}
          />
        </div>
      </main>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <main className="min-h-screen bg-white px-4 py-16 flex items-center justify-center dark:bg-neutral-950">
        <LoadingDots text={t("loading")} />
      </main>
    );
  }

  // ── Review ──────────────────────────────────────────────────────────────────
  if (phase === "review") {
    return (
      <ReviewScreen
        questions={questions}
        answers={answers}
        onEdit={handleEditFromReview}
        onGenerate={generate}
        onBack={() => {
          setStep(TOTAL);
          setPhase("wizard");
        }}
        apiError={apiError}
        getQuestionLabel={getQuestionLabel}
        getSectionLabel={getSectionLabel}
      />
    );
  }

  // ── Intro (step 0) ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <main className="min-h-screen bg-white px-4 py-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-2xl space-y-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {t("brand")}
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("introTitle")}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">{t("introDesc")}</p>
          </div>

          {apiError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:border-red-900 dark:text-red-400">
              {apiError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setStep(1)} className="w-full sm:w-auto">
              {t("startButton")}
            </Button>
            {process.env.NODE_ENV === "development" && devPreviewResult && (
              <button
                type="button"
                onClick={previewResult}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
              >
                {t("testButton")}
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ── Wizard steps 1–N ────────────────────────────────────────────────────────
  const q = currentQ!;
  const isLast = step === TOTAL;
  const translatedSection = getSectionLabel(q.section);

  return (
    <main className="min-h-screen bg-white px-4 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl space-y-6">
        <ProgressBar current={step} total={TOTAL} section={translatedSection} />
        <StepNavigator
          currentStep={step}
          answers={answers}
          onNavigate={(s) => {
            setEditingFromReview(false);
            setSkipWarning(false);
            setStep(s);
          }}
          questions={questions}
          getQuestionLabel={getQuestionLabel}
          getSectionShort={getSectionShort}
        />

        <section className="space-y-5">
          <div className="flex items-start gap-2">
            <h2 className="text-xl font-semibold text-neutral-900 leading-snug dark:text-neutral-100">
              {getQuestionLabel(q.id)}
            </h2>
            {!q.required && (
              <span className="mt-1 shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
                {t("optional")}
              </span>
            )}
          </div>

          <QuestionStep
            key={q.id}
            question={q}
            value={answers[q.id] ?? ""}
            onChange={(val) => {
              setAnswers((a) => ({ ...a, [q.id]: val }));
              if (errors[q.id]) {
                setErrors((e) => {
                  const n = { ...e };
                  delete n[q.id];
                  return n;
                });
              }
            }}
            error={errors[q.id]}
          />
        </section>

        {apiError && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:border-red-900 dark:text-red-400">
            {apiError}
          </p>
        )}

        {skipWarning && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-blue-900">
                {t("skipWarningTitle")}
              </p>
              <p className="text-xs text-blue-700">{t("skipWarningDesc")}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleBack}>
            {editingFromReview ? t("btnCancel") : t("btnBack")}
          </Button>
          <Button onClick={handleNext}>
            {editingFromReview
              ? t("btnSaveBack")
              : skipWarning
              ? t("btnSkipContinue")
              : isLast
              ? t("btnReviewAnswers")
              : t("btnNext")}
          </Button>
        </div>
      </div>
    </main>
  );
}
