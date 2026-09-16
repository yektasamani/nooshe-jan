"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** The global "make my dishes private by default" toggle (spec §1 User /
 * §4). Forward-only, as spec'd — it only affects dishes logged from now
 * on. Whether to also offer a separate, explicit "make my past dishes
 * private too" action is listed as still-open in spec §5; not built. */
export async function updatePrivacyDefault(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const privateByDefault = formData.get("privateByDefault") === "on";
  await prisma.user.update({ where: { id: user.id }, data: { privateByDefault } });

  revalidatePath("/profile");
  redirect("/profile");
}
