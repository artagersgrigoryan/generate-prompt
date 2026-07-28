import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site-url";

// Single canonical (English) RSS 2.0 feed for the blog.
// Per-locale feeds are deferred (the blog serves one content set per locale).

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] ?? c)
  );
}

export async function GET() {
  const siteUrl = SITE_URL ?? "";
  const posts = getAllPosts();

  const items = posts
    .map((p) => {
      const url = `${siteUrl}/en/blog/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>${
        p.description ? `\n      <description>${escapeXml(p.description)}</description>` : ""
      }
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Prompt Station — Blog</title>
    <link>${escapeXml(`${siteUrl}/en/blog`)}</link>
    <description>Guides, updates, and tips for turning ideas into AI-built websites.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
