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

### Routing

All real pages live under `app/[locale]/` (locales: `en`, `hy`, `ru`). The root `app/page.tsx` and `app/generator/page.tsx` are thin redirects to `/en` and `/en/generator`. The root `app/layout.tsx` renders only `{children}` — the `<html>` and `<body>` tags are in `app/[locale]/layout.tsx` so the `lang` attribute can be set per locale.

The locale middleware lives in `proxy.ts` at the project root (Next.js 16 renamed the convention from `middleware.ts` to `proxy.ts`). It runs `createMiddleware(routing)` from next-intl to handle locale detection and prefix routing.

### Request flow

```
Browser → /[locale]/generator  (fully client-side, "use client")
  → POST /api/generate          (on submit — { answers } → Anthropic SDK → { result, model })
```

The landing page `/[locale]` is SSR with Next.js Metadata API for SEO. The shared `<Header>` (logo + language switcher) is rendered once in the locale layout and wraps both pages.

### i18n

- **Library**: next-intl v4 with `defineRouting` + `createNavigation` in `i18n/routing.ts`
- **Config**: `i18n/request.ts` — loads the locale's JSON, falls back to `en.json` on error
- **Message files**: `messages/en.json`, `messages/hy.json`, `messages/ru.json`
  - `hy.json` and `ru.json` are **user-maintained** — never overwrite or recreate them. When adding new keys, append only the new keys with empty/placeholder values.
- **Dynamic key access**: `t()` from next-intl can't handle computed keys like `` t(`q${id}opt${i}`) `` at the TypeScript level. Use `useMessages()` and cast to `Record<string, string>` instead.
- **Language switcher**: Uses `usePathname` from `next/navigation` (full path with locale prefix) and strips the locale with a regex before calling `router.replace(pathname, { locale })`. This is more reliable than next-intl's `usePathname` for preserving the current page during locale switches.

### Translation key conventions (`messages/en.json`)

| Namespace | Key pattern | Used for |
|---|---|---|
| `questions` | `q{id}label`, `q{id}hint`, `q{id}opt{i}`, `q{id}field_{key}_label` | Question UI |
| `sections` | `basics`, `audience`, `content`, `tech` — each `{ label, short }` | Section names |
| `result` | `boltStep1`…`boltStep4`, `lovableStep1`…, `arenaStep1`…`arenaStep5`, `cursorStep1`…, `v0Step1`… | Platform tab steps |

`SECTION_KEY` in the generator page maps English section names from `questions.ts` (e.g. `"Audience & Brand"`) to their i18n key (e.g. `"audience"`).

### Answer encoding

Answers are stored in `Record<number, string>` keyed by question ID:

- **`text`** / **`fields`**: raw string or JSON-serialised `Record<string, string>`
- **`single`**: selected option's English label (from `questions.ts`), or `"Custom: <text>"`
- **`multi`**: JSON-serialised `string[]`; custom answers are `"Custom: <text>"` entries alongside the `"Write it myself"` sentinel

Option labels are translated for display only — the stored value always stays in English so the AI prompt is consistent. `buildPayload()` in the generator page strips `Custom: ` prefixes and the sentinel before POSTing.

### Adding or changing questions

All question config lives in `lib/questions.ts`. The wizard iterates `questions[]` directly — no other file needs updating for content changes. Every select question should include `"Write it myself"` as its last option; `QuestionStep` handles the inline-input expansion automatically for that exact string.

After adding questions, add the corresponding translation keys to `messages/en.json`, then add only those new keys (with placeholder values) to `messages/hy.json` and `messages/ru.json`.

### Telegram analytics side-effect

`POST /api/generate` sends every user prompt + generated result to a Telegram bot after the Anthropic call succeeds. The feature is silently skipped when the env vars are absent — it must not block or affect the response.

`app/api/test-telegram/route.ts` is a dev-only endpoint for verifying the bot connection.

### Session persistence and resume banner

`lib/draft.ts` owns the `sessionStorage` schema (`WIZARD_SESSION_KEY = "wpg_wizard"`). `readWizardDraft()` / `clearWizardDraft()` are helpers used by the generator page and `components/ResumeBanner.tsx` (shown on the landing page when an in-progress session exists).

### Model identifier

The Anthropic model ID and display name are centralised in `lib/models.ts` (`CLAUDE_MODEL_ID`, `CLAUDE_MODEL_NAME`). Update there to switch models.

### Color palettes

Preset color palette data lives in `lib/palettes.ts` and is consumed by `components/wizard/ColorPaletteSelector.tsx`.

### Next.js 16 note

This project runs **Next.js 16**, which has breaking changes from earlier versions. If a convention feels wrong, check `node_modules/next/dist/docs/` before assuming training-data defaults apply.

### Key env vars

```
ANTHROPIC_API_KEY      # required — Claude Haiku (claude-haiku-4-5-20251001)
TELEGRAM_BOT_TOKEN     # optional — analytics side-effect in /api/generate
TELEGRAM_CHAT_ID       # optional — paired with TELEGRAM_BOT_TOKEN
```
