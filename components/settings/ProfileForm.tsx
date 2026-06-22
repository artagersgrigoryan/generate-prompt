"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ProfileFormProps {
  name: string;
  email: string;
}

export function ProfileForm({ name: initialName, email }: ProfileFormProps) {
  const t = useTranslations("settings");
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleting, setDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "error">("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteStatus("error");
    }
  }

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title={t("deleteAccount")}
        description={t("deleteAccountConfirm")}
        confirmLabel={t("confirmDeleteLabel")}
        cancelLabel={t("cancel")}
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">{t("profile")}</h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-sm">
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                {t("displayName")}
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full rounded-md border px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? t("saving") : t("saveChanges")}
              </button>
              {status === "saved" && <span className="text-sm text-green-600">{t("saved")}</span>}
              {status === "error" && <span className="text-sm text-red-600">{t("saveError")}</span>}
            </div>
            <p className="text-sm text-neutral-500">{email}</p>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">{t("dangerZone")}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            {t("deleteAccountDesc")}
          </p>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {t("deleteAccount")}
          </button>
          {deleteStatus === "error" && (
            <p className="mt-2 text-sm text-red-600">{t("deleteError")}</p>
          )}
        </section>
      </div>
    </>
  );
}
