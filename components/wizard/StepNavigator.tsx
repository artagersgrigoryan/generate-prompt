"use client";

import { useEffect, useRef } from "react";
import { useMessages } from "next-intl";
import { questions } from "@/lib/questions";

interface StepNavigatorProps {
  currentStep: number;
  answers: Record<number, string>;
  onNavigate: (step: number) => void;
}

type StepState = "done" | "current" | "future";

function hasAnswer(value: string | undefined): boolean {
  if (!value) return false;
  if (value === "Custom: ") return false;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed))
      return parsed.filter((o) => o !== "Write it myself").length > 0;
    if (typeof parsed === "object" && parsed !== null)
      return Object.values(parsed).some(
        (v) => typeof v === "string" && v.trim().length > 0
      );
  } catch {
    /* not JSON */
  }
  return value.trim().length > 0;
}

// Maps question.section (English key) → messages.sections key
const SECTION_KEY: Record<string, string> = {
  "Basics": "basics",
  "Audience & Brand": "audience",
  "Content & Pages": "content",
  "Features & Tech": "tech",
};

const SECTION_DEFS: { label: string; ids: number[] }[] = [];
const seen = new Set<string>();
for (const q of questions) {
  if (!seen.has(q.section)) {
    seen.add(q.section);
    SECTION_DEFS.push({ label: q.section, ids: [] });
  }
  SECTION_DEFS[SECTION_DEFS.length - 1].ids.push(q.id);
}

const Checkmark = () => (
  <svg
    viewBox="0 0 10 8"
    fill="none"
    className="h-2.5 w-2.5"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 4l2.5 2.5L9 1" />
  </svg>
);

interface CircleProps {
  id: number;
  state: StepState;
  label: string;
  onNavigate: (id: number) => void;
  size?: "sm" | "md";
}

function Circle({ id, state, label, onNavigate, size = "sm" }: CircleProps) {
  const dim = size === "md" ? "h-8 w-8 text-sm" : "h-7 w-7 text-xs";
  return (
    <button
      data-step={id}
      type="button"
      onClick={() => onNavigate(id)}
      title={label}
      aria-label={label}
      className={[
        "flex shrink-0 items-center justify-center rounded-full font-semibold transition-all active:scale-95",
        dim,
        state === "done"
          ? "bg-black text-white hover:bg-neutral-700"
          : state === "current"
          ? "bg-black text-white ring-2 ring-black ring-offset-2"
          : "border border-neutral-300 bg-white text-neutral-400 hover:border-neutral-500 hover:text-neutral-600",
      ].join(" ")}
    >
      {state === "done" ? <Checkmark /> : id}
    </button>
  );
}

export function StepNavigator({
  currentStep,
  answers,
  onNavigate,
}: StepNavigatorProps) {
  const messages = useMessages();
  const secMsgs = (messages.sections ?? {}) as Record<
    string,
    { label: string; short: string }
  >;
  const qmsgs = (messages.questions ?? {}) as Record<string, string>;

  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    [mobileRef, desktopRef].forEach(({ current: container }) => {
      if (!container || container.clientWidth === 0) return;
      const el = container.querySelector(
        `[data-step="${currentStep}"]`
      ) as HTMLElement | null;
      if (!el) return;
      const target =
        container.scrollLeft +
        el.getBoundingClientRect().left -
        container.getBoundingClientRect().left -
        container.clientWidth / 2 +
        el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    });
  }, [currentStep]);

  function getState(id: number): StepState {
    if (id === currentStep) return "current";
    if (hasAnswer(answers[id])) return "done";
    return "future";
  }

  function getSectionShort(sectionLabel: string): string {
    const key = SECTION_KEY[sectionLabel] ?? sectionLabel;
    return secMsgs[key]?.short ?? sectionLabel;
  }

  function getQuestionLabel(id: number): string {
    return qmsgs[`q${id}label`] || questions[id - 1]?.label || "";
  }

  return (
    <>
      {/* ── Mobile ────────────────────────────────────────────────────────── */}
      <div
        ref={mobileRef}
        className="sm:hidden overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex min-w-max items-end gap-3 p-1">
          {SECTION_DEFS.map((section, si) => (
            <div key={section.label} className="flex items-end gap-2">
              {si > 0 && (
                <div className="mb-4 h-px w-6 shrink-0 bg-neutral-300" />
              )}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  {getSectionShort(section.label)}
                </span>
                <div className="flex gap-2">
                  {section.ids.map((id) => (
                    <Circle
                      key={id}
                      id={id}
                      state={getState(id)}
                      label={getQuestionLabel(id)}
                      onNavigate={onNavigate}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop ───────────────────────────────────────────────────────── */}
      <div ref={desktopRef} className="hidden sm:block overflow-x-auto">
        <div className="flex min-w-max items-end gap-4 p-1">
          {SECTION_DEFS.map((section, si) => (
            <div key={section.label} className="flex items-end gap-2">
              {si > 0 && (
                <div className="mb-3.5 h-px w-4 shrink-0 bg-neutral-200" />
              )}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  {getSectionShort(section.label)}
                </span>
                <div className="flex gap-1.5">
                  {section.ids.map((id) => (
                    <Circle
                      key={id}
                      id={id}
                      state={getState(id)}
                      label={getQuestionLabel(id)}
                      onNavigate={onNavigate}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
