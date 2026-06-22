"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface ProfileFormProps {
  name: string;
  email: string;
}

export function ProfileForm({ name: initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!confirm("This will permanently delete your account and all your prompts. Are you sure?")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleting(false);
      alert("Failed to delete account. Please try again.");
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4 max-w-sm">
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium mb-1">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {status === "saved" && <span className="text-sm text-green-600">Saved!</span>}
            {status === "error" && <span className="text-sm text-red-600">Failed to save. Try again.</span>}
          </div>
          <p className="text-sm text-neutral-500">{email}</p>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Danger zone</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          This will permanently delete your account and all your prompts.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete account"}
        </button>
      </section>
    </div>
  );
}
