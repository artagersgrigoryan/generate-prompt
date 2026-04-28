"use client";

import { COLOR_PALETTES, ColorPalette } from "@/lib/palettes";

interface ColorPaletteSelectorProps {
  selected: string;
  onSelect: (description: string) => void;
}

function Swatch({ palette, isSelected, onSelect }: {
  palette: ColorPalette;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={palette.description}
      className={`group flex flex-col gap-1.5 rounded-xl border p-2 transition-all ${
        isSelected
          ? "border-black bg-white shadow-sm"
          : "border-neutral-200 bg-white hover:border-neutral-400"
      }`}
    >
      <div className="flex gap-1">
        {palette.colors.map((c) => (
          <div
            key={c}
            className="h-5 flex-1 rounded-md border border-neutral-200/60"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <span className={`text-center text-xs transition-colors ${
        isSelected ? "font-medium text-neutral-900" : "text-neutral-500 group-hover:text-neutral-700"
      }`}>
        {palette.name}
      </span>
    </button>
  );
}

export function ColorPaletteSelector({ selected, onSelect }: ColorPaletteSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-500">Or pick a palette as a starting point</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {COLOR_PALETTES.map((palette) => (
          <Swatch
            key={palette.name}
            palette={palette}
            isSelected={selected === palette.description}
            onSelect={() =>
              onSelect(selected === palette.description ? "" : palette.description)
            }
          />
        ))}
      </div>
    </div>
  );
}
