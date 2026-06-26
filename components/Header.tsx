"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown } from "lucide-react";
import { getToolIcon } from "@/lib/toolIcons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import type { ToolPublicConfig } from "@/lib/tools/types";

const NAV_ITEMS = [
  { key: "howItWorks", href: "/#how-it-works" },
  { key: "faq", href: "/#faq" },
] as const;

function ToolMegaItem({ tool }: { tool: ToolPublicConfig }) {
  const Icon = getToolIcon(tool.slug);
  return (
    <NavigationMenu.Link asChild>
      <Link
        href={`/tools/${tool.slug}`}
        className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span>
          <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">{tool.name}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-1">{tool.description}</span>
        </span>
      </Link>
    </NavigationMenu.Link>
  );
}

export function Header({ tools = [] }: { tools?: ToolPublicConfig[] }) {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    const el = document.getElementById(hash);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  const linkCn = cn(
    "text-sm transition-colors",
    isScrolled
      ? "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
  );

  return (
    <header className="fixed z-40 w-full">
      <nav
        data-state={menuOpen ? "active" : undefined}
        className="group relative z-10 w-full px-2 pt-2"
      >
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

          {/* Desktop nav */}
          <NavigationMenu.Root className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <NavigationMenu.List className="flex items-center gap-1">
              {tools.length > 0 && (
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger
                    className={cn(
                      linkCn,
                      "flex items-center gap-1 rounded-lg px-3 py-2 outline-none data-[state=open]:text-neutral-900 dark:data-[state=open]:text-neutral-100"
                    )}
                  >
                    {t("tools")}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 [[data-state=open]_&]:rotate-180" />
                  </NavigationMenu.Trigger>

                  <NavigationMenu.Content className="absolute left-1/2 mt-2 w-[680px] -translate-x-1/2 overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95">
                    <div className="grid grid-cols-2 gap-1 p-3">
                      {tools.map((tool) => (
                        <ToolMegaItem key={tool.slug} tool={tool} />
                      ))}
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              )}

              {NAV_ITEMS.map((item) => {
                const hash = item.href.split("#")[1];
                return (
                  <NavigationMenu.Item key={item.key}>
                    <a
                      href={`/${locale}#${hash}`}
                      onClick={(e) => handleAnchorClick(e, hash)}
                      className={cn(linkCn, "rounded-lg px-3 py-2 block")}
                    >
                      {t(item.key)}
                    </a>
                  </NavigationMenu.Item>
                );
              })}

              <NavigationMenu.Item>
                <NavigationMenu.Link asChild>
                  <Link href="/blog" className={cn(linkCn, "rounded-lg px-3 py-2 block")}>
                    {t("blog")}
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            </NavigationMenu.List>

            <NavigationMenu.Viewport className="absolute left-1/2 top-full -translate-x-1/2" />
          </NavigationMenu.Root>

          {/* Right controls */}
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

      </nav>

      {/* Mobile drawer backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-[1] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Mobile drawer — slides in from right; header (z-40) floats above it */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[2] flex w-72 flex-col lg:hidden",
          "border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950",
          "transition-transform duration-300 ease-in-out",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Spacer so content clears the fixed header */}
        <div className="shrink-0 h-16" />

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <div className="flex flex-col gap-0.5 pt-3">
            {tools.length > 0 && (
              <>
                <button
                  onClick={() => setToolsOpen((o) => !o)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  {t("tools")}
                  <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", toolsOpen && "rotate-180")} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  toolsOpen ? "max-h-[600px]" : "max-h-0"
                )}>
                  <div className="flex flex-col gap-0.5 pb-1 pt-0.5">
                    {tools.map((tool) => {
                      const Icon = getToolIcon(tool.slug);
                      return (
                        <Link key={tool.slug} href={`/tools/${tool.slug}`}
                          onClick={() => { setMenuOpen(false); setToolsOpen(false); }}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                          <span className="text-neutral-700 dark:text-neutral-300">{tool.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {NAV_ITEMS.map((item) => {
              const hash = item.href.split("#")[1];
              return (
                <a
                  key={item.key}
                  href={`/${locale}#${hash}`}
                  onClick={(e) => { handleAnchorClick(e, hash); setMenuOpen(false); }}
                  className="rounded-lg px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  {t(item.key)}
                </a>
              );
            })}
            <Link href="/blog" onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100">
              {t("blog")}
            </Link>

            {!session && (
              <Link href="/auth/signin" onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:hidden">
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
