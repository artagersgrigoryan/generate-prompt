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
