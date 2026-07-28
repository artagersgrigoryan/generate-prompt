import type { Metadata } from "next";
import { buildAlternates } from "@/app/[locale]/layout";
import { getTool } from "@/lib/tools";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; toolSlug: string }>;
}): Promise<Metadata> {
  const { locale, toolSlug } = await params;
  const tool = getTool(toolSlug);
  if (!tool) return {};
  const description = tool.seoContent?.tagline ?? tool.description;
  return {
    title: tool.name,
    description,
    alternates: buildAlternates(locale, `/tools/${tool.slug}`),
    openGraph: {
      title: tool.name,
      description,
      type: "website",
    },
  };
}

const softwareSchema = (name: string, description: string, slug: string) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: SITE_URL ? `${SITE_URL}/en/tools/${slug}` : undefined,
  }).replace(/</g, "\\u003c");

const breadcrumbSchema = (name: string, slug: string) =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL ?? "/" },
      { "@type": "ListItem", position: 2, name: "Tools", item: SITE_URL ? `${SITE_URL}/en` : "/" },
      { "@type": "ListItem", position: 3, name, item: SITE_URL ? `${SITE_URL}/en/tools/${slug}` : `/tools/${slug}` },
    ],
  }).replace(/</g, "\\u003c");

export default async function ToolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ toolSlug: string }>;
}) {
  const { toolSlug } = await params;
  const tool = getTool(toolSlug);

  return (
    <>
      {tool && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: softwareSchema(tool.name, tool.seoContent?.tagline ?? tool.description, tool.slug),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: breadcrumbSchema(tool.name, tool.slug) }}
          />
        </>
      )}
      {children}
    </>
  );
}
