"use client";

import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        className={`w-full rounded-lg border px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-colors resize-none ${
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-neutral-300 focus:border-black"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
