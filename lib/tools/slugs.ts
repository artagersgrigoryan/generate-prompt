// Client-safe tool slug constants.
//
// IMPORTANT: this module must stay free of server-only data (system prompts,
// fs access, etc.) so client components can import a slug without pulling the
// full registry — and its prompts — into the browser bundle.

export const WEBSITE_PROMPT_GENERATOR_SLUG = "website-prompt-generator";

export const COVER_LETTER_GENERATOR_SLUG = "cover-letter-generator";

export const DEFAULT_TOOL_SLUG = WEBSITE_PROMPT_GENERATOR_SLUG;
