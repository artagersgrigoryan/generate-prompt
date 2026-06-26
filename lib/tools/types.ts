import type { Question } from "@/lib/questions";

export type SeoIconName =
  | "clock" | "zap" | "copy" | "check" | "target" | "users"
  | "sparkles" | "pencil" | "mail" | "globe" | "briefcase" | "star";

export interface SeoFaq { question: string; answer: string }
export interface SeoStep { title: string; description: string }
export interface SeoBenefit { icon: SeoIconName; title: string; description: string }
export interface SeoUseCase { title: string; description: string }

export interface SeoContent {
  tagline: string;
  benefits: SeoBenefit[];
  howItWorks: SeoStep[];
  useCases: SeoUseCase[];
  faqs: SeoFaq[];
}

export interface ToolSection {
  /** English section name exactly as used in `Question.section`. */
  name: string;
  /** i18n key under the `sections` namespace (e.g. "basics"). */
  key: string;
}

/**
 * The client-safe shape of a tool — everything the wizard UI needs.
 * Deliberately excludes `systemPrompt` so it can be passed from a server
 * component to the client `<ToolWizard>` without leaking the prompt.
 */
export interface ToolPublicConfig {
  slug: string;
  /** Display name fallback (UI copy is i18n-driven; this is a safe default). */
  name: string;
  /** Short description for the tools gallery and metadata. */
  description: string;
  /** Ordered sections; maps each `Question.section` to its i18n `sections` key. */
  sections: ToolSection[];
  /** The question set powering the wizard. */
  questions: Question[];
  /** Answer values meaning "I already have content" — triggers the attach reminder. */
  existingContentOptions?: string[];
  /** Optional dev-only sample result shown behind the preview button. */
  devPreviewResult?: string;
  /** Question IDs whose answers are saved/loaded from the user's profile. */
  profileQuestionIds?: number[];
  /** Controls which result screen to render. "prompt" shows platform tabs; "letter" shows a plain letter view. */
  resultMode?: "prompt" | "letter";
}

/**
 * The full tool config, including SERVER-ONLY fields.
 *
 * IMPORTANT: never import the registry (or this type's `systemPrompt`) from a
 * client component. Server components/route handlers read the full config and
 * hand only `ToolPublicConfig` fields to the client.
 */
export interface ToolConfig extends ToolPublicConfig {
  /** SERVER ONLY — system prompt for `/api/generate`. */
  systemPrompt: string;
  /** Anthropic `max_tokens` (default 4096). */
  maxOutputTokens?: number;
  /** SERVER ONLY — SEO intro content rendered above the wizard. */
  seoContent?: SeoContent;
}

/** Strips server-only fields so a tool can be sent to the client safely. */
export function toPublicTool(tool: ToolConfig): ToolPublicConfig {
  const { slug, name, description, sections, questions, existingContentOptions, devPreviewResult, profileQuestionIds, resultMode } = tool;
  return { slug, name, description, sections, questions, existingContentOptions, devPreviewResult, profileQuestionIds, resultMode };
}
