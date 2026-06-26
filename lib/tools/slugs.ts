// Client-safe tool slug constants.
//
// IMPORTANT: this module must stay free of server-only data (system prompts,
// fs access, etc.) so client components can import a slug without pulling the
// full registry — and its prompts — into the browser bundle.

export const WEBSITE_PROMPT_GENERATOR_SLUG = "website-prompt-generator";
export const COVER_LETTER_GENERATOR_SLUG = "cover-letter-generator";
export const LINKEDIN_SUMMARY_GENERATOR_SLUG = "linkedin-summary-generator";
export const RESUME_BULLET_POINT_GENERATOR_SLUG = "resume-bullet-point-generator";
export const ELEVATOR_PITCH_GENERATOR_SLUG = "elevator-pitch-generator";
export const THANK_YOU_EMAIL_GENERATOR_SLUG = "thank-you-email-generator";
export const PERSONAL_BIO_GENERATOR_SLUG = "personal-bio-generator";
export const RESIGNATION_LETTER_GENERATOR_SLUG = "resignation-letter-generator";
export const LINKEDIN_RECOMMENDATION_GENERATOR_SLUG = "linkedin-recommendation-generator";
export const EMAIL_SUBJECT_LINE_GENERATOR_SLUG = "email-subject-line-generator";
export const COLD_OUTREACH_EMAIL_GENERATOR_SLUG = "cold-outreach-email-generator";
export const SOCIAL_BIO_GENERATOR_SLUG = "social-bio-generator";

export const DEFAULT_TOOL_SLUG = WEBSITE_PROMPT_GENERATOR_SLUG;
