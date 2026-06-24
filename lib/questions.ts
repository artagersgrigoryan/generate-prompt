// Shared question types for the wizard engine.
// The actual question SETS live per-tool in `lib/tools/<slug>.ts` and are
// surfaced through the tool registry (`lib/tools`). Keeping the types here lets
// the generic wizard components depend on the shape without importing any one
// tool's data.

export type QuestionType = "single" | "multi" | "text" | "fields";

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface Question {
  id: number;
  section: string;
  label: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  maxSelections?: number;
  fields?: FieldDef[];
  hint?: string;
  rows?: number;
  showColorPalettes?: boolean;
  showStylePreviews?: boolean;
  contentAlertOptions?: string[];
}
