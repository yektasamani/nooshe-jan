"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { uploadDishPhoto } from "@/lib/dish-fields";

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
    const uploaded = await uploadDishPhoto(supabase, authUser.id, photo);
    if (!("error" in uploaded)) photoUrl = uploaded.url;
  }

  await prisma.wantToTry.create({
    data: { name, link, photoUrl, podId, addedById: authUser.id },
  });

  redirect("/want-to-try");
}

/** Editing an idea — adder-only. Distinct from converting it to a dish
 * (spec §1), which stays open to any pod member since "who cooked it" is
 * a different question from "whose idea/details these are." */
export async function updateWantToTry(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const existing = await prisma.wantToTry.findUnique({ where: { id } });
  if (!existing || existing.addedById !== authUser.id) redirect("/want-to-try");

  const name = String(formData.get("name") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim() || null;
  const podId = String(formData.get("podId") ?? "").trim() || null;
  const photo = formData.get("photo") as File | null;

  if (!name) redirect(`/want-to-try/${id}/edit`);

  if (podId) {
    const membership = await prisma.podMember.findUnique({
      where: { podId_userId: { podId, userId: authUser.id } },
    });
    if (!membership) redirect(`/want-to-try/${id}/edit`);
  }

  let photoUrl = existing.photoUrl;
  if (photo && photo.size > 0) {
    const uploaded = await uploadDishPhoto(supabase, authUser.id, photo);
    if (!("error" in uploaded)) photoUrl = uploaded.url;
  }

  await prisma.wantToTry.update({
    where: { id },
    data: { name, link, podId, photoUrl },
  });

  revalidatePath("/want-to-try");
  revalidatePath("/");
  redirect("/want-to-try");
}

/** Deleting an idea — adder-only. */
export async function deleteWantToTry(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const existing = await prisma.wantToTry.findUnique({ where: { id } });
  if (!existing || existing.addedById !== authUser.id) redirect("/want-to-try");

  await prisma.wantToTry.delete({ where: { id } });

  revalidatePath("/want-to-try");
  revalidatePath("/");
  redirect("/want-to-try");
}
