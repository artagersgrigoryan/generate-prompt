"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const t = useTranslations("settings");
  const [name, setName] = useState(session?.user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!session) return null;

  async function handleNameUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await update({ name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm(t("deleteAccountConfirm"))) return;
    setDeleting(true);
    const res = await fetch("/api/user", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="max-w-lg space-y-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>

        {/* Profile */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("profile")}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-lg font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()
              )}
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {session.user.name ?? session.user.email}
              </p>
              <p className="text-sm text-neutral-500">{session.user.email}</p>
            </div>
          </div>

          <form onSubmit={handleNameUpdate} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("displayName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {saved ? t("saved") : saving ? t("saving") : t("saveChanges")}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="space-y-3 rounded-xl border border-red-100 p-5 dark:border-red-900/30">
          <h2 className="text-sm font-medium text-red-700 dark:text-red-400">
            {t("dangerZone")}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("deleteAccountDesc")}
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            {deleting ? t("deleting") : t("deleteAccount")}
          </button>
        </section>
      </div>
    </div>
  );
}
