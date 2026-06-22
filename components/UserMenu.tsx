"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function UserMenu() {
  const { data: session } = useSession();
  const t = useTranslations("auth");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0].toUpperCase() ?? "?");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 transition-opacity hover:opacity-80 dark:bg-neutral-700 dark:text-neutral-200"
        aria-label="User menu"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-100 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
            <p className="truncate text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {user.name ?? user.email}
            </p>
            {user.name && (
              <p className="truncate text-xs text-neutral-400">{user.email}</p>
            )}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {t("dashboard")}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {t("settings")}
          </Link>
          <div className="border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
