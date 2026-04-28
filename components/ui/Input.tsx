"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <input
        className={`w-full rounded-lg border px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
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
