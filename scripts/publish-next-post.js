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
