// File-based blog. Posts are `.mdx` files in `content/blog/` with frontmatter.
// SERVER-ONLY: uses the Node filesystem. Import from server components only.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostFrontmatter {
  title: string;
  description?: string;
  /** ISO date string, e.g. "2026-06-23". */
  date: string;
  author?: string;
  tags?: string[];
  /** Tool slug (e.g. "website-prompt-generator") or "general". Defaults to "general" if omitted. */
  category?: string;
  /** When true, the post is hidden from listings and routes. */
  draft?: boolean;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  /** Estimated reading time in minutes. */
  readingTime: number;
}

export interface Post extends PostMeta {
  /** Raw MDX body (without frontmatter). */
  content: string;
}

/** Estimated reading time in minutes (200 wpm). */
export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function readAll(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return { slug, content, readingTime: getReadingTime(content), ...(data as PostFrontmatter) };
    });
}

/** Published posts, newest first (drafts excluded). */
export function getAllPosts(): PostMeta[] {
  return readAll()
    .filter((p) => !p.draft)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map(({ content: _content, ...meta }) => meta);
}

/** A single published post by slug, or null. */
export function getPostBySlug(slug: string): Post | null {
  return readAll().find((p) => p.slug === slug && !p.draft) ?? null;
}

/** "website-prompt-generator" → "Website Prompt Generator", "general" → "General". */
export function getCategoryLabel(category: string): string {
  if (category === "general") return "General";
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Published posts filtered to a specific category (defaults posts with no category to "general"). */
export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter((p) => (p.category ?? "general") === category);
}

/** Unique categories from all published posts, "general" sorted last. */
export function getAllCategories(): string[] {
  const cats = new Set(getAllPosts().map((p) => p.category ?? "general"));
  return [...cats].sort((a, b) =>
    a === "general" ? 1 : b === "general" ? -1 : a.localeCompare(b)
  );
}
