import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getTool, listTools } from "@/lib/tools";
import { ToolWizard } from "@/components/wizard/ToolWizard";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    listTools().map((tool) => ({ locale, toolSlug: tool.slug }))
  );
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; toolSlug: string }>;
}) {
  const { locale, toolSlug } = await params;
  setRequestLocale(locale);

  const tool = getTool(toolSlug);
  if (!tool) notFound();

  // Pass only client-safe fields — never the server-only systemPrompt.
  return (
    <ToolWizard
      toolSlug={tool.slug}
      questions={tool.questions}
      sections={tool.sections}
      existingContentOptions={tool.existingContentOptions}
      devPreviewResult={tool.devPreviewResult}
    />
  );
}
