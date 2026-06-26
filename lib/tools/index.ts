// Tool registry — the single source of truth for every small tool on the
// platform. Adding a new tool = create `lib/tools/<slug>.ts` exporting a
// `ToolConfig`, then register it in `TOOLS` below. Routing, the hub gallery,
// the sitemap, and the dashboard all read from here automatically.
//
// SERVER-ONLY: this module exposes `systemPrompt`. Do not import it from a
// client component. Client components import slugs from `./slugs` and receive
// public tool data as props from server components.

import type { ToolConfig } from "./types";
import { websitePromptGenerator } from "./website-prompt-generator";
import { coverLetterGenerator } from "./cover-letter-generator";
import { linkedinSummaryGenerator } from "./linkedin-summary-generator";
import { resumeBulletPointGenerator } from "./resume-bullet-point-generator";
import { elevatorPitchGenerator } from "./elevator-pitch-generator";
import { thankYouEmailGenerator } from "./thank-you-email-generator";
import { personalBioGenerator } from "./personal-bio-generator";
import { resignationLetterGenerator } from "./resignation-letter-generator";
import { linkedinRecommendationGenerator } from "./linkedin-recommendation-generator";
import { emailSubjectLineGenerator } from "./email-subject-line-generator";
import { coldOutreachEmailGenerator } from "./cold-outreach-email-generator";
import { socialBioGenerator } from "./social-bio-generator";
import { DEFAULT_TOOL_SLUG } from "./slugs";

export type { ToolConfig, ToolPublicConfig, ToolSection, SeoContent, SeoFaq, SeoStep, SeoBenefit, SeoUseCase, SeoIconName } from "./types";
export { toPublicTool } from "./types";
export {
  DEFAULT_TOOL_SLUG,
  WEBSITE_PROMPT_GENERATOR_SLUG,
  COVER_LETTER_GENERATOR_SLUG,
  LINKEDIN_SUMMARY_GENERATOR_SLUG,
  RESUME_BULLET_POINT_GENERATOR_SLUG,
  ELEVATOR_PITCH_GENERATOR_SLUG,
  THANK_YOU_EMAIL_GENERATOR_SLUG,
  PERSONAL_BIO_GENERATOR_SLUG,
  RESIGNATION_LETTER_GENERATOR_SLUG,
  LINKEDIN_RECOMMENDATION_GENERATOR_SLUG,
  EMAIL_SUBJECT_LINE_GENERATOR_SLUG,
  COLD_OUTREACH_EMAIL_GENERATOR_SLUG,
  SOCIAL_BIO_GENERATOR_SLUG,
} from "./slugs";

const ALL_TOOLS: ToolConfig[] = [
  websitePromptGenerator,
  coverLetterGenerator,
  linkedinSummaryGenerator,
  resumeBulletPointGenerator,
  elevatorPitchGenerator,
  thankYouEmailGenerator,
  personalBioGenerator,
  resignationLetterGenerator,
  linkedinRecommendationGenerator,
  emailSubjectLineGenerator,
  coldOutreachEmailGenerator,
  socialBioGenerator,
];

export const TOOLS: Record<string, ToolConfig> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.slug, t])
);

export function getTool(slug: string | undefined): ToolConfig | undefined {
  if (!slug) return undefined;
  return TOOLS[slug];
}

/** All tools, in registration order (used by the hub gallery and sitemap). */
export function listTools(): ToolConfig[] {
  return ALL_TOOLS;
}

/** Resolves a tool's display name from a slug (safe fallback to the slug). */
export function getToolName(slug: string): string {
  return TOOLS[slug]?.name ?? slug;
}
