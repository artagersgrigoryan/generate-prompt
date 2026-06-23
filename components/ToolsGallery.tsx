import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { listTools } from "@/lib/tools";

// Registry-driven gallery of all tools. New tools registered in `lib/tools`
// appear here automatically. Server component — safe to import the registry.
export async function ToolsGallery() {
  const t = await getTranslations("tools");
  const tools = listTools();

  return (
    <section id="tools" className="bg-white px-6 py-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("galleryTitle")}
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            {t("galleryDesc")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
            >
              <h3 className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {tool.name}
                <span className="text-neutral-300 transition-transform group-hover:translate-x-0.5 dark:text-neutral-600">
                  →
                </span>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
