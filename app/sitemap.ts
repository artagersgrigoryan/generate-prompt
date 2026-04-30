import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const paths: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1.0 },
    { path: "/generator", priority: 0.8 },
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
