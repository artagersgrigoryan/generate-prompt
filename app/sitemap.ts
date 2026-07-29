import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listTools } from "@/lib/tools";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = SITE_URL ?? "";

  const localizedPaths: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1.0 },
    ...listTools().map((tool) => ({ path: `/tools/${tool.slug}`, priority: 0.8 })),
  ];

  // Blog content has no per-locale translations — hy/ru blog URLs 301 to the
  // /en equivalent (see next.config.ts), so only the English URL is indexable.
  const blogPaths: Array<{ path: string; priority: number }> = [
    { path: "/blog", priority: 0.6 },
    ...getAllPosts().map((post) => ({ path: `/blog/${post.slug}`, priority: 0.6 })),
    ...getAllCategories().map((cat) => ({ path: `/blog/category/${cat}`, priority: 0.5 })),
  ];

  const localizedEntries = routing.locales.flatMap((locale) =>
    localizedPaths.map(({ path, priority }) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
    }))
  );

  const blogEntries = blogPaths.map(({ path, priority }) => ({
    url: `${siteUrl}/en${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
  }));

  return [...localizedEntries, ...blogEntries];
}
