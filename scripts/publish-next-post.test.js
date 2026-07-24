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
