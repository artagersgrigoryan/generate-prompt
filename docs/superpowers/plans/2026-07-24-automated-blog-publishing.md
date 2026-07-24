# Automated Blog Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one pre-written blog post per day automatically, starting from a batch of 7 posts generated now, with zero manual step once the batch and cron exist.

**Architecture:** A Node.js script (`scripts/publish-next-post.js`) reads `content/blog/*.mdx`, finds the earliest-dated `draft: true` post, flips it to `draft: false`, and commits+pushes. A GitHub Actions workflow (`.github/workflows/publish-blog-post.yml`) runs that script daily via cron, plus supports manual `workflow_dispatch` for testing. The push triggers Vercel's existing auto-deploy — no new infrastructure beyond the workflow itself. The initial 7 posts are generated once, up front, using the content-strategy skill to pick real topic gaps, then committed as `draft: true` with sequential dates.

**Tech Stack:** Node.js (CommonJS, matches repo's default — no `"type": "module"` in `package.json`), `gray-matter` (already a dependency), Node's built-in `node:test` runner (Node 20, no new dev dependency), GitHub Actions.

## Global Constraints

- No changes to `lib/blog.ts`'s public API or to the `PostFrontmatter` schema — reuse `draft` and `date` exactly as they exist today.
- No CMS, no database, no new content model — the queue *is* the set of `draft: true` files in `content/blog/`.
- The daily publish step must be deterministic and make zero AI calls — content is already written before the cron ever runs.
- No review/approval gate before a post goes live (explicit product decision — see spec).
- Topics for the batch must come from the **content-strategy** skill, not be invented ad hoc.
- Cron host is GitHub Actions (repo is on GitHub; Vercel already auto-deploys on push to `main`).
- Initial batch size is 7 posts, dated today through today+6.

---

### Task 1: Publish script (`scripts/publish-next-post.js`)

**Files:**
- Create: `scripts/publish-next-post.js`
- Create: `scripts/publish-next-post.test.js`
- Modify: `eslint.config.mjs` (add `scripts/**` to `globalIgnores` — this is a plain Node CommonJS script; Next's ESLint config assumes browser/React code and will flag `require`/`module`/`process` as undefined globals otherwise)

**Interfaces:**
- Produces: `loadDrafts(blogDir: string) -> Array<{ file: string, filePath: string, data: object, content: string }>` — draft posts in `blogDir`, sorted by frontmatter `date` ascending. Only entries with `data.draft === true` are included.
- Produces: `publishPost(entry: ReturnType<loadDrafts>[number]) -> void` — rewrites `entry.filePath` on disk with `draft: false`, preserving every other frontmatter field and the MDX body unchanged.
- Produces: `main()` — orchestrates `loadDrafts` + `publishPost` on `content/blog/`, then `git add`/`commit`/`push`. Only runs when the file is executed directly (`require.main === module`), not when required as a module (so the test file can import `loadDrafts`/`publishPost` without triggering git operations).

- [ ] **Step 1: Write the failing test file**

Create `scripts/publish-next-post.test.js`:

```js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const matter = require("gray-matter");
const { loadDrafts, publishPost } = require("./publish-next-post");

function makeFixture(dir, filename, frontmatter, body = "Body text.") {
  fs.writeFileSync(path.join(dir, filename), matter.stringify(body, frontmatter));
}

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "blog-test-"));
}

test("loadDrafts filters to draft:true and sorts by date ascending", () => {
  const dir = makeTmpDir();
  try {
    makeFixture(dir, "later.mdx", { title: "Later", date: "2026-08-02", draft: true });
    makeFixture(dir, "published.mdx", { title: "Already live", date: "2026-07-20", draft: false });
    makeFixture(dir, "earlier.mdx", { title: "Earlier", date: "2026-08-01", draft: true });

    const drafts = loadDrafts(dir);

    assert.equal(drafts.length, 2);
    assert.equal(drafts[0].file, "earlier.mdx");
    assert.equal(drafts[1].file, "later.mdx");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("publishPost flips draft to false and preserves other frontmatter and body", () => {
  const dir = makeTmpDir();
  try {
    makeFixture(
      dir,
      "post.mdx",
      {
        title: "A Post",
        description: "A description.",
        date: "2026-08-01",
        author: "Artagers Grigoryan",
        tags: ["career"],
        category: "general",
        draft: true,
      },
      "The post body.\n"
    );

    const [entry] = loadDrafts(dir);
    publishPost(entry);

    const raw = fs.readFileSync(path.join(dir, "post.mdx"), "utf8");
    const { data, content } = matter(raw);

    assert.equal(data.draft, false);
    assert.equal(data.title, "A Post");
    assert.equal(data.date, "2026-08-01");
    assert.deepEqual(data.tags, ["career"]);
    assert.match(content, /The post body\./);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("loadDrafts returns empty array when no drafts exist", () => {
  const dir = makeTmpDir();
  try {
    makeFixture(dir, "published.mdx", { title: "Live", date: "2026-07-20", draft: false });
    assert.deepEqual(loadDrafts(dir), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/publish-next-post.test.js`
Expected: FAIL — `Cannot find module './publish-next-post'`

- [ ] **Step 3: Write the implementation**

Create `scripts/publish-next-post.js`:

```js
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const matter = require("gray-matter");

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Draft posts in `blogDir`, sorted by frontmatter `date` ascending.
 */
function loadDrafts(blogDir) {
  const files = fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const drafts = files
    .map((file) => {
      const filePath = path.join(blogDir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      return { file, filePath, data, content };
    })
    .filter((post) => post.data.draft === true);

  drafts.sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
  return drafts;
}

/** Flips `draft` to false on disk for the given loadDrafts() entry. */
function publishPost(entry) {
  const updatedData = { ...entry.data, draft: false };
  fs.writeFileSync(entry.filePath, matter.stringify(entry.content, updatedData));
}

function main() {
  const drafts = loadDrafts(BLOG_DIR);

  if (drafts.length === 0) {
    console.log("No drafts to publish.");
    return;
  }

  const next = drafts[0];
  publishPost(next);
  console.log(`Published: ${next.file} (date: ${next.data.date})`);

  execSync(`git add ${JSON.stringify(next.filePath)}`, { stdio: "inherit" });
  execSync(`git commit -m ${JSON.stringify(`chore: publish scheduled post ${next.file}`)}`, {
    stdio: "inherit",
  });
  execSync("git push", { stdio: "inherit" });
}

module.exports = { loadDrafts, publishPost };

if (require.main === module) {
  main();
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test scripts/publish-next-post.test.js`
Expected: PASS — 3 tests, 0 failures

- [ ] **Step 5: Ignore `scripts/**` in ESLint**

Edit `eslint.config.mjs`, add `"scripts/**"` to the `globalIgnores([...])` array (alongside the existing `.next/**`, `out/**`, `build/**`, `next-env.d.ts` entries).

- [ ] **Step 6: Verify lint and build still pass**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds (this script isn't imported anywhere in the app, so it can't break the build, but confirms the eslint config change didn't break anything else).

- [ ] **Step 7: Commit**

```bash
git add scripts/publish-next-post.js scripts/publish-next-post.test.js eslint.config.mjs
git commit -m "feat: add script to publish the next scheduled draft blog post"
```

---

### Task 2: Daily publish workflow (GitHub Actions)

**Files:**
- Create: `.github/workflows/publish-blog-post.yml`

**Interfaces:**
- Consumes: `scripts/publish-next-post.js` (Task 1) via `node scripts/publish-next-post.js`.

- [ ] **Step 1: Write the workflow file**

Create `.github/workflows/publish-blog-post.yml`:

```yaml
name: Publish scheduled blog post

on:
  schedule:
    - cron: "0 13 * * *"
  workflow_dispatch: {}

permissions:
  contents: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci --omit=dev --ignore-scripts

      - name: Configure git identity
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Publish next scheduled post
        run: node scripts/publish-next-post.js
```

Notes on specific choices:
- `--ignore-scripts` on `npm ci` skips the `postinstall` (`prisma generate`), which needs `DATABASE_URL` and isn't needed to run this script.
- `--omit=dev` is safe because `gray-matter` (the only runtime dependency the script needs) is a regular `dependencies` entry, not a `devDependency`.
- `permissions: contents: write` is required for the auto-provided `GITHUB_TOKEN` (used implicitly by `actions/checkout` for the push) to have write access — without it, `git push` fails with a 403.

- [ ] **Step 2: Validate the YAML parses correctly**

Run: `node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/publish-blog-post.yml','utf8')); console.log('valid yaml')"`
Expected: prints `valid yaml` with no error. (`js-yaml` is already present in `node_modules` as a transitive dependency of `gray-matter` — this is a one-off local sanity check, not a new project dependency.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/publish-blog-post.yml
git commit -m "feat: add daily GitHub Actions workflow to publish scheduled blog posts"
```

- [ ] **Step 4: Manual prerequisite — flag for the user**

This step has no code artifact. After this commit is pushed, verify in the GitHub repo settings (Settings → Actions → General → "Workflow permissions") that "Read and write permissions" is selected — not the default-in-newer-repos "Read repository contents permission" (read-only). If it's read-only, the workflow's `git push` will fail with a 403 on every run. This cannot be checked or changed from this session (no `gh` CLI / repo API access available) — it needs to be confirmed by whoever has access to the repo's GitHub settings before the first scheduled run.

---

### Task 3: Initial batch of 7 posts

**Files:**
- Create: 7 files under `content/blog/<slug>.mdx` (exact filenames determined by the topics chosen in Step 1 below)
- Create: `scripts/verify-batch.js` (reusable sanity check for this batch and future monthly top-ups)

**Interfaces:**
- Consumes: `loadDrafts` is not reused here directly, but the frontmatter shape written must exactly match what `scripts/publish-next-post.js` (Task 1) and `lib/blog.ts` expect: `title: string`, `description: string`, `date: "YYYY-MM-DD"`, `author: string`, `tags: string[]`, `category: string`, `draft: boolean`.

- [ ] **Step 1: Get topic recommendations from the content-strategy skill**

Invoke the `content-strategy` skill. Give it the full list of existing post titles, tags, and categories from `content/blog/*.mdx` (read them first) as context, and ask for 7 new topic recommendations that fill genuine gaps for this career/AI-tools blog — the site's existing categories span `website-prompt-generator`, `cover-letter-generator`, `elevator-pitch-generator`, cold email, and general career topics (resignations, LinkedIn, professional bios). Do not invent topics ad hoc outside this step — this is a hard requirement from the design spec.

- [ ] **Step 2: Write the 7 MDX files**

For each of the 7 recommended topics, write a complete post to `content/blog/<kebab-case-slug>.mdx`. Match the exact frontmatter shape used by every existing post (see `content/blog/30-second-vs-60-second-elevator-pitch.mdx` for reference):

```yaml
---
title: "..."
description: "..."
date: "YYYY-MM-DD"
author: "Artagers Grigoryan"
tags: ["...", "..."]
category: "<tool-slug-or-general>"
draft: true
---
```

Determine today's actual date (e.g. `date -I` in the shell) and assign each of the 7 posts a distinct date starting today, one per calendar day (today, today+1, ..., today+6) — this date encodes the publish order that `scripts/publish-next-post.js` will consume. Write full post bodies matching the tone, structure, and length of existing posts in `content/blog/` (headings, scannable sections, ~800-1500 words), not stubs.

- [ ] **Step 3: Write and run the batch verification script**

Create `scripts/verify-batch.js`:

```js
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const REQUIRED_FIELDS = ["title", "description", "date", "author", "tags", "category"];

function verifyDrafts() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const drafts = files
    .map((file) => ({ file, ...matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8")) }))
    .filter((post) => post.data.draft === true);

  const errors = [];
  const seenDates = new Set();

  for (const post of drafts) {
    for (const field of REQUIRED_FIELDS) {
      if (!post.data[field]) errors.push(`${post.file}: missing "${field}"`);
    }
    if (!Array.isArray(post.data.tags) || post.data.tags.length === 0) {
      errors.push(`${post.file}: "tags" must be a non-empty array`);
    }
    if (seenDates.has(post.data.date)) {
      errors.push(`${post.file}: duplicate date "${post.data.date}" among drafts`);
    }
    seenDates.add(post.data.date);
  }

  if (errors.length > 0) {
    console.error(`Found ${errors.length} issue(s):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`OK: ${drafts.length} draft post(s) verified.`);
}

verifyDrafts();
```

Run: `node scripts/verify-batch.js`
Expected: `OK: 7 draft post(s) verified.` — if it reports errors, fix the corresponding `.mdx` file's frontmatter and re-run before proceeding.

- [ ] **Step 4: Confirm the site still builds**

Run: `npm run build`
Expected: build succeeds. This exercises `lib/blog.ts`'s `readAll()` against the new files (even though they're `draft: true` and excluded from rendering, they're still parsed by `getAllPosts()`/sitemap generation, so malformed frontmatter would surface here).

- [ ] **Step 5: Commit and push the batch**

```bash
git add content/blog/ scripts/verify-batch.js
git commit -m "feat: add initial batch of 7 draft blog posts for scheduled publishing"
git push
```

---

### Task 4: Initial end-to-end test and CLAUDE.md documentation

**Files:**
- Modify: `CLAUDE.md` (add a short section documenting this subsystem, following the existing convention of one section per subsystem — see the "Telegram analytics side-effect" section for the expected length/style)

**Interfaces:**
- Consumes: everything from Tasks 1-3.

- [ ] **Step 1: Manually trigger the workflow once**

In the GitHub repo's Actions tab, run the "Publish scheduled blog post" workflow manually via "Run workflow" (this is the `workflow_dispatch` trigger from Task 2). This requires Task 2's push to have landed and the "Workflow permissions" check from Task 2 Step 4 to have been confirmed first.

- [ ] **Step 2: Verify the end-to-end result**

Confirm all of the following:
- The workflow run succeeded (green check in the Actions tab).
- A new commit appears on `main` with message `chore: publish scheduled post <slug>.mdx`, changing exactly one file's `draft: true` → `draft: false`.
- Vercel picked up the push and redeployed (check the Vercel dashboard for a new deployment tied to that commit).
- The published post now appears in the blog index (`/en/blog`) and its own route (`/en/blog/<slug>`) resolves; the remaining 6 posts do not yet appear.

- [ ] **Step 3: Document the subsystem in CLAUDE.md**

Add a new section to `CLAUDE.md` (placed after the existing "### Blog" section), matching the file's existing style:

```markdown
### Automated blog publishing

Blog posts can be batch-generated and drip-published automatically instead of committed one at a time:

- Generating a batch is a Claude Code session task (not a script) — it invokes the content-strategy skill against the existing posts to pick real topic gaps, then writes full `.mdx` files to `content/blog/` with `draft: true` and sequential dates (one per calendar day), and commits the batch. Ask for this roughly monthly, or whenever the draft queue runs low.
- `scripts/publish-next-post.js` is the deterministic publish step: it finds the earliest-dated `draft: true` post and flips it to `draft: false`. No AI calls at publish time — content is already written.
- `.github/workflows/publish-blog-post.yml` runs that script daily via cron (`0 13 * * *`) and supports manual `workflow_dispatch` for testing. The resulting push triggers Vercel's existing auto-deploy on `main`.
- `scripts/verify-batch.js` is a reusable sanity check for a freshly generated batch (required frontmatter fields present, no duplicate dates among drafts) — run it before committing a new batch.
- Requires the repo's Settings → Actions → General → "Workflow permissions" to be "Read and write permissions", otherwise the workflow's push fails with a 403.
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document automated blog publishing in CLAUDE.md"
```

---

## Self-Review Notes

- **Spec coverage:** Part A → Task 3. Part B → Tasks 1-2. Part C → Task 4 (Steps 1-2). Part D (manual monthly top-up) is documented in CLAUDE.md (Task 4 Step 3) but has no code task, matching the spec's explicit non-goal of automating it this iteration. The "Workflow permissions" manual prerequisite from the spec is captured as Task 2 Step 4.
- **Type/interface consistency:** `loadDrafts`/`publishPost` signatures are defined once in Task 1 and referenced identically in Task 1's own test — no other task calls into them directly (Task 2 only shells out to `node scripts/publish-next-post.js`, Task 3 doesn't import the script at all), so there's no cross-task drift risk.
- **No placeholders:** every step has runnable code or an exact command; the one manual, non-scriptable step (GitHub repo settings) is explicitly called out as such rather than glossed over.
