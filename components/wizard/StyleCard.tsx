"use client";

import { ReactNode } from "react";

interface StyleCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  preview: ReactNode;
}

export function StyleCard({ label, selected, onSelect, preview }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col overflow-hidden rounded-xl border transition-all ${
        selected
          ? "border-black shadow-sm ring-1 ring-black"
          : "border-neutral-200 hover:border-neutral-400"
      }`}
    >
      <div className="h-28 w-full overflow-hidden">{preview}</div>
      <div
        className={`px-2 py-1.5 text-center text-xs font-medium transition-colors ${
          selected
            ? "bg-black text-white"
            : "bg-white text-neutral-700"
        }`}
      >
        {label}
      </div>
    </button>
  );
}

// ── Previews ──────────────────────────────────────────────────────────────────

export const STYLE_PREVIEWS: Record<string, ReactNode> = {
  "Minimal & clean": (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
        <div className="h-1.5 w-8 rounded bg-neutral-800" />
        <div className="flex gap-2">
          <div className="h-1 w-5 rounded bg-neutral-200" />
          <div className="h-1 w-5 rounded bg-neutral-200" />
          <div className="h-1 w-5 rounded bg-neutral-200" />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 px-3">
        <div className="h-2.5 w-20 rounded bg-neutral-800" />
        <div className="h-1.5 w-24 rounded bg-neutral-200" />
        <div className="h-1.5 w-16 rounded bg-neutral-200" />
        <div className="mt-1 h-5 w-12 rounded border border-neutral-800" />
      </div>
    </div>
  ),

  "Bold & modern": (
    <div className="flex h-full w-full flex-col bg-neutral-900">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="h-2 w-6 rounded-sm bg-white" />
        <div className="h-4 w-4 rounded-sm bg-white opacity-80" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 px-3">
        <div className="h-4 w-20 rounded-sm bg-white" />
        <div className="h-2 w-14 rounded-sm bg-white opacity-40" />
        <div className="mt-1 h-5 w-10 rounded-sm bg-white" />
      </div>
      <div className="h-1 w-full bg-neutral-600" />
    </div>
  ),

  "Warm & friendly": (
    <div className="flex h-full w-full flex-col" style={{ background: "#FFFBF0" }}>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="h-2 w-10 rounded-full" style={{ background: "#F59E0B" }} />
        <div className="flex gap-1.5">
          <div className="h-1.5 w-4 rounded-full" style={{ background: "#FDE68A" }} />
          <div className="h-1.5 w-4 rounded-full" style={{ background: "#FDE68A" }} />
        </div>
      </div>
      <div className="flex flex-1 items-center gap-3 px-3">
        <div className="h-10 w-10 shrink-0 rounded-full" style={{ background: "#FCD34D" }} />
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-14 rounded-full" style={{ background: "#F59E0B" }} />
          <div className="h-1.5 w-10 rounded-full" style={{ background: "#FDE68A" }} />
          <div className="h-1.5 w-12 rounded-full" style={{ background: "#FDE68A" }} />
        </div>
      </div>
      <div className="flex gap-2 px-3 pb-3">
        <div className="h-5 w-14 rounded-full" style={{ background: "#F59E0B" }} />
        <div className="h-5 w-10 rounded-full border" style={{ borderColor: "#F59E0B" }} />
      </div>
    </div>
  ),

  "Elegant & luxury": (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ background: "#0C0A09" }}>
      <div className="h-px w-12" style={{ background: "#D4AF37" }} />
      <div className="flex flex-col items-center gap-1.5">
        <div className="h-2 w-16 rounded-sm" style={{ background: "#D4AF37", opacity: 0.9 }} />
        <div className="h-1 w-20 rounded-sm" style={{ background: "#78716c" }} />
        <div className="h-1 w-14 rounded-sm" style={{ background: "#78716c" }} />
      </div>
      <div className="h-px w-12" style={{ background: "#D4AF37" }} />
      <div className="mt-1 h-5 w-14 rounded-none border" style={{ borderColor: "#D4AF37" }} />
    </div>
  ),

  "Playful & colorful": (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between px-3 py-2" style={{ background: "#FDF4FF" }}>
        <div className="h-2 w-8 rounded-full" style={{ background: "#C026D3" }} />
        <div className="h-5 w-5 rounded-full" style={{ background: "#F472B6" }} />
      </div>
      <div className="grid flex-1 grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-1 p-2" style={{ background: "#FEE2E2" }}>
          <div className="h-5 w-5 rounded-full" style={{ background: "#F87171" }} />
          <div className="h-1 w-8 rounded-full bg-white" />
        </div>
        <div className="flex flex-col items-center justify-center gap-1 p-2" style={{ background: "#DCFCE7" }}>
          <div className="h-5 w-5 rounded-full" style={{ background: "#34D399" }} />
          <div className="h-1 w-8 rounded-full bg-white" />
        </div>
      </div>
      <div className="flex items-center justify-center py-2" style={{ background: "#EFF6FF" }}>
        <div className="h-4 w-16 rounded-full" style={{ background: "#60A5FA" }} />
      </div>
    </div>
  ),

  "Dark & dramatic": (
    <div className="relative flex h-full w-full flex-col" style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="h-1.5 w-8 rounded bg-white opacity-70" />
        <div className="flex gap-1.5">
          <div className="h-1 w-4 rounded bg-white opacity-30" />
          <div className="h-1 w-4 rounded bg-white opacity-30" />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 px-3">
        <div className="h-3 w-18 rounded-sm bg-white opacity-90" />
        <div className="h-1.5 w-20 rounded-sm bg-white opacity-30" />
        <div className="h-1.5 w-14 rounded-sm bg-white opacity-30" />
        <div className="mt-1 h-5 w-12 rounded-sm" style={{ background: "#e94560" }} />
      </div>
      <div className="h-0.5 w-full" style={{ background: "#e94560" }} />
    </div>
  ),

  "Corporate & trustworthy": (
    <div className="flex h-full w-full flex-col" style={{ background: "#1e3a5f" }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ background: "#15294a" }}>
        <div className="h-2 w-10 rounded-sm bg-white opacity-90" />
        <div className="flex gap-1.5">
          <div className="h-1 w-5 rounded-sm bg-white opacity-40" />
          <div className="h-1 w-5 rounded-sm bg-white opacity-40" />
          <div className="h-4 w-7 rounded-sm bg-white opacity-90" />
        </div>
      </div>
      <div className="flex flex-1 gap-2 p-3">
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          <div className="h-2 w-full rounded-sm bg-white opacity-80" />
          <div className="h-1.5 w-4/5 rounded-sm bg-white opacity-40" />
          <div className="h-1.5 w-3/5 rounded-sm bg-white opacity-40" />
          <div className="mt-1 h-4 w-12 rounded-sm bg-white opacity-90" />
        </div>
        <div className="w-12 rounded-sm" style={{ background: "rgba(255,255,255,0.1)" }} />
      </div>
    </div>
  ),

  "Retro/Vintage": (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ background: "#fdf6e3" }}>
      <div className="flex w-4/5 flex-col items-center gap-1.5 rounded border-2 px-3 py-2.5" style={{ borderColor: "#8b7355" }}>
        <div className="h-px w-full" style={{ background: "#8b7355" }} />
        <div className="h-2 w-16 rounded-sm" style={{ background: "#8b7355" }} />
        <div className="h-1 w-12 rounded-sm" style={{ background: "#c9a96e" }} />
        <div className="h-1 w-14 rounded-sm" style={{ background: "#c9a96e" }} />
        <div className="h-px w-full" style={{ background: "#8b7355" }} />
        <div className="h-4 w-12 rounded-sm border" style={{ borderColor: "#8b7355", background: "#f5e6c8" }} />
      </div>
    </div>
  ),

  "Editorial/Magazine": (
    <div className="flex h-full w-full">
      <div className="flex w-2/5 flex-col justify-end bg-black p-2">
        <div className="mb-1 h-2 w-full rounded-sm bg-white opacity-90" />
        <div className="h-1 w-4/5 rounded-sm bg-white opacity-50" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 bg-white p-2">
        <div className="h-px w-full bg-black" />
        <div className="h-1.5 w-full rounded-sm bg-neutral-800" />
        <div className="h-1 w-4/5 rounded-sm bg-neutral-300" />
        <div className="h-1 w-full rounded-sm bg-neutral-200" />
        <div className="h-1 w-3/4 rounded-sm bg-neutral-200" />
        <div className="h-px w-full bg-neutral-300" />
        <div className="h-1 w-full rounded-sm bg-neutral-200" />
        <div className="h-1 w-2/3 rounded-sm bg-neutral-200" />
      </div>
    </div>
  ),

  "Futuristic/Tech": (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "#030712" }}>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />
      <div className="relative flex h-full flex-col px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-8 rounded-sm" style={{ background: "#06b6d4" }} />
          <div className="flex gap-1">
            <div className="h-1 w-4 rounded-sm bg-white opacity-30" />
            <div className="h-1 w-4 rounded-sm bg-white opacity-30" />
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2">
          <div className="h-2.5 w-20 rounded-sm bg-white opacity-90" />
          <div className="h-1.5 w-16 rounded-sm bg-white opacity-30" />
          <div className="mt-1 h-5 w-12 rounded-sm border" style={{ borderColor: "#06b6d4" }}>
            <div className="h-full w-full opacity-20" style={{ background: "#06b6d4" }} />
          </div>
        </div>
        <div className="h-px w-full" style={{ background: "#06b6d4" }} />
      </div>
    </div>
  ),
};
