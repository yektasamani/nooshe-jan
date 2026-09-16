"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { resolveEaterIds } from "@/lib/eaters";

export type CreateDishState = {
  error?: string;
};

export async function createDish(
  _prevState: CreateDishState,
  formData: FormData,
): Promise<CreateDishState> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const regionId = String(formData.get("regionId") ?? "");
  const cuisineName = String(formData.get("cuisineName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const recipeUrl = String(formData.get("recipeUrl") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const visibility = formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";
  const cookDateRaw = String(formData.get("cookDate") ?? "");
  const wantToTryId = String(formData.get("wantToTryId") ?? "").trim() || null;
  const eatSelf = formData.get("eatSelf") === "on";
  const submittedEaterIds = formData.getAll("eaterIds").map(String);
  const photo = formData.get("photo") as File | null;

  if (!name) return { error: "Give the dish a name." };
  if (!regionId) return { error: "Pick a cuisine region." };
  if (!photo || photo.size === 0) return { error: "Add a photo." };

  const myPodIds = (
    await prisma.podMember.findMany({ where: { userId: authUser.id, status: "active" }, select: { podId: true } })
  ).map((m) => m.podId);

  // "Who ate it" (spec §1) — defaults to [me], editable to include anyone
  // sharing a pod with the maker.
  const eaterIds = await resolveEaterIds(authUser.id, myPodIds, eatSelf, submittedEaterIds);

  // Resolve/create the cuisine — search-or-create, always nested under the
  // chosen top-level region (spec §1/§4). If no specific cuisine name was
  // typed, the dish is just tagged with the region itself.
  let cuisineId = regionId;
  if (cuisineName) {
    const existing = await prisma.cuisine.findFirst({
      where: { name: { equals: cuisineName, mode: "insensitive" }, parentId: regionId },
    });
    cuisineId = existing
      ? existing.id
      : (await prisma.cuisine.create({ data: { name: cuisineName, parentId: regionId } })).id;
  }

  // Upload the photo to the dish-photos bucket (docs/INFRA_SETUP.md §6).
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_DISH_PHOTOS_BUCKET!;
  const ext = photo.name.split(".").pop() || "jpg";
  const path = `${authUser.id}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, photo);
  if (uploadError) {
    return { error: `Photo upload failed: ${uploadError.message}` };
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  // Tags — freeform, comma-separated, search-or-create (spec §1).
  const tagNames = [...new Set(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))];
  const tagIds: string[] = [];
  for (const tagName of tagNames) {
    const existing = await prisma.tag.findFirst({
      where: { name: { equals: tagName, mode: "insensitive" } },
    });
    const tag = existing ?? (await prisma.tag.create({ data: { name: tagName } }));
    tagIds.push(tag.id);
  }

  const dish = await prisma.dish.create({
    data: {
      name,
      photoUrl: publicUrl,
      cuisineId,
      makerId: authUser.id,
      notes,
      recipeUrl,
      visibility,
      cookDate: cookDateRaw ? new Date(cookDateRaw) : null,
      eaters: { create: eaterIds.map((userId) => ({ userId })) },
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });

  // Converting a want-to-try into this dish (spec §1) — allowed if this
  // user added it, or it's tagged to one of their pods (anyone in the pod
  // might be the one who actually cooks it). Silently ignore otherwise
  // rather than fail the whole dish creation over a stale/tampered id.
  if (wantToTryId) {
    await prisma.wantToTry.updateMany({
      where: {
        id: wantToTryId,
        convertedToDishId: null,
        OR: [{ addedById: authUser.id }, { podId: { in: myPodIds } }],
      },
      data: { convertedToDishId: dish.id },
    });
  }

  // Every dish gets a tier picked first (liked/okay/disliked), then — if
  // the user already has other dishes in that tier — the pairwise
  // comparison flow. See /dishes/[dishId]/rank.
  redirect(`/dishes/${dish.id}/rank`);
}
