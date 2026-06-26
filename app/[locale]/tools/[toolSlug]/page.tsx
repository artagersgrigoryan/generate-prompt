import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getTool, listTools } from "@/lib/tools";
import { ToolIntro } from "@/components/tool/ToolIntro";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listTools().map((tool) => ({ locale, toolSlug: tool.slug }))
  );
}

export default async function ToolIntroPage({
  params,
}: {
  params: Promise<{ locale: string; toolSlug: string }>;
}) {
  const { locale, toolSlug } = await params;
  setRequestLocale(locale);

  const tool = getTool(toolSlug);
  if (!tool) notFound();

  if (!tool.seoContent) notFound();

  return (
    <div className="-mt-16 min-h-screen bg-white pt-16 dark:bg-neutral-950">
      <ToolIntro seoContent={tool.seoContent} toolName={tool.name} toolSlug={tool.slug} />
    </div>
  );
}
