"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { resolveEaterIds } from "@/lib/eaters";
import { resolveCoMakerIds } from "@/lib/co-makers";
import { resolveCuisineId, resolveTagIds, collectNewPhotos, isOwnedImageUrl } from "@/lib/dish-fields";
import { removeRatingAndRescore } from "@/lib/ranking";

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
  const submittedCoMakerIds = formData.getAll("coMakerIds").map(String);
  const newPhotos = collectNewPhotos(formData);

  if (!name) return { error: "Give the dish a name." };
  if (!regionId) return { error: "Pick a cuisine region." };
  if (newPhotos.length === 0) return { error: "Add a photo." };
  // Photos are uploaded client-side before this ever submits (Vercel's
  // 4.5MB serverless body limit rules out sending the raw file through a
  // Server Action) — double-check every URL actually belongs to this
  // user's own folder in our bucket before trusting it.
  if (newPhotos.some((p) => !isOwnedImageUrl(p.url, authUser.id))) {
    return { error: "One of those photos didn't upload correctly. Try again." };
  }

  const myPodIds = (
    await prisma.podMember.findMany({ where: { userId: authUser.id, status: "active" }, select: { podId: true } })
  ).map((m) => m.podId);

  // "Who ate it" (spec §1) — defaults to [me], editable to include anyone
  // sharing a pod with the maker.
  const eaterIds = await resolveEaterIds(authUser.id, myPodIds, eatSelf, submittedEaterIds);
  // "Cooked with" — co-makers, e.g. a couple cooking together. Each gets
  // to independently rank the dish later (dish detail page's "Rank this
  // dish" CTA), separate from this submitter's own rank happening now.
  const coMakerIds = await resolveCoMakerIds(authUser.id, myPodIds, submittedCoMakerIds);

  const cuisineId = await resolveCuisineId(regionId, cuisineName);
  const tagIds = await resolveTagIds(tagsRaw);

  const dish = await prisma.dish.create({
    data: {
      name,
      // First photo mirrors as the "cover" everywhere a single thumbnail
      // is shown; the full gallery lives on DishPhoto.
      photoUrl: newPhotos[0].url,
      cuisineId,
      makerId: authUser.id,
      notes,
      recipeUrl,
      visibility,
      cookDate: cookDateRaw ? new Date(cookDateRaw) : null,
      eaters: { create: eaterIds.map((userId) => ({ userId })) },
      coMakers: { create: coMakerIds.map((userId) => ({ userId })) },
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
      photos: {
        create: newPhotos.map((p, i) => ({ url: p.url, displayShape: p.shape, position: i })),
      },
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

/** Editing an already-logged dish (maker only). Unlike createDish, this
 * never touches ranking — position/tier/score stay exactly as they are.
 * Photo is optional here (only replaced if a new one's provided); tags
 * and eaters are fully replaced with whatever's submitted, not merged. */
export async function updateDish(
  _prevState: CreateDishState,
  formData: FormData,
): Promise<CreateDishState> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dishId = String(formData.get("dishId") ?? "");
  const existing = await prisma.dish.findUnique({ where: { id: dishId }, include: { photos: true } });
  if (!existing || existing.makerId !== authUser.id) redirect("/");

  const name = String(formData.get("name") ?? "").trim();
  const regionId = String(formData.get("regionId") ?? "");
  const cuisineName = String(formData.get("cuisineName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const recipeUrl = String(formData.get("recipeUrl") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const visibility = formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC";
  const cookDateRaw = String(formData.get("cookDate") ?? "");
  const eatSelf = formData.get("eatSelf") === "on";
  const submittedEaterIds = formData.getAll("eaterIds").map(String);
  const submittedCoMakerIds = formData.getAll("coMakerIds").map(String);
  const removePhotoIds = new Set(formData.getAll("removePhotoIds").map(String));
  const newPhotos = collectNewPhotos(formData);

  if (!name) return { error: "Give the dish a name." };
  if (!regionId) return { error: "Pick a cuisine region." };
  if (newPhotos.some((p) => !isOwnedImageUrl(p.url, authUser.id))) {
    return { error: "One of those photos didn't upload correctly. Try again." };
  }

  const survivingExisting = existing.photos
    .filter((p) => !removePhotoIds.has(p.id))
    .sort((a, b) => a.position - b.position);
  if (survivingExisting.length + newPhotos.length === 0) {
    return { error: "Keep at least one photo." };
  }

  const myPodIds = (
    await prisma.podMember.findMany({ where: { userId: authUser.id, status: "active" }, select: { podId: true } })
  ).map((m) => m.podId);

  const eaterIds = await resolveEaterIds(authUser.id, myPodIds, eatSelf, submittedEaterIds);
  const coMakerIds = await resolveCoMakerIds(authUser.id, myPodIds, submittedCoMakerIds);
  const cuisineId = await resolveCuisineId(regionId, cuisineName);
  const tagIds = await resolveTagIds(tagsRaw);

  const photoUrl = survivingExisting[0]?.url ?? newPhotos[0].url;

  await prisma.$transaction([
    prisma.dish.update({
      where: { id: dishId },
      data: {
        name,
        photoUrl,
        cuisineId,
        notes,
        recipeUrl,
        visibility,
        cookDate: cookDateRaw ? new Date(cookDateRaw) : null,
      },
    }),
    ...(removePhotoIds.size > 0
      ? [prisma.dishPhoto.deleteMany({ where: { id: { in: [...removePhotoIds] } } })]
      : []),
    ...survivingExisting.map((p, i) => {
      const shapeField = formData.get(`photoShape_${p.id}`);
      const shape = shapeField === "ORIGINAL" ? "ORIGINAL" : "SQUARE";
      return prisma.dishPhoto.update({ where: { id: p.id }, data: { position: i, displayShape: shape } });
    }),
    ...newPhotos.map((p, i) =>
      prisma.dishPhoto.create({
        data: { dishId, url: p.url, displayShape: p.shape, position: survivingExisting.length + i },
      }),
    ),
    prisma.dishEater.deleteMany({ where: { dishId } }),
    prisma.dishEater.createMany({ data: eaterIds.map((userId) => ({ dishId, userId })) }),
    prisma.dishCoMaker.deleteMany({ where: { dishId } }),
    prisma.dishCoMaker.createMany({ data: coMakerIds.map((userId) => ({ dishId, userId })) }),
    prisma.dishTag.deleteMany({ where: { dishId } }),
    prisma.dishTag.createMany({ data: tagIds.map((tagId) => ({ dishId, tagId })) }),
  ]);

  revalidatePath(`/dishes/${dishId}`);
  revalidatePath("/");
  redirect(`/dishes/${dishId}`);
}

/** Deleting a dish (maker only). Every rank list that had a Rating on
 * this dish needs its gap closed and scores recomputed afterward — not
 * just the maker's own, since a pod-mate could also have rated it. */
export async function deleteDish(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dishId = String(formData.get("dishId") ?? "");
  const dish = await prisma.dish.findUnique({ where: { id: dishId } });
  if (!dish || dish.makerId !== authUser.id) redirect("/");

  const affectedRatings = await prisma.rating.findMany({
    where: { dishId },
    select: { userId: true, position: true },
  });

  // A dish converted from a want-to-try idea has a NO ACTION (not
  // cascading) foreign key back to it — null the link first so deleting
  // the dish doesn't get rejected. The idea itself survives, just
  // reverts to "not yet converted."
  await prisma.wantToTry.updateMany({
    where: { convertedToDishId: dishId },
    data: { convertedToDishId: null },
  });

  // Ratings/eaters/tags/comparisons on this dish all cascade-delete with it.
  await prisma.dish.delete({ where: { id: dishId } });

  for (const rating of affectedRatings) {
    await removeRatingAndRescore(rating.userId, rating.position);
  }

  revalidatePath("/");
  redirect("/");
}
