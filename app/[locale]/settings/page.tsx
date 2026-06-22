import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/en/auth/signin");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <ProfileForm
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
      />
    </main>
  );
}
