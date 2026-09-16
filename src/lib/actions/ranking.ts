"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { RatingTier } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { bandStartPosition, buildComparisonPool, insertRatingAndRescore } from "@/lib/ranking";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

async function loadUnrankedDish(userId: string, dishId: string) {
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: { cuisine: true },
  });
  if (!dish || dish.makerId !== userId) redirect("/");
  const existingRating = await prisma.rating.findUnique({ where: { userId_dishId: { userId, dishId } } });
  if (existingRating) redirect("/"); // already ranked, nothing left to do
  return dish;
}

function isRatingTier(value: string): value is RatingTier {
  return value === "LIKED" || value === "OKAY" || value === "DISLIKED";
}

/** First step after logging a dish: pick a broad sentiment (Beli-style,
 * not in the original spec — added per product decision). If the user has
 * no other dishes in that tier yet, there's nothing to compare against —
 * place it at the tier's band boundary immediately. Otherwise kick off
 * the pairwise comparison flow, scoped to that tier. */
export async function selectTier(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const dishId = String(formData.get("dishId"));
  const tierRaw = String(formData.get("tier"));
  if (!isRatingTier(tierRaw)) redirect(`/dishes/${dishId}/rank`);
  const tier = tierRaw as RatingTier;

  const dish = await loadUnrankedDish(userId, dishId);
  const pool = await buildComparisonPool(userId, dish, tier);

  if (pool.length === 0) {
    const position = await bandStartPosition(userId, tier);
    await insertRatingAndRescore(userId, dishId, position, tier);
    revalidatePath("/");
    redirect("/");
  }

  redirect(`/dishes/${dishId}/rank?tier=${tier}&lo=0&hi=${pool.length}`);
}

/** Records the answer to one "which did you like more" round, then either
 * moves to the next comparison or — once lo===hi — finalizes the new
 * dish's position and score (spec §3). */
export async function recordComparison(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const dishId = String(formData.get("dishId"));
  const tierRaw = String(formData.get("tier"));
  const lo = Number(formData.get("lo"));
  const hi = Number(formData.get("hi"));
  const opponentDishId = String(formData.get("opponentDishId"));
  const winner = String(formData.get("winner")); // "new" | "opponent"

  if (!isRatingTier(tierRaw)) redirect(`/dishes/${dishId}/rank`);
  const tier = tierRaw as RatingTier;

  const dish = await loadUnrankedDish(userId, dishId);
  const pool = await buildComparisonPool(userId, dish, tier);
  const mid = Math.floor((lo + hi) / 2);
  const opponent = pool[mid];

  if (!opponent || opponent.dishId !== opponentDishId) {
    // Pool shifted under us (shouldn't normally happen) — bail to home
    // rather than record a comparison against the wrong dish.
    redirect("/");
  }

  await prisma.pairwiseComparison.create({
    data: {
      userId,
      dishAId: dishId,
      dishBId: opponent.dishId,
      winnerId: winner === "new" ? dishId : opponent.dishId,
    },
  });

  const nextLo = winner === "new" ? lo : mid + 1;
  const nextHi = winner === "new" ? mid : hi;

  if (nextLo < nextHi) {
    redirect(`/dishes/${dishId}/rank?tier=${tier}&lo=${nextLo}&hi=${nextHi}`);
  }

  const position =
    nextLo < pool.length ? pool[nextLo].position : pool.length === 0 ? 0 : pool[pool.length - 1].position + 1;
  await insertRatingAndRescore(userId, dishId, position, tier);
  revalidatePath("/");
  redirect("/");
}
