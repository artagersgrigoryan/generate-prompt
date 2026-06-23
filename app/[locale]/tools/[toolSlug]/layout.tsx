import type { Metadata } from "next";
import { buildAlternates } from "@/app/[locale]/layout";
import { getTool } from "@/lib/tools";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; toolSlug: string }>;
}): Promise<Metadata> {
  const { locale, toolSlug } = await params;
  const tool = getTool(toolSlug);
  if (!tool) return {};
  return {
    title: tool.name,
    description: tool.description,
    alternates: buildAlternates(locale, `/tools/${tool.slug}`),
  };
}

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
