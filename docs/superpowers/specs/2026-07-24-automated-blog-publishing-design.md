# Automated blog publishing — design

## Problem

Blog posts are added manually today: write an `.mdx` file in `content/blog/`, commit, push. The user wants a steady drip of new posts without doing this by hand every day, while keeping content quality under their control (AI-generated but strategically chosen, not random).

## Goals

- Generate a batch of blog posts in one sitting, using the content-strategy skill to pick topics that fill real gaps against the existing 38 posts (not ad hoc topics).
- Publish exactly one post per day automatically, with zero manual step once a batch exists.
- Reuse the existing blog schema and file-based architecture (`lib/blog.ts`) — no new content model, no CMS, no database.
- Keep the daily publish mechanism deterministic and free of AI calls — the content is already written; publishing is just "make it visible."

## Non-goals (for this iteration)

- No review/approval gate before a post goes live (explicit user decision — quality risk accepted for now).
- No automatic monthly regeneration of the queue — topping up the batch stays a manual ask-Claude step for now.
- No changes to how the blog renders, is styled, or is fetched (`lib/blog.ts`'s public API is unchanged).

## Architecture

### Part A — Batch content generation (on-demand, Claude-driven, not scripted)

This is a task Claude performs when asked (now, for an initial batch of 7; later, roughly monthly, whenever the user asks again):

1. Invoke the **content-strategy** skill, feeding it the existing posts' titles, tags, and categories (read from `content/blog/*.mdx` via the same frontmatter fields `lib/blog.ts` already parses) to identify topic gaps.
2. For each recommended topic, write a complete `.mdx` post matching the exact existing frontmatter schema:
   ```yaml
   title: "..."
   description: "..."
   date: "YYYY-MM-DD"
   author: "Artagers Grigoryan"
   tags: ["..."]
   category: "<tool-slug>" | "general"
   draft: true
   ```
3. Assign each post in the batch a sequential `date`, one per calendar day starting today (batch of 7 → today through today+6). Order of dates encodes publish order.
4. Save files to `content/blog/<slug>.mdx` following the existing kebab-case slug convention.
5. Commit the whole batch in one commit and push to `main`.

This step is intentionally **not** a script or cron job — topic selection needs real judgment (content-strategy skill), so it stays a Claude Code session task invoked on demand.

### Part B — Daily publish cron (GitHub Actions, deterministic, no AI call)

New files:

- `.github/workflows/publish-blog-post.yml`
  - Triggers: `schedule` (daily cron, default `0 13 * * *` i.e. 13:00 UTC) and `workflow_dispatch` (manual trigger, used for the initial test run).
  - `permissions: contents: write` so the auto-provided `GITHUB_TOKEN` can push.
  - Steps: checkout → run publish script → (script handles its own git commit/push if it changed something).
- `scripts/publish-next-post.ts` (or `.mjs`, whichever matches repo tooling)
  - Reads all `content/blog/*.mdx` frontmatter (reuse `gray-matter`, same as `lib/blog.ts`).
  - Filters to `draft: true`.
  - Picks the entry with the earliest `date`.
  - If none found: log "no drafts to publish" and exit 0 (clean no-op — this is the expected steady-state once a batch is exhausted).
  - If found: set `draft: false` in that file's frontmatter, write the file back, `git add`/`commit`/`push` from within the script (or as subsequent workflow steps).

The push to `main` is picked up by Vercel's existing auto-deploy — no Vercel-side changes needed.

**Manual one-time prerequisite** (cannot be verified or set by Claude — no repo API access in this session): repo Settings → Actions → General → "Workflow permissions" must be set to "Read and write permissions," otherwise the script's push will fail with a 403. User to verify before the first scheduled run.

### Part C — Initial test (this week)

1. Claude generates the 7-post batch per Part A, dated today → today+6, all `draft: true`, and pushes.
2. User verifies the GitHub Actions "Workflow permissions" setting.
3. Manually trigger the workflow once (`workflow_dispatch`) to confirm the full chain end-to-end: frontmatter flips → commit → push → Vercel deploy → post visible and no longer filtered by `getAllPosts()`/`getPostBySlug()`.
4. Daily schedule takes over for the remaining 6 posts.

### Part D — Monthly top-up (future, manual for now)

When the queue runs low (~monthly at 1/day with a 7–30 post batch), the user asks Claude to repeat Part A. Not automated yet — deferred pending the outcome of this test, since content-strategy-quality topic selection benefits from a real Claude Code session rather than a scripted Anthropic API call. If desired later, this could become its own lower-frequency scheduled Claude Code agent, but that's out of scope here.

## Data / schema

No schema changes. Reuses existing `PostFrontmatter` fields in `lib/blog.ts` exactly as they are (`draft` and `date` already do all the gating and ordering work needed — `getAllPosts()` and `getPostBySlug()` already exclude `draft: true` posts).

## Error handling

- Script finds zero drafts → clean no-op, not a failure (this is the normal end state between batches).
- Push conflicts (e.g., someone else pushed to `main` in between) → workflow step fails naturally; GitHub's default notifications email the repo owner. No special retry logic for this iteration — failures are rare (single daily writer) and visible.
- Malformed frontmatter in a draft file → script errors out loudly rather than silently skipping, since that indicates a bad batch-generation run that needs human attention.

## Testing plan

- Manual `workflow_dispatch` run against the real 7-post test batch, verifying: correct post selected (earliest date), frontmatter flips correctly, commit/push succeeds, Vercel redeploys, post appears on `/en/blog` and at its `/en/blog/[slug]` route, and is excluded before publish / included after.
- No automated test suite exists in this repo (per `CLAUDE.md`); manual verification is consistent with existing project conventions.

## Open items resolved during brainstorming

- Publish model: batch-generate + daily drip (not fully autonomous, not manual-only).
- Review gate: none — posts publish unreviewed.
- Topic sourcing: content-strategy skill, not ad hoc.
- Cron host: GitHub Actions (repo already on GitHub; Vercel already auto-deploys on push to `main`).
- Initial batch size: 7 (test week); monthly top-up manual thereafter.
