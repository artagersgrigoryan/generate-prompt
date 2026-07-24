# CLAUDE.md

Start every meassage with "Hey Artagers"
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (auto-picks next available port if 3000 is busy)
npm run build    # production build + TypeScript check
npm run lint     # ESLint
npm start        # serve production build
```

No test suite is configured.

## Architecture

### Platform overview

This is a **multi-tool AI prompt platform**. Each tool is a short wizard that asks focused questions and produces a structured AI prompt. Current tools: Website Prompt Generator and Cover Letter Generator. Tools are registered in `lib/tools/` and new ones can be added there without touching routing or the API.

### Routing

All real pages live under `app/[locale]/` (locales: `en`, `hy`, `ru`). The root `app/page.tsx` is a thin redirect to `/en`. The root `app/layout.tsx` renders only `{children}` — the `<html>` and `<body>` tags are in `app/[locale]/layout.tsx` so the `lang` attribute can be set per locale.

The locale middleware lives in `proxy.ts` at the project root (Next.js 16 renamed the convention from `middleware.ts` to `proxy.ts`). It runs `createMiddleware(routing)` from next-intl to handle locale detection and prefix routing.

Key routes:
- `/[locale]` — landing page (SSR, hero + tools gallery)
- `/[locale]/tools/[toolSlug]` — wizard for a specific tool (client-side)
- `/[locale]/blog` — blog index
- `/[locale]/blog/[slug]` — individual MDX post
- `/[locale]/auth/signin` — magic-link + OAuth sign-in
- `/[locale]/dashboard` — signed-in user dashboard
- `/rss.xml` — RSS 2.0 feed (Node route handler)
- Old `/generator` and `/:locale/generator` redirect 301 → `/en/tools/website-prompt-generator`

### Header offset

The `<Header>` is `position: fixed` and out of document flow. `app/[locale]/layout.tsx` wraps `{children}` in `<div className="pt-16">` to reserve the 64 px header height on every page. Pages that intentionally want content to sit under the transparent header (e.g. the landing hero) opt out with `-mt-16` on their top-level element.

### Request flow

```
Browser → /[locale]/tools/[toolSlug]   (client-side ToolWizard)
  → POST /api/generate                  ({ toolSlug, answers } → Anthropic SDK → { result, model })
  → GET/PUT /api/profile                (load/save per-user per-tool profile answers)
```

`/api/generate` resolves `toolSlug` to a `ToolConfig`, validates answers, enforces rate limits and the anonymous free-tier gate, calls the Anthropic API, then saves the prompt to the DB and fires the Telegram analytics side-effect.

### Tool registry

Tool config lives in `lib/tools/`:

| File | Purpose |
|---|---|
| `lib/tools/slugs.ts` | Client-safe slug constants (`WEBSITE_PROMPT_GENERATOR_SLUG`, `COVER_LETTER_GENERATOR_SLUG`, `DEFAULT_TOOL_SLUG`) |
| `lib/tools/types.ts` | `ToolConfig` (server-only, includes `systemPrompt`), `ToolPublicConfig` (client-safe), `toPublicTool()` |
| `lib/tools/website-prompt-generator.ts` | All 13 questions, sections, and system prompt for the WPG tool |
| `lib/tools/cover-letter-generator.ts` | 6 questions (IDs 20–25), 3 sections, system prompt for the CLG tool |
| `lib/tools/index.ts` | `ALL_TOOLS` array, `getTool(slug)`, `listTools()` (returns `ToolPublicConfig[]`), `getToolName(slug)` |

`ToolConfig` must never reach the client bundle (it contains the full system prompt). `toPublicTool()` strips it; `listTools()` already calls it. The tool page passes only the public config to `<ToolWizard>`.

#### ToolConfig fields (server-only)

```ts
interface ToolConfig extends ToolPublicConfig {
  systemPrompt: string;
  maxOutputTokens?: number;   // default 4096 if omitted
}
```

#### ToolPublicConfig fields (client-safe)

```ts
interface ToolPublicConfig {
  slug: string;
  name: string;
  description: string;
  sections: ToolSection[];
  questions: Question[];
  existingContentOptions?: string[];
  devPreviewResult?: string;
  profileQuestionIds?: number[];   // IDs saved/loaded from UserToolProfile
  resultMode?: "prompt" | "letter"; // "prompt" = platform tabs; "letter" = plain text view
}
```

`resultMode` controls which result screen renders: `"prompt"` (default) shows the platform-tab `<ResultScreen>`; `"letter"` shows `<LetterResultScreen>` with copy/regenerate only.

`profileQuestionIds` lists question IDs whose answers are persisted to `UserToolProfile` so returning signed-in users don't re-type them (e.g. name, skills, top achievement for the CLG).

### Adding a new tool

1. Create `lib/tools/<slug>.ts` exporting a `ToolConfig` object.
2. Import and add it to `ALL_TOOLS` in `lib/tools/index.ts`.
3. Add its slug to `lib/tools/slugs.ts` and use that constant as the `TOOL_VISUALS` key in `components/ToolsGallery.tsx` (plain string literals silently fall through to FALLBACK_VISUALS).
4. Add visual config to `TOOL_VISUALS` in `components/ToolsGallery.tsx`.
5. Add questions translation keys to `messages/en.json`; add only those new keys with **proper translations** (not placeholders) to `messages/hy.json` and `messages/ru.json`.
6. Run `npx prisma db push` if you need schema changes.

No routing changes needed — `app/[locale]/tools/[toolSlug]/page.tsx` uses `generateStaticParams` driven by `listTools()`.

### Generic wizard component

`components/wizard/ToolWizard.tsx` is the parameterized wizard shell. It receives:

```tsx
interface ToolWizardProps {
  toolSlug: string;
  questions: Question[];
  sections: ToolSection[];
  existingContentOptions?: string[];
  devPreviewResult?: string;
  profileQuestionIds?: number[];
  resultMode?: "prompt" | "letter";
  userId?: string;              // from server-side auth(); enables profile load/save
}
```

It uses `wizardKey(toolSlug)` (from `lib/draft.ts`) for per-tool sessionStorage namespacing so different tools don't clobber each other's in-progress drafts.

### i18n

- **Library**: next-intl v4 with `defineRouting` + `createNavigation` in `i18n/routing.ts`
- **Config**: `i18n/request.ts` — loads the locale's JSON, falls back to `en.json` on error
- **Message files**: `messages/en.json`, `messages/hy.json`, `messages/ru.json`
  - `hy.json` and `ru.json` are **user-maintained** — never overwrite or recreate them. When adding new keys, append only the new keys with proper translations (not placeholders).
- **Dynamic key access**: `t()` from next-intl can't handle computed keys like `` t(`q${id}opt${i}`) `` at the TypeScript level. Use `useMessages()` and cast to `Record<string, string>` instead.
- **Language switcher**: Uses `usePathname` from `next/navigation` (full path with locale prefix) and strips the locale with a regex before calling `router.replace(pathname, { locale })`. This is more reliable than next-intl's `usePathname` for preserving the current page during locale switches.

### Translation key conventions (`messages/en.json`)

| Namespace | Key pattern | Used for |
|---|---|---|
| `nav` | `blog`, `signIn`, `dashboard`, etc. | Header navigation |
| `questions` | `q{id}label`, `q{id}hint`, `q{id}opt{i}`, `q{id}field_{key}_label` | Question UI |
| `sections` | camelCase key — each `{ label, short }` | Section names (e.g. `basics`, `theJob`) |
| `result` | `boltStep1`…`boltStep4`, `lovableStep1`…, etc. | Platform tab steps |
| `tools` | `galleryTitle`, `galleryDesc`, `openTool` | Tools gallery on homepage |

### Answer encoding

Answers are stored in `Record<number, string>` keyed by question ID:

- **`text`** / **`fields`**: raw string or JSON-serialised `Record<string, string>`
- **`single`**: selected option's English label (from the tool config), or `"Custom: <text>"`
- **`multi`**: JSON-serialised `string[]`; custom answers are `"Custom: <text>"` entries alongside the `"Write it myself"` sentinel

Option labels are translated for display only — the stored value always stays in English so the AI prompt is consistent. `buildPayload()` in `ToolWizard` strips `Custom: ` prefixes and the sentinel before POSTing.

### Adding or changing questions

All question config for a tool lives in its `lib/tools/<slug>.ts` file. `lib/questions.ts` only exports the shared types (`QuestionType`, `FieldDef`, `Question`). The wizard iterates the tool's `questions[]` directly — no routing changes needed.

Every select question should include `"Write it myself"` as its last option; `QuestionStep` handles the inline-input expansion automatically for that exact string.

`Question` supports a `rows?: number` field for `type: "text"` questions to control textarea height (default 3).

### Blog

File-based MDX blog powered by `next-mdx-remote` v6 (RSC) and `gray-matter`.

| File | Purpose |
|---|---|
| `lib/blog.ts` | `getAllPosts()`, `getPostBySlug()` — reads from `content/blog/`, excludes drafts, sorted newest first |
| `content/blog/*.mdx` | Post files with frontmatter: `title`, `description`, `date`, `author`, `tags`, optional `draft: true` |
| `app/[locale]/blog/page.tsx` | Blog index; includes RSS discovery `<link>` |
| `app/[locale]/blog/[slug]/page.tsx` | Post renderer with `<MDXRemote>`, JSON-LD Article schema |
| `app/[locale]/blog/opengraph-image.tsx` | Static branded OG card for blog index |
| `app/[locale]/blog/[slug]/opengraph-image.tsx` | Dynamic per-post OG image via `next/og` |
| `app/rss.xml/route.ts` | RSS 2.0 feed; `Content-Type: application/xml` |
| `app/sitemap.ts` | Includes all blog post URLs driven by `getAllPosts()` |

To add a post: create a `.mdx` file in `content/blog/` with the required frontmatter. No code changes needed.

### Automated blog publishing

Blog posts can be batch-generated and drip-published automatically instead of committed one at a time:

- Generating a batch is a Claude Code session task (not a script) — it invokes the content-strategy skill against the existing posts to pick real topic gaps, then writes full `.mdx` files to `content/blog/` with `draft: true` and sequential dates (one per calendar day), and commits the batch. Ask for this roughly monthly, or whenever the draft queue runs low.
- `scripts/publish-next-post.js` is the deterministic publish step: it finds the earliest-dated `draft: true` post and flips it to `draft: false`. No AI calls at publish time — content is already written.
- `.github/workflows/publish-blog-post.yml` runs that script daily via cron (`0 13 * * *`) and supports manual `workflow_dispatch` for testing. The resulting push triggers Vercel's existing auto-deploy on `main`.
- `scripts/verify-batch.js` is a reusable sanity check for a freshly generated batch (required frontmatter fields present, no duplicate dates among drafts) — run it before committing a new batch.
- Requires the repo's Settings → Actions → General → "Workflow permissions" to be "Read and write permissions", otherwise the workflow's push fails with a 403.

### Authentication

Auth is handled by Auth.js v5 (next-auth). Providers: Google OAuth, GitHub OAuth, and Resend magic-link email.

- `lib/auth.ts` — Auth.js config, session callbacks, `sendVerificationRequest` wired to Resend
- `lib/email.ts` — custom branded HTML email template for magic-link sign-in
- `auth.config.ts` — edge-compatible config; `pages.verifyRequest` points to `/en/auth/verify-email`
- `app/[locale]/auth/signin/page.tsx` — sign-in page (OAuth buttons + magic-link form)
- `app/[locale]/auth/verify-email/page.tsx` — "check your email" page shown after magic-link send

All protected API routes must use `requireAuth()` from `lib/api-auth.ts` — it returns the `userId` string on success or a `NextResponse` 401 that the caller returns immediately. Do not inline the auth check.

### Rate limiting and free tier

`lib/ratelimit.ts` provides rate limiters backed by Upstash Redis (falls back to in-memory when `UPSTASH_REDIS_REST_URL` is absent):

- `anonLimit` — 5 generations/hour per IP
- `authLimit` — 20 generations/hour per user ID
- `getAnonFreeCount(ip)` / `incrAnonFreeCount(ip)` — track total lifetime generations for anonymous users (capped at 3; 30-day TTL in Redis)

The free-tier gate is enforced **server-side** in `/api/generate` (authoritative) and **client-side** in `ToolWizard` via `localStorage("free_gen_count")` (UI optimisation only). When the server returns `{ requiresAuth: true }`, the client clamps its counter to 3.

### User profile

`UserToolProfile` (Prisma model) stores per-user, per-tool answers for questions marked with `profileQuestionIds` in the tool config. This lets returning signed-in users skip re-entering stable data (e.g. their name and top achievement for cover letters).

- `app/api/profile/route.ts` — GET loads a profile; PUT merges new answers into the existing blob (never replaces outright, to prevent partial saves from losing data)
- Profile answers are loaded on wizard mount and merged with session answers (session takes priority)
- The "Save to profile" button is disabled while the profile fetch is in-flight (`profileLoading` state) to prevent race conditions

### Telegram analytics side-effect

`POST /api/generate` sends every user prompt + generated result to a Telegram bot after the Anthropic call succeeds. The feature is silently skipped when the env vars are absent — it must not block or affect the response.

`app/api/test-telegram/route.ts` is a dev-only endpoint for verifying the bot connection.

### Session persistence and resume banner

`lib/draft.ts` owns the `sessionStorage` schema. Key helpers:

```ts
wizardKey(slug: string): string        // returns "wpg_wizard:<slug>"
readWizardDraft(slug: string)          // returns WizardDraft | null
clearWizardDraft(slug: string)         // removes from sessionStorage
```

`components/ResumeBanner.tsx` is shown on the landing page when an in-progress session exists for the default tool. `components/HeroCta.tsx` uses the same draft to show a "Resume" vs "Start" CTA.

### Model identifier

The Anthropic model ID and display name are centralised in `lib/models.ts` (`CLAUDE_MODEL_ID`, `CLAUDE_MODEL_NAME`). Update there to switch models. Per-tool `maxOutputTokens` can override the default 4096 via `ToolConfig`.

### Color palettes

Preset color palette data lives in `lib/palettes.ts` and is consumed by `components/wizard/ColorPaletteSelector.tsx`.

### OG images and metadataBase

Dynamic OG images use `next/og` (`ImageResponse`). `app/[locale]/layout.tsx` sets `metadataBase: new URL(siteUrl)` (when `NEXT_PUBLIC_SITE_URL` is set) so all OG image URLs resolve absolutely. Without that env var the build emits a warning and OG images fall back to `localhost` — this is expected locally and clears in production.

### Database

Prisma with two user-scoped models:

- **`Prompt`** — every generated result; `toolSlug` field + `@@index([toolSlug, createdAt])` for per-tool analytics
- **`UserToolProfile`** — per-user, per-tool saved answers; `@@unique([userId, toolSlug])`; cascades on user delete

Run `npx prisma db push` after schema changes (no migrations directory; push directly).

### Next.js 16 note

This project runs **Next.js 16**, which has breaking changes from earlier versions. If a convention feels wrong, check `node_modules/next/dist/docs/` before assuming training-data defaults apply.

### Key env vars

```
ANTHROPIC_API_KEY         # required — Claude Haiku (claude-haiku-4-5-20251001)
AUTH_SECRET               # required — Auth.js session signing secret
AUTH_GITHUB_ID            # GitHub OAuth app client ID
AUTH_GITHUB_SECRET        # GitHub OAuth app client secret
AUTH_GOOGLE_ID            # Google OAuth app client ID
AUTH_GOOGLE_SECRET        # Google OAuth app client secret
RESEND_API_KEY            # Resend API key for magic-link email sign-in
DATABASE_URL              # Prisma database connection string
NEXT_PUBLIC_SITE_URL      # e.g. https://artagers.design — required for absolute OG/RSS URLs
UPSTASH_REDIS_REST_URL    # optional — Upstash Redis for persistent rate limiting and free-tier gate
UPSTASH_REDIS_REST_TOKEN  # optional — paired with UPSTASH_REDIS_REST_URL
TELEGRAM_BOT_TOKEN        # optional — analytics side-effect in /api/generate
TELEGRAM_CHAT_ID          # optional — paired with TELEGRAM_BOT_TOKEN
```
