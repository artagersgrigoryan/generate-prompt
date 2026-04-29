"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useMessages } from "next-intl";
import { questions } from "@/lib/questions";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { StepNavigator } from "@/components/wizard/StepNavigator";
import { QuestionStep } from "@/components/wizard/QuestionStep";
import { ResultScreen } from "@/components/wizard/ResultScreen";
import { ReviewScreen } from "@/components/wizard/ReviewScreen";
import { Button } from "@/components/ui/Button";

type Phase = "wizard" | "review" | "loading" | "result";

const TOTAL = questions.length;
const SESSION_KEY = "wpg_wizard";

const SECTION_KEY: Record<string, string> = {
  "Basics": "basics",
  "Audience & Brand": "audience",
  "Content & Pages": "content",
  "Features & Tech": "tech",
};

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

export default function GeneratorPage() {
  const t = useTranslations("generator");
  const messages = useMessages();
  const qmsgs = (messages.questions ?? {}) as Record<string, string>;
  const secMsgs = (messages.sections ?? {}) as Record<
    string,
    { label: string; short: string }
  >;

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
  }, [step, answers, phase, result, resultModel]);

  const currentQ = step >= 1 && step <= TOTAL ? questions[step - 1] : null;

  function getQuestionLabel(id: number): string {
    return qmsgs[`q${id}label`] || questions[id - 1]?.label || "";
  }

  function getSectionLabel(section: string): string {
    const key = SECTION_KEY[section] ?? section;
    return secMsgs[key]?.label ?? section;
  }

  function isAnswerEmpty(q: (typeof questions)[0], val: string): boolean {
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
        body: JSON.stringify({ answers: buildPayload() }),
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
    setResult(
      `Build a website for Sunrise Bakery, a family-owned artisan bakery in Portland, Oregon, specialising in sourdough bread, seasonal pastries, and custom celebration cakes. The primary goal is to drive online pre-orders and in-store visits from local food enthusiasts who value craft and quality.

Design direction: Warm and inviting — cream (#FDF6EC) and warm brown (#6B4226) as the primary palette, with terracotta (#C87941) as an accent. Typography should feel approachable: a round serif for headings paired with a humanist sans-serif for body text. Spacing should be generous to let food photography breathe.

Tone and copy: Friendly and personal — like a note from the baker. Headlines should be evocative ("Baked at 5am. Gone by noon."). CTAs should feel inviting: "Order your loaf," "Reserve a cake."

Pages and content: Home — hero with full-bleed photography, a brief origin story, daily specials highlight, and a CTA to the menu. Menu — a grid of products by category (Breads, Pastries, Cakes) with pricing and availability. Order — a pre-order form with product, quantity, pickup date, and contact details. About — founders' story with family photography and sourcing philosophy. Contact — address, hours, map embed, phone, and email.

Features and functionality: Daily specials updatable via a simple CMS or JSON file. Order form with validation, date picker, and email confirmation. "Sold out" state for unavailable items. Subtle hover animations on product cards.

Tech stack: Next.js with static generation for content pages, server-side for the order form. Deployed on Vercel. Tailwind CSS for styling.

Content handling: Use realistic placeholder content matching the brand voice above. Photography placeholders should indicate warm, natural-light food photography of artisan bread and pastries.`
    );
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

  // ── Result ──────────────────────────────────────────────────────────────────
  if (phase === "result") {
    return (
      <main className="min-h-screen bg-white px-4 py-16 dark:bg-neutral-950">
        <div className="mx-auto max-w-2xl">
          <ResultScreen
            result={result}
            modelName={resultModel}
            hasExistingContent={[
              "I have all text and images ready",
              "I have text but need image guidance",
            ].some((opt) => Object.values(answers).includes(opt))}
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
            <button
              type="button"
              onClick={previewResult}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
            >
              {t("testButton")}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Wizard steps 1–N ────────────────────────────────────────────────────────
  const q = questions[step - 1];
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
