# Website Prompt Generator

A multi-tool AI prompt platform. Each tool is a short, focused wizard that asks the right questions and produces a structured prompt you can paste directly into any AI builder.

The first tool — **Website Prompt Generator** — interviews you about your website needs across 4 sections (Basics, Audience & Brand, Content & Pages, Features & Tech) and outputs a detailed brief for tools like Bolt, v0, Lovable, and Cursor.

## Features

- Multi-tool platform: add new tools by dropping a config file into `lib/tools/`
- 13-question wizard with section progress, review screen, and resume-session banner
- Platform-specific result tabs (Bolt, v0, Lovable, Cursor, Arena)
- Copy, regenerate, and start-over on the result screen
- Sign in with Google, GitHub, or magic-link email (Resend)
- File-based MDX blog with RSS feed and dynamic OG images
- Fully localized: English, Russian, Armenian
- SSR landing page with Open Graph tags and JSON-LD schema
- Sitemap and RSS feed auto-driven by content registry

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd website-prompt-generator
npm install
```

### 2. Configure env vars

Create `.env.local` and fill in the required values:

```
# Required
ANTHROPIC_API_KEY=         # https://console.anthropic.com/
AUTH_SECRET=               # random secret for Auth.js session signing

# OAuth (at least one pair needed for OAuth sign-in)
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Magic-link email sign-in
RESEND_API_KEY=            # https://resend.com/

# Database
DATABASE_URL=              # Prisma connection string

# Required for absolute OG image / RSS URLs in production
NEXT_PUBLIC_SITE_URL=      # e.g. https://artagers.design

# Optional analytics
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm start
```

## Project structure

```
/app
  /[locale]/
    page.tsx                    Landing page (SSR, hero + tools gallery)
    layout.tsx                  Shared locale layout (Header, pt-16 offset, GTM)
    /tools/[toolSlug]/
      page.tsx                  Generic tool page — resolves slug → ToolWizard
      layout.tsx                Per-tool metadata
    /blog/
      page.tsx                  Blog index
      opengraph-image.tsx       Static branded OG card
      /[slug]/
        page.tsx                MDX post renderer + JSON-LD Article schema
        opengraph-image.tsx     Dynamic per-post OG image
    /auth/                      Sign-in, verify-email pages
    /dashboard/                 User dashboard
    /settings/                  User settings
  /api/
    /generate/route.ts          POST { toolSlug, answers } → Anthropic → { result, model }
    /auth/                      Auth.js route handlers
    /prompts/                   Saved prompt API
    /user/                      User profile API
  /rss.xml/route.ts             RSS 2.0 feed
  sitemap.ts                    Auto-generated sitemap

/components
  Header.tsx                    Fixed nav (logo, tool links, Blog, auth, language switcher)
  ToolsGallery.tsx              Registry-driven tool cards on homepage
  ResumeBanner.tsx              "Resume session" banner on landing page
  HeroCta.tsx                   Hero CTA (Start / Resume)
  SignInSuccess.tsx             Post-sign-in animation
  /wizard/
    ToolWizard.tsx              Generic parameterized wizard shell
    QuestionStep.tsx            Renders a single question
    StepNavigator.tsx           Section/step navigation
    ReviewScreen.tsx            Pre-submit review of all answers
    ResultScreen.tsx            Generated prompt + platform tabs
    ColorPaletteSelector.tsx    Visual color picker question type
    ProgressBar.tsx
    OptionButton.tsx
    StyleCard.tsx

/lib
  /tools/
    slugs.ts                    Client-safe slug constants
    types.ts                    ToolConfig, ToolPublicConfig, toPublicTool()
    website-prompt-generator.ts Questions, sections, system prompt for WPG
    index.ts                    TOOLS registry, getTool(), listTools()
  questions.ts                  Shared question types (QuestionType, Question, FieldDef)
  models.ts                     CLAUDE_MODEL_ID, CLAUDE_MODEL_NAME
  palettes.ts                   Preset color palette data
  draft.ts                      wizardKey(), readWizardDraft(), clearWizardDraft()
  blog.ts                       getAllPosts(), getPostBySlug()
  auth.ts                       Auth.js config + sendVerificationRequest
  email.ts                      Branded magic-link email template

/content
  /blog/*.mdx                   Blog posts (frontmatter: title, description, date, author, tags)

/messages
  en.json                       Source of truth for all translation keys
  hy.json                       Armenian — user-maintained, never overwrite
  ru.json                       Russian — user-maintained, never overwrite

/prisma
  schema.prisma                 Prompt model (toolSlug, userId, content, createdAt)
```

## Adding a new tool

1. Create `lib/tools/<slug>.ts` exporting a `ToolConfig` (questions, sections, systemPrompt).
2. Add it to `TOOLS` in `lib/tools/index.ts`.
3. Add translation keys to `messages/en.json` (and placeholders to `hy.json` / `ru.json`).
4. Done — routing and the API pick it up automatically.

## Adding a blog post

Create `content/blog/<slug>.mdx` with this frontmatter:

```mdx
---
title: "Post title"
description: "Meta description"
date: "YYYY-MM-DD"
author: "Name"
tags: ["tag1", "tag2"]
---

Post body in MDX...
```

Set `draft: true` to hide a post from the index and RSS feed.
