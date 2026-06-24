# Free-Tier Generation Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow anonymous users 3 free generations (shared across all tools), then replace the Generate button with a "Sign in to generate" link on the review screen.

**Architecture:** Two independent layers — `localStorage` for instant UI gate (no fetch needed), Redis for server-side enforcement as backstop. Redis counter keyed by IP (`free:anon:<ip>`), 30-day TTL, only incremented on successful generation. Client reads `localStorage.free_gen_count` when entering the review phase and passes `isGated` to `ReviewScreen`.

**Tech Stack:** Next.js 16, next-intl v4, Auth.js v5, Upstash Redis (`@upstash/redis`), Prisma/PostgreSQL.

## Global Constraints

- No test suite — verification is manual browser testing.
- `messages/hy.json` and `messages/ru.json` are user-maintained — only add new keys with real translations, never touch existing keys.
- `ToolConfig` and system prompts must never reach the client bundle.
- Redis helpers must gracefully no-op when `UPSTASH_REDIS_REST_URL` is absent (local dev).
- The free limit is 3 generations, shared across all tools, per IP, rolling 30-day window.

---

### Task 1: Add free-tier Redis helpers to `lib/ratelimit.ts`

**Files:**
- Modify: `lib/ratelimit.ts`

**Interfaces:**
- Produces:
  - `getAnonFreeCount(ip: string): Promise<number>` — returns current anon generation count for this IP (0 if Redis unavailable or key absent)
  - `incrAnonFreeCount(ip: string): Promise<void>` — increments counter and sets/refreshes 30-day TTL

- [ ] **Step 1: Add the two helpers at the bottom of `lib/ratelimit.ts`**

  Open `lib/ratelimit.ts`. After the existing exports, append:

  ```ts
  const FREE_LIMIT_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

  export async function getAnonFreeCount(ip: string): Promise<number> {
    if (!redis) return 0;
    const val = await redis.get<number>(`free:anon:${ip}`);
    return val ?? 0;
  }

  export async function incrAnonFreeCount(ip: string): Promise<void> {
    if (!redis) return;
    await redis.incr(`free:anon:${ip}`);
    await redis.expire(`free:anon:${ip}`, FREE_LIMIT_TTL_SECONDS);
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npm run build
  ```

  Expected: build completes with no type errors related to `ratelimit.ts`.

- [ ] **Step 3: Commit**

  ```bash
  git add lib/ratelimit.ts
  git commit -m "feat: add free-tier anon generation counter helpers"
  ```

---

### Task 2: Enforce free-tier limit in `/api/generate`

**Files:**
- Modify: `app/api/generate/route.ts`

**Interfaces:**
- Consumes: `getAnonFreeCount`, `incrAnonFreeCount` from `lib/ratelimit.ts`
- Produces: when anon count ≥ 3, returns `{ error: "Sign in to continue generating", requiresAuth: true }` with HTTP 401

- [ ] **Step 1: Import the new helpers**

  In `app/api/generate/route.ts`, update the ratelimit import line (currently line 5):

  ```ts
  import { anonLimit, authLimit, getAnonFreeCount, incrAnonFreeCount } from "@/lib/ratelimit";
  ```

- [ ] **Step 2: Add the free-tier gate before the Anthropic call**

  After the existing rate-limit block (after line 98, before `const apiKey = ...`), insert:

  ```ts
  // Free-tier gate: anonymous users get 3 generations total (across all tools).
  if (!session?.user?.id) {
    const freeCount = await getAnonFreeCount(ip);
    if (freeCount >= 3) {
      return NextResponse.json(
        { error: "Sign in to continue generating", requiresAuth: true },
        { status: 401 }
      );
    }
  }
  ```

- [ ] **Step 3: Increment counter after successful generation**

  After the `sendToTelegram` call (after line 124) and before the `if (session?.user?.id)` DB save block, insert:

  ```ts
  if (!session?.user?.id) {
    incrAnonFreeCount(ip).catch((e) =>
      console.error("[FreeLimit] failed to increment counter:", e)
    );
  }
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  npm run build
  ```

  Expected: no type errors.

- [ ] **Step 5: Manual test — server enforcement**

  With Redis configured, open browser DevTools → Network tab. Make 3 generations from an anonymous session. The 4th call to `POST /api/generate` should return HTTP 401 with body `{ "error": "Sign in to continue generating", "requiresAuth": true }`.

  Without Redis (local dev without `UPSTASH_REDIS_REST_URL`): the gate is silently skipped and all generations succeed.

- [ ] **Step 6: Commit**

  ```bash
  git add app/api/generate/route.ts
  git commit -m "feat: block anon generations after 3 via Redis free-tier gate"
  ```

---

### Task 3: Add i18n key for the sign-in button

**Files:**
- Modify: `messages/en.json`, `messages/hy.json`, `messages/ru.json`

**Interfaces:**
- Produces: translation key `review.signInToGenerate` available in all three locales

- [ ] **Step 1: Add key to `messages/en.json`**

  Find the `"review"` object (around line 127). Add the new key after `"generateBtn"`:

  ```json
  "review": {
    "subtitle": "Almost there",
    "title": "Review your answers",
    "desc": "Check everything looks right. Click any answer to edit it.",
    "notAnswered": "Not answered",
    "skipped": "Skipped",
    "editBtn": "Edit",
    "backBtn": "Back",
    "generateBtn": "Generate prompt",
    "signInToGenerate": "Sign in to generate"
  },
  ```

- [ ] **Step 2: Add key to `messages/hy.json`**

  Find the `"review"` object in `messages/hy.json`. Add only the new key after the existing `"generateBtn"` entry (do NOT touch any existing key):

  ```json
  "signInToGenerate": "Մուտք գործել՝ ստեղծելու համար"
  ```

- [ ] **Step 3: Add key to `messages/ru.json`**

  Find the `"review"` object in `messages/ru.json`. Add only the new key after the existing `"generateBtn"` entry (do NOT touch any existing key):

  ```json
  "signInToGenerate": "Войдите, чтобы продолжить"
  ```

- [ ] **Step 4: Verify build**

  ```bash
  npm run build
  ```

  Expected: no missing translation warnings, build succeeds.

- [ ] **Step 5: Commit**

  ```bash
  git add messages/en.json messages/hy.json messages/ru.json
  git commit -m "feat: add signInToGenerate translation key"
  ```

---

### Task 4: Gate the Generate button in `ReviewScreen`

**Files:**
- Modify: `components/wizard/ReviewScreen.tsx`

**Interfaces:**
- Consumes: `review.signInToGenerate` translation key from Task 3
- Produces: `ReviewScreenProps` gains two new optional props: `isGated?: boolean`, `signInHref?: string`

- [ ] **Step 1: Add `isGated` and `signInHref` to the props interface**

  In `components/wizard/ReviewScreen.tsx`, update `ReviewScreenProps` (currently line 8–17):

  ```ts
  interface ReviewScreenProps {
    questions: Question[];
    answers: Record<number, string>;
    onEdit: (step: number) => void;
    onGenerate: () => void;
    onBack: () => void;
    apiError: string;
    getQuestionLabel: (id: number) => string;
    getSectionLabel: (section: string) => string;
    isGated?: boolean;
    signInHref?: string;
  }
  ```

- [ ] **Step 2: Destructure the new props**

  Update the function signature (currently line 49–58):

  ```ts
  export function ReviewScreen({
    questions,
    answers,
    onEdit,
    onGenerate,
    onBack,
    apiError,
    getQuestionLabel,
    getSectionLabel,
    isGated,
    signInHref,
  }: ReviewScreenProps) {
  ```

- [ ] **Step 3: Replace the Generate button with a sign-in link when gated**

  Find the Actions block (currently lines 144–152). Replace it with:

  ```tsx
  {/* Actions */}
  <div className="flex items-center gap-3">
    <Button variant="secondary" onClick={onBack}>
      {t("backBtn")}
    </Button>
    {isGated && signInHref ? (
      <a href={signInHref}>
        <Button>{t("signInToGenerate")}</Button>
      </a>
    ) : (
      <Button onClick={onGenerate}>
        {t("generateBtn")}
      </Button>
    )}
  </div>
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add components/wizard/ReviewScreen.tsx
  git commit -m "feat: replace generate button with sign-in link when free tier exhausted"
  ```

---

### Task 5: Track free-gen count and pass `isGated` from `ToolWizard`

**Files:**
- Modify: `components/wizard/ToolWizard.tsx`

**Interfaces:**
- Consumes: `isGated`, `signInHref` props added to `ReviewScreen` in Task 4
- Produces: `localStorage.free_gen_count` incremented after each successful anon generation; cleared when user is signed in

- [ ] **Step 1: Add `useLocale` import from next-intl**

  At the top of `components/wizard/ToolWizard.tsx`, update the next-intl import:

  ```ts
  import { useTranslations, useMessages, useLocale } from "next-intl";
  ```

- [ ] **Step 2: Add `freeGenCount` state and initialize from localStorage**

  After the existing `useState` declarations (after line 103 `const [profileSaved, setProfileSaved] = useState(false);`), add:

  ```ts
  const locale = useLocale();
  const [freeGenCount, setFreeGenCount] = useState<number>(0);
  ```

  Then add a new `useEffect` after the existing draft-restore effect:

  ```ts
  useEffect(() => {
    if (userId) {
      // Signed-in user: reset client counter so it stays clean if they sign out later.
      localStorage.setItem("free_gen_count", "0");
      setFreeGenCount(0);
    } else {
      const stored = localStorage.getItem("free_gen_count");
      setFreeGenCount(stored ? parseInt(stored, 10) : 0);
    }
  }, [userId]);
  ```

- [ ] **Step 3: Derive `isGated` and `signInHref`**

  Directly after the new `useEffect`, add:

  ```ts
  const isGated = !userId && freeGenCount >= 3;
  const signInHref = `/${locale}/auth/signin`;
  ```

- [ ] **Step 4: Increment localStorage counter and handle server-side backstop in `generate()`**

  Replace the existing `generate()` function (lines 343–361) with:

  ```ts
  async function generate() {
    setPhase("loading");
    setApiError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug, answers: buildPayload() }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Server-side backstop: update client counter so gate activates.
        if (data.requiresAuth) {
          const next = Math.max(freeGenCount, 3);
          setFreeGenCount(next);
          localStorage.setItem("free_gen_count", String(next));
        }
        throw new Error(data.error ?? "Generation failed");
      }
      // Increment client-side counter for anonymous users.
      if (!userId) {
        const next = freeGenCount + 1;
        setFreeGenCount(next);
        localStorage.setItem("free_gen_count", String(next));
      }
      setResult(data.result);
      setResultModel(data.model);
      setPhase("result");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("review");
    }
  }
  ```

- [ ] **Step 5: Pass `isGated` and `signInHref` to `ReviewScreen`**

  Find the `ReviewScreen` render in the review phase block (around line 444–458). Add the two new props:

  ```tsx
  <ReviewScreen
    questions={questions}
    answers={answers}
    onEdit={handleEditFromReview}
    onGenerate={generate}
    onBack={() => {
      setStep(questions[TOTAL - 1].id);
      setPhase("wizard");
    }}
    apiError={apiError}
    getQuestionLabel={getQuestionLabel}
    getSectionLabel={getSectionLabel}
    isGated={isGated}
    signInHref={signInHref}
  />
  ```

- [ ] **Step 6: Verify TypeScript compiles**

  ```bash
  npm run build
  ```

  Expected: no type errors.

- [ ] **Step 7: Manual test — UI gate**

  1. Open the app in an incognito window (fresh `localStorage`).
  2. Complete and generate 3 times with any tool. Each should succeed.
  3. On the 4th attempt, reach the review screen. Verify the "Generate" button is replaced with "Sign in to generate".
  4. Click "Sign in to generate" — verify it navigates to the sign-in page.
  5. Open DevTools → Application → Local Storage. Verify `free_gen_count` equals `"3"`.
  6. Sign in. Verify `free_gen_count` resets to `"0"` and the Generate button is back.

- [ ] **Step 8: Manual test — backstop**

  1. Open DevTools → Application → Local Storage. Delete the `free_gen_count` key.
  2. Ensure the Redis counter is at 3 for your IP (you may need to manually set it via Upstash console, or complete 3 generations first without clearing the counter).
  3. Reach the review screen — the Generate button should appear (localStorage says 0).
  4. Click Generate. The API returns 401. Verify the review screen now shows the "Sign in to generate" button and the error message "Sign in to continue generating".

- [ ] **Step 9: Commit**

  ```bash
  git add components/wizard/ToolWizard.tsx
  git commit -m "feat: track free-gen count in localStorage, gate review screen after 3 anon uses"
  ```
