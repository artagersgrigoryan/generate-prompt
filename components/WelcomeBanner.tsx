"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function WelcomeBanner({ name }: { name?: string | null }) {
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("welcome") === "1";
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("auth");

  useEffect(() => {
    if (!showWelcome) return;
    window.history.replaceState({}, "", window.location.pathname);
    setMounted(true);
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setVisible(false), 2500);
    const t3 = setTimeout(() => setMounted(false), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [showWelcome]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed right-4 top-20 z-50 flex items-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 shadow-lg transition-all duration-500 dark:border-green-900 dark:bg-neutral-900 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {name ? t("welcomeTitle", { name }) : t("welcomeSubtitle")}
        </p>
        {name && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t("welcomeSubtitle")}
          </p>
        )}
      </div>
    </div>
  );
}
