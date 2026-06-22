import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect("/en/auth/signin");

  const t = await getTranslations("settings");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">{t("title")}</h1>
      <ProfileForm
        name={session.user.name ?? ""}
        email={session.user.email ?? ""}
      />
    </main>
  );
}
