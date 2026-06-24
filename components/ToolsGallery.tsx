import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { listTools } from "@/lib/tools";
import type { ToolPublicConfig } from "@/lib/tools/types";

// Per-tool visual config: icon, blob colors, and stroke/glow colors
const TOOL_VISUALS: Record<
  string,
  { iconPath: string; blob1: string; blob2: string; stroke: string; glow: string; glowHover: string }
> = {
  "website-prompt-generator": {
    iconPath:
      "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M9 9l2 2 4-4",
    blob1: "#2563eb",
    blob2: "#4f46e5",
    stroke: "rgba(96, 165, 250, 0.28)",
    glow: "0 0 18px 0 rgba(59, 130, 246, 0.18)",
    glowHover: "0 0 32px 4px rgba(96, 165, 250, 0.38)",
  },
  "cover-letter-generator": {
    iconPath:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z",
    blob1: "#7c3aed",
    blob2: "#0d9488",
    stroke: "rgba(167, 139, 250, 0.28)",
    glow: "0 0 18px 0 rgba(124, 58, 237, 0.18)",
    glowHover: "0 0 32px 4px rgba(167, 139, 250, 0.38)",
  },
};

const FALLBACK_VISUALS = {
  iconPath: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  blob1: "#6366f1",
  blob2: "#8b5cf6",
  stroke: "rgba(129, 140, 248, 0.28)",
  glow: "0 0 18px 0 rgba(99, 102, 241, 0.18)",
  glowHover: "0 0 32px 4px rgba(129, 140, 248, 0.38)",
};

function ToolCard({ tool }: { tool: ToolPublicConfig }) {
  const v = TOOL_VISUALS[tool.slug] ?? FALLBACK_VISUALS;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="tool-card group relative flex min-h-72 flex-col overflow-hidden rounded-3xl p-6"
      style={{
        background: "#111113",
        border: `1px solid ${v.stroke}`,
        boxShadow: v.glow,
        ["--card-glow-hover" as string]: v.glowHover,
      }}
    >
      {/* Gradient blobs — bottom of card, drift on loop, intensify on hover */}
      <div
        aria-hidden="true"
        className="tool-blob-1 absolute opacity-40 group-hover:opacity-[0.72]"
        style={{
          bottom: "-30%",
          left: "-10%",
          width: "70%",
          aspectRatio: "1",
          background: v.blob1,
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden="true"
        className="tool-blob-2 absolute opacity-35 group-hover:opacity-[0.65]"
        style={{
          bottom: "-20%",
          right: "-10%",
          width: "60%",
          aspectRatio: "1",
          background: v.blob2,
          borderRadius: "50%",
          filter: "blur(55px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Icon circle */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d={v.iconPath} />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mt-5 text-xl font-bold leading-snug text-white">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          {tool.description}
        </p>

        {/* CTA */}
        <span className="mt-6 flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
          Open tool
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}

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

        <div className="mt-10 mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
