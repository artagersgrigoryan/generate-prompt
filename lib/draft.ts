export const WIZARD_SESSION_KEY = "wpg_wizard";
export const WIZARD_TOTAL_QUESTIONS = 13;

export type WizardPhase = "wizard" | "review" | "result" | "loading";

export type WizardDraft = {
  step: number;
  answers: Record<string, string>;
  phase: WizardPhase;
  result: string;
};

export function readWizardDraft(): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(WIZARD_SESSION_KEY);
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

export function clearWizardDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(WIZARD_SESSION_KEY);
  } catch {}
}
