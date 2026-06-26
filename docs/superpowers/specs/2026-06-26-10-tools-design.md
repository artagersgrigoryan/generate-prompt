# Design Spec: 10 New AI Generator Tools — SEO-Driven Expansion

**Date:** 2026-06-26
**Status:** Approved

---

## Overview

Add 10 new AI generator tools to project, each creating a new indexed landing page at `/[locale]/tools/[slug]`. All tools target the existing career-focused audience (job seekers, professionals, personal branding). The homepage gallery and header navigation are updated to accommodate the expanded tool set.

---

## Implementation Approach: Infrastructure First, Then Parallel Agents

### Phase 1 — Infrastructure commit

One commit that sets up everything the parallel agents depend on. After this commit the app builds cleanly and every tool wizard is reachable, producing stub output until Phase 2 fills in the system prompts.

**Files changed:**

| File | Change |
|---|---|
| `lib/tools/slugs.ts` | +10 slug constants |
| `lib/tools/index.ts` | +10 imports + ALL_TOOLS registrations pointing at skeleton files |
| `lib/tools/<slug>.ts` × 10 | Skeleton exports — valid `ToolConfig` with `systemPrompt: ""` |
| `components/ToolsGallery.tsx` | Carousel layout + all 10 `TOOL_VISUALS` entries |
| `components/Header.tsx` | Megamenu integration using Radix Navigation Menu |
| `components/ui/navigation-menu.tsx` | Radix primitives adapted to project color palette |
| `components/ui/grid-card.tsx` | Card base for megamenu tool items |
| `messages/en.json` | All new section keys, question keys, toolIntros for all 10 tools |
| `messages/hy.json` | Same — all new keys with proper Armenian translations |
| `messages/ru.json` | Same — all new keys with proper Russian translations |
| `package.json` | +`@radix-ui/react-navigation-menu` |

### Phase 2 — 10 parallel git worktree agents

Each agent owns exactly one file: `lib/tools/<slug>.ts`. No shared file touches. Each agent:
1. Reads the tool spec (questions, sections, expected output format)
2. Uses `cover-letter-generator.ts` as a reference for quality and structure
3. Writes the complete `ToolConfig` — real questions array, sections, and a detailed `systemPrompt`

Merge sequence: branches merged sequentially into main (each is fast-forward, zero conflicts). Final `npm run build` validates all 10 tools.

---

## Gallery: Carousel Layout

- 3-column grid (`sm:grid-cols-2 lg:grid-cols-3`, `max-w-5xl`)
- 6 tools per page, 2 pages total
- Prev/next arrow buttons + dot indicator
- Page state: client-side `useState` in a thin `ToolsGalleryClient` wrapper (server component passes tool list as prop)
- Animation: `framer-motion` `AnimatePresence` + fade/slide on page change

**Tool order (Page 1 → Page 2):**

Page 1: Website Prompt Generator, Cover Letter Generator, LinkedIn Summary Generator, Resume Bullet Point Generator, Elevator Pitch Generator, Thank You Email Generator

Page 2: Personal Bio Generator, Resignation Letter Generator, LinkedIn Recommendation Generator, Email Subject Line Generator, Cold Outreach Email Generator, Social Bio Generator

---

## Header: Megamenu

**Package:** `@radix-ui/react-navigation-menu`

**Desktop:** "Tools" nav trigger with ChevronDown opens a Radix viewport dropdown. Content is a 2-column grid of 12 tool cards using `NavItemMobile` style (icon box + name + one-line description). No column headers — flat grid. Inherits `isScrolled` color switching from existing nav links.

**Mobile:** Hamburger panel gets a "Tools" expand section with `NavItemMobile` rows.

**Color mapping from Radix reference:**
- `bg-background/95 backdrop-blur-xl` → `bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl`
- `text-muted-foreground` → `text-neutral-500 dark:text-neutral-400`
- `text-foreground` → `text-neutral-900 dark:text-neutral-100`
- `bg-accent` / `hover:bg-accent` → `hover:bg-neutral-100 dark:hover:bg-neutral-800`

**New i18n keys:** `nav.tools`, `nav.megamenuTools`

---

## The 10 Tools

### #1 — LinkedIn Summary Generator
- **Slug:** `linkedin-summary-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [30, 31, 32]
- **Sections:** "Your Background" (`yourBackground`), "Style" (`style`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 30 | fields | Your name + current job title |
| 31 | single | Years of experience (0–2 / 2–5 / 5–10 / 10+ / Write it myself) |
| 32 | multi | Top 3–5 skills or areas of expertise (max 5) |
| 33 | text | Most impressive career achievement (rows: 3) |
| 34 | text | What you're looking to do next / career goal (rows: 2) |
| 35 | single | Tone (Professional / Conversational / Bold / Write it myself) |

- **AI output:** LinkedIn "About" section (200–300 words) + 3 headline variations (120 chars each)

---

### #2 — Resume Bullet Point Generator
- **Slug:** `resume-bullet-point-generator`
- **resultMode:** `prompt`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [40, 41]
- **Sections:** "Your Role" (`yourRole`), "Target Role" (`targetRole`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 40 | text | Your current / most recent job title (rows: 1) |
| 41 | single | Industry / field (Technology / Healthcare / Finance / Marketing / Education / Write it myself) |
| 42 | text | Key responsibilities in this role (rows: 4) |
| 43 | text | Quantifiable achievements — optional (rows: 3) |
| 44 | text | Job title you're applying for (rows: 1) |
| 45 | single | Emphasis (Results & metrics / Skills & tools / Leadership / Technical depth / Write it myself) |

- **AI output:** 8–10 ATS-optimized bullet points with strong action verbs and measurable impact

---

### #3 — Elevator Pitch Generator
- **Slug:** `elevator-pitch-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [50, 51, 53]
- **Sections:** "About You" (`aboutYou`), "The Pitch" (`thePitch`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 50 | fields | Your name + job title / role |
| 51 | text | What you do / what problem you solve (rows: 2) |
| 52 | single | Primary audience (Recruiters / Clients / Investors / Networking contacts / Write it myself) |
| 53 | text | Your unique value — what sets you apart (rows: 2) |
| 54 | single | Desired outcome (Job interview / Client meeting / Investment conversation / Collaboration / Write it myself) |

- **AI output:** 30-second version (60–80 words) + 60-second version (120–150 words)

---

### #4 — Thank You Email Generator
- **Slug:** `thank-you-email-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [60]
- **Sections:** "The Interview" (`theInterview`), "Your Message" (`yourMessage`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 60 | fields | Your name + interviewer's name + their title |
| 61 | text | Role / position you interviewed for (rows: 1) |
| 62 | text | Company name (rows: 1) |
| 63 | text | One specific moment or topic from the interview to reference (rows: 2) |
| 64 | single | Tone (Formal / Warm / Enthusiastic / Write it myself) |

- **AI output:** Thank you email (150–200 words) + subject line suggestion

---

### #5 — Personal Bio Generator
- **Slug:** `personal-bio-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [70, 71, 73]
- **Sections:** "About You" (`aboutYou`), "The Bio" (`theBio`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 70 | fields | Your name + current role / title |
| 71 | text | Professional background in 2–3 sentences (rows: 3) |
| 72 | single | Where this bio will appear (Personal website / Speaker profile / Author page / Portfolio / Write it myself) |
| 73 | text | Key achievements or credentials (rows: 2) |
| 74 | text | Personal detail to include — optional (rows: 2) |
| 75 | single | Length (Short — ~50 words / Medium — ~100 words / Full — ~200 words) |

- **AI output:** Bio in third person at chosen length + short first-person variant

---

### #6 — Resignation Letter Generator
- **Slug:** `resignation-letter-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [80]
- **Sections:** "The Situation" (`theSituation`), "Your Letter" (`yourLetter`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 80 | fields | Your name + manager's name |
| 81 | fields | Your job title + company name |
| 82 | text | Last working day (rows: 1) |
| 83 | single | Reason for leaving — optional (New opportunity / Career change / Personal reasons / Relocation / Prefer not to say) |
| 84 | single | Tone (Formal / Warm / Brief & simple / Write it myself) |

- **AI output:** Resignation letter (150–250 words), professional and graceful

---

### #7 — LinkedIn Recommendation Generator
- **Slug:** `linkedin-recommendation-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** []
- **Sections:** "About Them" (`aboutThem`), "Your Recommendation" (`yourRecommendation`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 90 | fields | Person you're recommending: name + job title |
| 91 | single | Your relationship (Their direct manager / Colleague / I was their manager / Their client / Write it myself) |
| 92 | text | How long you worked together + context (rows: 2) |
| 93 | multi | Their top strengths — max 4 (Communication / Leadership / Technical skills / Problem solving / Collaboration / Creativity / Reliability / Write it myself) |
| 94 | text | A specific example or achievement you witnessed (rows: 3) |
| 95 | single | Closing sentiment (Would hire them again / Recommend without reservation / Best team member I've had / Write it myself) |

- **AI output:** LinkedIn recommendation (100–150 words), warm and specific

---

### #8 — Email Subject Line Generator
- **Slug:** `email-subject-line-generator`
- **resultMode:** `prompt`
- **maxOutputTokens:** 1024
- **profileQuestionIds:** []
- **Sections:** "Your Email" (`yourEmail`), "Tone & Style" (`toneAndStyle`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 100 | single | Email purpose (Cold outreach / Newsletter / Product announcement / Follow-up / Job application / Write it myself) |
| 101 | text | Target audience — who is receiving this? (rows: 1) |
| 102 | text | Main message or key offer in one sentence (rows: 2) |
| 103 | single | Desired tone (Urgent / Curious / Friendly / Professional / Write it myself) |
| 104 | text | Any keyword or phrase to include — optional (rows: 1) |

- **AI output:** 7 subject line variations, each annotated with the psychological hook used

---

### #9 — Cold Outreach Email Generator
- **Slug:** `cold-outreach-email-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [110]
- **Sections:** "The Context" (`theContext`), "The Ask" (`theAsk`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 110 | fields | Your name + your role / what you do |
| 111 | fields | Recipient's name + their role |
| 112 | text | Company name + one thing you know/admire about them (rows: 2) |
| 113 | single | Your ask (Informational interview / Job referral / Introductory call / Freelance opportunity / Write it myself) |
| 114 | text | Your relevant experience in 1–2 sentences (rows: 2) |
| 115 | single | Tone (Confident / Friendly / Formal / Write it myself) |

- **AI output:** Cold email (150–200 words) + one follow-up email (100 words)

---

### #10 — Social Bio Generator
- **Slug:** `social-bio-generator`
- **resultMode:** `letter`
- **maxOutputTokens:** 2048
- **profileQuestionIds:** [120, 122, 123]
- **Sections:** "About You" (`aboutYou`), "Your Platforms" (`yourPlatforms`)
- **Questions:**

| ID | Type | Label |
|---|---|---|
| 120 | fields | Your name + role / what you do |
| 121 | multi | Platforms (Instagram / Twitter/X / TikTok / YouTube / LinkedIn / Write it myself) |
| 122 | text | Your niche or what you post about (rows: 2) |
| 123 | text | Who your audience is (rows: 1) |
| 124 | single | Call to action (Link in bio / DM me / Follow for [topic] / Visit my website / Write it myself) |
| 125 | single | Personality/tone (Professional / Fun & witty / Inspirational / Expert / Write it myself) |

- **AI output:** Tailored bio per selected platform respecting character limits (Instagram 150, Twitter/X 160, TikTok 80, LinkedIn 220)

---

## Question ID Allocation

| Tool | ID range |
|---|---|
| LinkedIn Summary Generator | 30–35 |
| Resume Bullet Point Generator | 40–45 |
| Elevator Pitch Generator | 50–54 |
| Thank You Email Generator | 60–64 |
| Personal Bio Generator | 70–75 |
| Resignation Letter Generator | 80–84 |
| LinkedIn Recommendation Generator | 90–95 |
| Email Subject Line Generator | 100–104 |
| Cold Outreach Email Generator | 110–115 |
| Social Bio Generator | 120–125 |

---

## Verification (per tool after merge)

1. `npm run build` — TypeScript passes, static params generate for all locales
2. Navigate to `/en/tools/<slug>` — wizard renders with correct sections and questions
3. Complete wizard and submit — `/api/generate` returns output
4. Verify `resultMode` renders correctly (`letter` → LetterResultScreen, `prompt` → ResultScreen)
5. Check `/en` — tool card appears in gallery with correct visuals
6. Verify `/hy/tools/<slug>` and `/ru/tools/<slug>` render translated labels

---

## New i18n Keys (infrastructure)

**`sections` namespace** — new keys needed:
`yourBackground`, `style`, `yourRole`, `targetRole`, `aboutYou`, `thePitch`, `theInterview`, `yourMessage`, `theBio`, `theSituation`, `yourLetter`, `aboutThem`, `yourRecommendation`, `yourEmail`, `toneAndStyle`, `theContext`, `theAsk`, `yourPlatforms`

Note: `yourBackground` and `style` already exist (Cover Letter Generator). `aboutYou` is new (shared by tools #3, #5, #10).

**`nav` namespace** — new keys:
`nav.tools`, `nav.megamenuTools`

**`tools` namespace** — new name/desc keys for all 10 tools.

**`toolIntros` namespace** — new entries for all 10 tools (brand, introTitle, introDesc, startButton, loading).

**`questions` namespace** — all `q{id}label`, `q{id}hint`, `q{id}placeholder`, `q{id}opt{i}`, `q{id}field_{key}_label`, `q{id}field_{key}_placeholder` keys for IDs 30–125.
