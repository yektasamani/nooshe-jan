"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isOwnedImageUrl } from "@/lib/dish-fields";

export type SettingsState = {
  error?: string;
  success?: boolean;
};

/** Account settings: display name, avatar photo, and the global "make my
 * dishes private by default" toggle (spec §1 User / §4). Privacy is
 * forward-only, as spec'd — it only affects dishes logged from now on.
 * Whether to also offer a separate, explicit "make my past dishes private
 * too" action is listed as still-open in spec §5; not built. */
export async function updateSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name can't be empty." };

  const privateByDefault = formData.get("privateByDefault") === "on";
  // Uploaded client-side before this ever submits (Vercel's 4.5MB
  // serverless body limit rules out sending the raw file through a
  // Server Action) — double-check it actually belongs to this user
  // before trusting it.
  const submittedAvatarUrl = String(formData.get("avatar") ?? "").trim();
  const avatarUrl =
    submittedAvatarUrl && isOwnedImageUrl(submittedAvatarUrl, user.id) ? submittedAvatarUrl : undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: { name, privateByDefault, ...(avatarUrl ? { avatarUrl } : {}) },
  });

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath(`/users/${user.id}`);
  return { success: true };
}
