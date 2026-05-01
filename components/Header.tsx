"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black transition-opacity group-hover:opacity-80 dark:bg-white">
            <svg className="h-4 w-4 text-white dark:text-black" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2Z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-600 dark:text-neutral-100 dark:group-hover:text-neutral-400">
            {t("brand")}
          </span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            Beta
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
