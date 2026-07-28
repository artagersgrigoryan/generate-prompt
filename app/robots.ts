import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
