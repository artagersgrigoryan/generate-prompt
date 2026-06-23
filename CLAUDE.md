# CLAUDE.md

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

This is a **multi-tool AI prompt platform**. Each tool is a short wizard that asks focused questions and produces a structured AI prompt. The first (and currently only) tool is the Website Prompt Generator. Tools are registered in `lib/tools/` and new ones can be added there without touching routing or the API.

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
```

The API resolves `toolSlug` to a `ToolConfig` from the registry and uses its `systemPrompt`. After the Anthropic call it saves the prompt to the database and fires the Telegram analytics side-effect.

### Tool registry

Tool config lives in `lib/tools/`:

| File | Purpose |
|---|---|
| `lib/tools/slugs.ts` | Client-safe slug constants (`WEBSITE_PROMPT_GENERATOR_SLUG`, `DEFAULT_TOOL_SLUG`) |
| `lib/tools/types.ts` | `ToolConfig` (server-only, includes `systemPrompt`), `ToolPublicConfig` (client-safe), `toPublicTool()` |
| `lib/tools/website-prompt-generator.ts` | All 13 questions, sections, and system prompt for the WPG tool |
| `lib/tools/index.ts` | `TOOLS` array, `getTool(slug)`, `listTools()`, `getToolName(slug)` |

`ToolConfig` must never reach the client bundle (it contains the full system prompt). `toPublicTool()` strips it; the tool page passes only the public config to `<ToolWizard>`.

### Adding a new tool

1. Create `lib/tools/<slug>.ts` exporting a `ToolConfig` object.
2. Import and add it to the `TOOLS` array in `lib/tools/index.ts`.
3. Add its slug to `lib/tools/slugs.ts` if you need a typed constant.
4. Add questions translation keys to `messages/en.json`; add only those new keys (with placeholder values) to `messages/hy.json` and `messages/ru.json`.
5. Run `npx prisma db push` if you need schema changes.

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
| `sections` | `basics`, `audience`, `content`, `tech` — each `{ label, short }` | Section names |
| `result` | `boltStep1`…`boltStep4`, `lovableStep1`…, `arenaStep1`…`arenaStep5`, `cursorStep1`…, `v0Step1`… | Platform tab steps |
| `tools` | `galleryTitle`, `galleryDesc` | Tools gallery on homepage |

### Answer encoding

Answers are stored in `Record<number, string>` keyed by question ID:

- **`text`** / **`fields`**: raw string or JSON-serialised `Record<string, string>`
- **`single`**: selected option's English label (from the tool config), or `"Custom: <text>"`
- **`multi`**: JSON-serialised `string[]`; custom answers are `"Custom: <text>"` entries alongside the `"Write it myself"` sentinel

Option labels are translated for display only — the stored value always stays in English so the AI prompt is consistent. `buildPayload()` in `ToolWizard` strips `Custom: ` prefixes and the sentinel before POSTing.

### Adding or changing questions

All question config for a tool lives in its `lib/tools/<slug>.ts` file. `lib/questions.ts` now only exports the shared types (`QuestionType`, `FieldDef`, `Question`). The wizard iterates the tool's `questions[]` directly — no routing changes needed.

Every select question should include `"Write it myself"` as its last option; `QuestionStep` handles the inline-input expansion automatically for that exact string.

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

### Authentication

Auth is handled by Auth.js v5 (next-auth). Providers: Google OAuth, GitHub OAuth, and Resend magic-link email.

- `lib/auth.ts` — Auth.js config, session callbacks, `sendVerificationRequest` wired to Resend
- `lib/email.ts` — custom branded HTML email template for magic-link sign-in
- `auth.config.ts` — edge-compatible config; `pages.verifyRequest` points to `/en/auth/verify-email`
- `app/[locale]/auth/signin/page.tsx` — sign-in page (OAuth buttons + magic-link form)
- `app/[locale]/auth/verify-email/page.tsx` — "check your email" page shown after magic-link send

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

The Anthropic model ID and display name are centralised in `lib/models.ts` (`CLAUDE_MODEL_ID`, `CLAUDE_MODEL_NAME`). Update there to switch models.

### Color palettes

Preset color palette data lives in `lib/palettes.ts` and is consumed by `components/wizard/ColorPaletteSelector.tsx`.

### OG images and metadataBase

Dynamic OG images use `next/og` (`ImageResponse`). `app/[locale]/layout.tsx` sets `metadataBase: new URL(siteUrl)` (when `NEXT_PUBLIC_SITE_URL` is set) so all OG image URLs resolve absolutely. Without that env var the build emits a warning and OG images fall back to `localhost` — this is expected locally and clears in production.

### Database

Prisma with the `Prompt` model. Schema additions:
- `toolSlug String @default("website-prompt-generator")` — tracks which tool generated each prompt
- `@@index([toolSlug, createdAt])` — for per-tool analytics queries

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
TELEGRAM_BOT_TOKEN        # optional — analytics side-effect in /api/generate
TELEGRAM_CHAT_ID          # optional — paired with TELEGRAM_BOT_TOKEN
```
