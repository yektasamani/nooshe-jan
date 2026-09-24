import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl text-sage-900">Settings</h1>
      <SettingsForm
        currentName={user.name}
        avatarUrl={user.avatarUrl}
        privateByDefault={user.privateByDefault}
      />
    </main>
  );
}
