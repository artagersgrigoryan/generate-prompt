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
    const beforeLines = entry.raw.split("\n");
    publishPost(entry);

    const afterRaw = fs.readFileSync(path.join(dir, "post.mdx"), "utf8");
    const afterLines = afterRaw.split("\n");

    // Verify same number of lines
    assert.equal(beforeLines.length, afterLines.length);

    // Verify every line is identical except the draft: line
    for (let i = 0; i < beforeLines.length; i++) {
      if (beforeLines[i].includes("draft:")) {
        assert.equal(beforeLines[i], "draft: true");
        assert.equal(afterLines[i], "draft: false");
      } else {
        assert.equal(beforeLines[i], afterLines[i]);
      }
    }

    // Also verify via matter that field values are correct
    const { data, content } = matter(afterRaw);
    assert.equal(data.draft, false);
    assert.equal(data.title, "A Post");
    assert.equal(data.date, "2026-08-01");
    assert.deepEqual(data.tags, ["career"]);
    assert.match(content, /The post body\./);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("publishPost throws when draft line is not found", () => {
  const dir = makeTmpDir();
  try {
    makeFixture(
      dir,
      "already-published.mdx",
      {
        title: "Already Published",
        date: "2026-08-01",
        draft: false,
      },
      "Post body.\n"
    );

    const dirWithNoDraft = makeTmpDir();
    try {
      makeFixture(
        dirWithNoDraft,
        "no-draft-field.mdx",
        {
          title: "No Draft Field",
          date: "2026-08-01",
        },
        "Post body.\n"
      );

      // Test with draft: false
      const draftsPublished = loadDrafts(dir);
      assert.equal(draftsPublished.length, 0, "No drafts should be found in already-published directory");

      // Test with no draft field at all
      const draftsNoField = loadDrafts(dirWithNoDraft);
      assert.equal(draftsNoField.length, 0, "No drafts should be found when draft field is missing");

      // Now manually create an entry without draft: true to test publishPost error handling
      const filePath = path.join(dirWithNoDraft, "manual-entry.mdx");
      fs.writeFileSync(filePath, "---\ntitle: Test\ndraft: false\n---\nBody");
      const manualEntry = { file: "manual-entry.mdx", filePath, raw: fs.readFileSync(filePath, "utf8"), data: { draft: false }, content: "Body" };

      assert.throws(
        () => publishPost(manualEntry),
        { message: /Could not find a "draft: true" line to flip/ }
      );
    } finally {
      fs.rmSync(dirWithNoDraft, { recursive: true, force: true });
    }
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
