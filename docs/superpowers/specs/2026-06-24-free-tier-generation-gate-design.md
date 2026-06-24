# Free-Tier Generation Gate

**Date:** 2026-06-24
**Status:** Approved

## Problem

Anonymous users can generate unlimited prompts across all tools. We want to allow 3 free generations (shared across all tools), then require sign-in to continue.

## Approach

Hybrid: `localStorage` for instant UI gate, Redis for server-side enforcement. Both layers are independent — client UX is optimistic, server is the truth.

## Data Layer

**Redis key:** `free:anon:<ip>` → integer count, TTL 30 days (rolling).
- Only incremented after a _successful_ generation (failed/rate-limited requests don't burn a slot).
- When Redis is not configured (`UPSTASH_REDIS_REST_URL` absent), the check is skipped — dev works without Redis.

**localStorage key:** `free_gen_count` → string-encoded integer.
- Incremented client-side after every successful anonymous generation.
- Cleared to `0` when `userId` is present (signed-in user).
- Persists across sessions (unlike `sessionStorage`).

Counter is **shared across all tools** — 3 total regardless of which tool generated them.

## API Changes (`/api/generate`)

1. **Before Anthropic call** (after session check): if no session, read `free:anon:<ip>` from Redis. If count ≥ 3, return:
   ```json
   { "error": "Sign in to continue", "requiresAuth": true }
   ```
   with HTTP status `401`.

2. **After successful generation**: if no session, `INCR free:anon:<ip>` and `EXPIRE` it to 30 days. Count only goes up on success.

## Client UI Changes

### `ToolWizard`
- On entering review phase, read `localStorage.free_gen_count`.
- Derive `isGated = !userId && parseInt(count) >= 3`.
- Pass `isGated` as a prop to `ReviewScreen`.
- After a successful `generate()` with no `userId`: increment `localStorage.free_gen_count`.
- When `userId` is present: reset `localStorage.free_gen_count` to `"0"`.

### `ReviewScreen`
- Accept new prop `isGated: boolean`.
- When `true`: replace the "Generate" button with a "Sign in to generate" link → `/[locale]/auth/signin`.
- When `false`: no change to existing behavior.
- **Server backstop**: if `generate()` returns `requiresAuth: true` (localStorage was cleared and user bypassed the UI gate), show inline error "Sign in to generate more" with a sign-in link instead of a generic error.

## i18n

Add translation key `signInToGenerate` to `messages/en.json`, `messages/hy.json`, and `messages/ru.json`.

## Out of Scope

- Showing a count/progress indicator ("2 of 3 free generations used") — can be added later.
- Resetting the counter when a user signs in and then signs out again — treated as an edge case; server-side Redis count is the backstop.
- Per-tool limits — explicitly rejected; limit is shared.
