import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listTools } from "@/lib/tools";
import { getAllPosts, getAllCategories } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const paths: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1.0 },
    { path: "/blog", priority: 0.6 },
    ...listTools().map((tool) => ({ path: `/tools/${tool.slug}`, priority: 0.8 })),
    ...getAllPosts().map((post) => ({ path: `/blog/${post.slug}`, priority: 0.6 })),
    ...getAllCategories().map((cat) => ({ path: `/blog/category/${cat}`, priority: 0.5 })),
  ];

  return routing.locales.flatMap((locale) =>
    paths.map(({ path, priority }) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
    }))
  );
}
