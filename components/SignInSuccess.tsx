"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function SignInSuccess({ name, locale }: { name?: string | null; locale: string }) {
  const router = useRouter();
  const t = useTranslations("auth");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/${locale}/dashboard`);
    }, 2800);
    return () => clearTimeout(timer);
  }, [locale, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-7 text-center"
    >
      {/* Star + radial glow pulse */}
      <div className="relative flex items-center justify-center">
        {/* Light-mode glow (dark) — hidden in dark mode */}
        <motion.div
          className="absolute rounded-full dark:hidden"
          style={{ width: 48, height: 48 }}
          initial={{ boxShadow: "0 0 0 0 rgba(0,0,0,0.18)" }}
          animate={{ boxShadow: "0 0 60px 32px rgba(0,0,0,0)" }}
          transition={{ delay: 0.45, duration: 0.8, ease: "easeOut" }}
        />
        {/* Dark-mode glow (white) — hidden in light mode */}
        <motion.div
          className="absolute hidden rounded-full dark:block"
          style={{ width: 48, height: 48 }}
          initial={{ boxShadow: "0 0 0 0 rgba(255,255,255,0.35)" }}
          animate={{ boxShadow: "0 0 60px 32px rgba(255,255,255,0)" }}
          transition={{ delay: 0.45, duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-12 w-12 text-neutral-900 dark:text-white">
            <path d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2Z" />
          </svg>
        </motion.div>
      </div>

      {/* Welcome text */}
      <div className="space-y-1.5">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-lg font-semibold text-neutral-900 dark:text-white"
        >
          {name ? t("welcomeTitle", { name }) : t("welcomeSubtitle")}
        </motion.p>
        {name && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="text-sm text-neutral-500 dark:text-neutral-400"
          >
            {t("welcomeSubtitle")}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
