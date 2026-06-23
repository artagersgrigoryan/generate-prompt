// Per-tool wizard draft persistence (sessionStorage).
//
// Drafts are namespaced by tool slug so multiple tools never clobber each
// other's in-progress state. Key format: `wpg_wizard:<slug>`.

export const WIZARD_SESSION_PREFIX = "wpg_wizard";

/** Total questions in the flagship website tool — used by the homepage ResumeBanner. */
export const WIZARD_TOTAL_QUESTIONS = 13;

export type WizardPhase = "wizard" | "review" | "result" | "loading";

export type WizardDraft = {
  step: number;
  answers: Record<string, string>;
  phase: WizardPhase;
  result: string;
};

/** sessionStorage key for a given tool's draft. */
export function wizardKey(slug: string): string {
  return `${WIZARD_SESSION_PREFIX}:${slug}`;
}

export function readWizardDraft(slug: string): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(wizardKey(slug));
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<WizardDraft>;
    const step = s.step ?? 0;
    const answers = s.answers ?? {};
    const phase = (s.phase ?? "wizard") as WizardPhase;
    const result = s.result ?? "";
    const inProgress =
      step > 0 ||
      Object.keys(answers).length > 0 ||
      phase === "review" ||
      (phase === "result" && result.length > 0);
    if (!inProgress) return null;
    return { step, answers, phase, result };
  } catch {
    return null;
  }
}

export function clearWizardDraft(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(wizardKey(slug));
  } catch {}
}
