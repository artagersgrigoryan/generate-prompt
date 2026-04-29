"use client";

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  isWriteItMyself?: boolean;
}

export function OptionButton({
  label,
  selected,
  onSelect,
  isWriteItMyself = false,
}: OptionButtonProps) {
  if (isWriteItMyself) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
          selected
            ? "border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-200"
            : "border-dashed border-neutral-300 bg-white text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:border-neutral-500 dark:hover:text-neutral-300"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
        selected
          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
      }`}
    >
      {label}
    </button>
  );
}
