"use client";

import { useState } from "react";

interface Prompt {
  id: string;
  result: string;
  model: string;
  isFavorite: boolean;
  createdAt: string;
  toolSlug: string;
}

function toolLabel(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function PromptCard({ prompt }: { prompt: Prompt }) {
  const [expanded, setExpanded] = useState(false);
  const [favorite, setFavorite] = useState(prompt.isFavorite);
  const [deleted, setDeleted] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(prompt.result);
  const [editLoading, setEditLoading] = useState(false);
  const [savedResult, setSavedResult] = useState(prompt.result);
  const [copied, setCopied] = useState(false);

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

  async function copyResult(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(savedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation();
    setEditValue(savedResult);
    setEditing(true);
    setExpanded(true);
  }

  async function saveEdit() {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: editValue }),
      });
      if (res.ok) {
        setSavedResult(editValue);
        setEditing(false);
      }
    } finally {
      setEditLoading(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setEditValue(savedResult);
  }

  if (deleted) return null;

  const date = new Date(prompt.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const preview = savedResult.slice(0, 160).trim();

  return (
    <div className="group rounded-xl border border-neutral-100 bg-white transition-colors hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div
            className="min-w-0 flex-1 cursor-pointer"
            onClick={() => !editing && setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{date}</p>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {toolLabel(prompt.toolSlug)}
              </span>
            </div>
            {editing ? (
              <textarea
                className="mt-2 w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 focus:border-blue-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:border-blue-500"
                rows={10}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p className={`mt-1 break-words text-sm text-neutral-700 dark:text-neutral-300${expanded ? " whitespace-pre-wrap" : ""}`}>
                {expanded ? savedResult : `${preview}${savedResult.length > 160 ? "…" : ""}`}
              </p>
            )}
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
              onClick={copyResult}
              className={`rounded-lg p-1.5 transition-colors ${copied ? "text-green-500" : "text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400"}`}
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <button
              onClick={startEditing}
              disabled={editing}
              className="rounded-lg p-1.5 text-neutral-300 transition-colors hover:text-blue-400 dark:text-neutral-600 dark:hover:text-blue-400"
              aria-label="Edit prompt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        {editing && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={saveEdit}
              disabled={editLoading || !editValue.trim()}
              className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 active:bg-neutral-900 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
            >
              {editLoading ? "Saving…" : "Save"}
            </button>
            <button
              onClick={cancelEdit}
              disabled={editLoading}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
