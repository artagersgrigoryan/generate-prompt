"use client";

import { useState } from "react";

interface Prompt {
  id: string;
  result: string;
  model: string;
  isFavorite: boolean;
  createdAt: string;
}

export function PromptCard({ prompt }: { prompt: Prompt }) {
  const [expanded, setExpanded] = useState(false);
  const [favorite, setFavorite] = useState(prompt.isFavorite);
  const [deleted, setDeleted] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    setFavLoading(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setFavorite(data.isFavorite);
      }
    } finally {
      setFavLoading(false);
    }
  }

  async function deletePrompt(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this prompt?")) return;
    const res = await fetch(`/api/prompts/${prompt.id}`, { method: "DELETE" });
    if (res.ok) setDeleted(true);
  }

  if (deleted) return null;

  const date = new Date(prompt.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const preview = prompt.result.slice(0, 160).trim();

  return (
    <div className="group rounded-xl border border-neutral-100 bg-white transition-colors hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {date}
            </p>
            <p className="mt-1 break-words text-sm text-neutral-700 dark:text-neutral-300">
              {expanded ? prompt.result : `${preview}${prompt.result.length > 160 ? "…" : ""}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`rounded-lg p-1.5 transition-colors ${
                favorite
                  ? "text-amber-500"
                  : "text-neutral-300 hover:text-amber-400 dark:text-neutral-600 dark:hover:text-amber-400"
              }`}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            <button
              onClick={deletePrompt}
              className="rounded-lg p-1.5 text-neutral-300 transition-colors hover:text-red-400 dark:text-neutral-600 dark:hover:text-red-400"
              aria-label="Delete prompt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </button>
    </div>
  );
}
