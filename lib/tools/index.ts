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
import { DEFAULT_TOOL_SLUG } from "./slugs";

export type { ToolConfig, ToolPublicConfig, ToolSection } from "./types";
export { toPublicTool } from "./types";
export { DEFAULT_TOOL_SLUG, WEBSITE_PROMPT_GENERATOR_SLUG } from "./slugs";

const ALL_TOOLS: ToolConfig[] = [websitePromptGenerator];

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
