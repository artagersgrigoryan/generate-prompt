"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface LetterResultScreenProps {
  result: string;
  modelName: string;
  onRegenerate: () => void;
  onStartOver: () => void;
}

export function LetterResultScreen({
  result,
  modelName,
  onRegenerate,
  onStartOver,
}: LetterResultScreenProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          Generated with {modelName}
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Your Cover Letter
        </h2>
      </div>

      <div className="max-h-[520px] overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
        {result}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopy} variant="primary">
          {copied ? "Copied!" : "Copy to clipboard"}
        </Button>
        <Button onClick={onRegenerate} variant="secondary">
          Regenerate
        </Button>
        <Button onClick={onStartOver} variant="ghost">
          Start over
        </Button>
      </div>
    </div>
  );
}
