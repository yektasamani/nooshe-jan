"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Log an idea before it's ever been cooked (spec §1 Want-to-try) — no
 * ranking involved, nothing to rank until it's actually made. */
export async function createWantToTry(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim() || null;
  const podId = String(formData.get("podId") ?? "").trim() || null;
  const photo = formData.get("photo") as File | null;

  if (!name) redirect("/want-to-try/new");

  // A want-to-try can optionally be pod-tagged, but only to a pod the
  // adder is actually in.
  if (podId) {
    const membership = await prisma.podMember.findUnique({
      where: { podId_userId: { podId, userId: authUser.id } },
    });
    if (!membership) redirect("/want-to-try/new");
  }

  let photoUrl: string | null = null;
  if (photo && photo.size > 0) {
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_DISH_PHOTOS_BUCKET!;
    const ext = photo.name.split(".").pop() || "jpg";
    const path = `${authUser.id}/want-to-try/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, photo);
    if (!uploadError) {
      photoUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }
  }

  await prisma.wantToTry.create({
    data: { name, link, photoUrl, podId, addedById: authUser.id },
  });

  redirect("/want-to-try");
}
