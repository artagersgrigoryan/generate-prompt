"use client";

import { useState } from "react";
import { useTranslations, useMessages } from "next-intl";
import { Button } from "@/components/ui/Button";

interface ResultScreenProps {
  result: string;
  modelName: string;
  hasExistingContent: boolean;
  onRegenerate: () => void;
  onStartOver: () => void;
  loading: boolean;
}


type PlatformId = "bolt" | "lovable" | "arena" | "cursor" | "v0";

export function ResultScreen({
  result,
  modelName,
  hasExistingContent,
  onRegenerate,
  onStartOver,
  loading,
}: ResultScreenProps) {
  const t = useTranslations("result");
  const messages = useMessages();
  const rm = (messages.result ?? {}) as Record<string, string>;

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformId>("bolt");

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function steps(prefix: string, count: number): string[] {
    return Array.from({ length: count }, (_, i) => rm[`${prefix}Step${i + 1}`] ?? "");
  }

  const PLATFORMS: {
    id: PlatformId;
    label: string;
    url: string;
    logo: string;
    steps: string[];
    tip?: string;
  }[] = [
    { id: "bolt",    label: t("boltName"),    url: "https://bolt.new",    logo: "/logos/bolt.svg",    steps: steps("bolt",    4) },
    { id: "lovable", label: t("lovableName"), url: "https://lovable.dev", logo: "/logos/lovable.svg", steps: steps("lovable", 4) },
    { id: "arena",   label: t("arenaName"),   url: "https://arena.ai",    logo: "/logos/arena.ico",   steps: steps("arena",   5), tip: rm.arenaTip },
    { id: "cursor",  label: t("cursorName"),  url: "https://cursor.com",  logo: "/logos/cursor.svg",  steps: steps("cursor",  4) },
    { id: "v0",      label: t("v0Name"),      url: "https://v0.dev",      logo: "/logos/v0.svg",      steps: steps("v0",      4) },
  ];

  const active = PLATFORMS.find((p) => p.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {t("generatedWith", { modelName })}
        </p>
        <h2 className="text-xl font-semibold text-neutral-900">{t("title")}</h2>
      </div>

      {/* Attach reminder */}
      {hasExistingContent && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 flex gap-3">
          <span className="text-lg leading-none">📎</span>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-amber-900">{t("attachTitle")}</p>
            <p className="text-xs text-amber-700">{t("attachDesc")}</p>
          </div>
        </div>
      )}

      {/* Result text */}
      <div className="max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
        {result}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopy} variant="primary">
          {copied ? t("copied") : t("copy")}
        </Button>
        <Button onClick={onStartOver} variant="ghost">
          {t("startOver")}
        </Button>
      </div>

      {/* Where to use — tabbed */}
      <div className="border-t border-neutral-100 pt-6 space-y-4">
        <p className="text-sm font-semibold text-neutral-900">{t("whereToUseTitle")}</p>

        {/* Free notice */}
        <div className="flex gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span className="mt-0.5 shrink-0 text-neutral-400">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          </span>
          <p className="text-xs leading-relaxed text-neutral-500">{t("freeNotice")}</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveTab(p.id)}
              className={[
                "relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                activeTab === p.id
                  ? "text-neutral-900 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-black"
                  : "text-neutral-400 hover:text-neutral-600",
              ].join(" ")}
            >
              <img src={p.logo} alt="" className="h-4 w-4 rounded-sm object-contain" />
              {p.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          {/* Open link */}
          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
          >
            <img src={active.logo} alt="" className="h-4 w-4 rounded-sm object-contain" />
            {t("openBtn", { platform: active.label })}
            <svg className="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M2 10L10 2M10 2H5M10 2v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          {/* Steps */}
          <div className="space-y-3">
            {active.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <p className="pt-0.5 text-sm text-neutral-700">{step}</p>
              </div>
            ))}
          </div>

          {/* Tip (Arena only) */}
          {active.tip && (
            <div className="flex gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
              <span className="shrink-0 text-sm text-violet-500">💡</span>
              <p className="text-xs text-violet-700">{active.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
