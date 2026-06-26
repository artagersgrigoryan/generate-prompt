import { getTranslations } from "next-intl/server";
import { listTools, toPublicTool } from "@/lib/tools";
import { ToolsGalleryClient } from "./ToolsGalleryClient";

export async function ToolsGallery() {
  const t = await getTranslations("tools");
  const tools = listTools().map(toPublicTool);

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

        <div className="mt-10">
          <ToolsGalleryClient tools={tools} openLabel={t("openTool")} />
        </div>
      </div>
    </section>
  );
}
