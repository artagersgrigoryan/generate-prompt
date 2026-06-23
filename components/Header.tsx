"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "howItWorks", href: "/#how-it-works" },
  { key: "examples", href: "/#examples" },
  { key: "faq", href: "/#faq" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed z-40 w-full">
      <nav
        data-state={menuOpen ? "active" : undefined}
        className="group w-full px-2 pt-2"
      >
        {/* Container: transparent → glass pill on scroll */}
        <div
          className={cn(
            "mx-auto flex items-center justify-between transition-all duration-300",
            isScrolled
              ? "max-w-4xl rounded-2xl border border-neutral-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80"
              : "max-w-6xl px-4 py-3"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group/logo">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black transition-opacity group-hover/logo:opacity-80 dark:bg-white">
              <svg className="h-4 w-4 text-white dark:text-black" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2Z" />
              </svg>
            </div>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              Beta
            </span>
          </Link>

          {/* Desktop center nav — absolute trick inside the container */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className={cn(
                    "text-sm transition-colors",
                    isScrolled
                      ? "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                  )}
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>

          {/* Right: controls + auth */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />

            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
            ) : session ? (
              <UserMenu />
            ) : (
              <Link
                href="/auth/signin"
                className={cn(
                  "hidden rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:block",
                  isScrolled
                    ? "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                )}
              >
                {t("signIn")}
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative -mr-1 p-2 text-neutral-700 transition-colors lg:hidden dark:text-neutral-300"
            >
              <Menu className={cn("size-5 transition-all duration-200", menuOpen && "rotate-90 scale-0 opacity-0")} />
              <X className={cn("absolute inset-0 m-auto size-5 transition-all duration-200", menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} />
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className={cn(
            "mx-auto overflow-hidden transition-all duration-300 lg:hidden",
            isScrolled ? "max-w-4xl" : "max-w-6xl",
            menuOpen ? "max-h-64" : "max-h-0"
          )}
        >
          <div
            className={cn(
              "mx-2 mb-2 flex flex-col gap-1 rounded-2xl border p-4",
              "border-neutral-200 bg-white/90 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/90"
            )}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                {t(item.key)}
              </a>
            ))}
            {!session && (
              <Link
                href="/auth/signin"
                onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:hidden"
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
