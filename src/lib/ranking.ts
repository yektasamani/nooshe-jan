import { prisma } from "@/lib/prisma";
import type { Cuisine, RatingTier } from "@prisma/client";

/**
 * Insertion-sort ranking (spec §3, extended) — cuisine-anchored, not Elo.
 * Scores are personal per user, derived from list position, not entered
 * directly.
 *
 * Tiers (LIKED / OKAY / DISLIKED) are a Beli-style addition on top of the
 * original spec: picked once right after logging a dish, before any
 * pairwise comparisons. They form fixed, contiguous bands in the personal
 * rank — every LIKED dish outranks every OKAY dish, which outranks every
 * DISLIKED dish — and comparisons only ever happen *within* the chosen
 * tier, so a new dish never gets pitted against something in a totally
 * different sentiment bucket.
 *
 * Simplification from the spec worth calling out: §3 describes a two-phase
 * search (binary-search the cuisine-filtered subset first, then use that to
 * seed a *second*, narrower binary search across the full list). We do a
 * single binary search over one pool instead — same-cuisine dishes if any
 * exist (within the tier), else same-region, else the whole tier. Fewer
 * comparisons to build, same "cuisine-anchored, few comparisons" spirit,
 * just without the two-pass refinement. Revisit if the single-pass result
 * feels wrong in practice.
 */

export type PoolEntry = {
  ratingId: string;
  dishId: string;
  dishName: string;
  photoUrl: string;
  position: number;
};

// Fixed band order, best to worst.
const TIER_ORDER: RatingTier[] = ["LIKED", "OKAY", "DISLIKED"];

/** A top-level region's own id, whether `cuisine` *is* a region or nests under one. */
function regionIdOf(cuisine: Pick<Cuisine, "id" | "parentId">) {
  return cuisine.parentId ?? cuisine.id;
}

/**
 * The ordered set of the user's already-ranked, same-tier dishes to
 * binary-search against for placing `newDish`. See module doc for the
 * single-pass simplification vs. spec §3's two-phase version.
 */
export async function buildComparisonPool(
  userId: string,
  newDish: { id: string; cuisineId: string; cuisine: Pick<Cuisine, "id" | "parentId"> },
  tier: RatingTier,
): Promise<PoolEntry[]> {
  const toPoolEntries = (
    ratings: { id: string; position: number; dish: { id: string; name: string; photoUrl: string } }[],
  ): PoolEntry[] =>
    ratings.map((r) => ({
      ratingId: r.id,
      dishId: r.dish.id,
      dishName: r.dish.name,
      photoUrl: r.dish.photoUrl,
      position: r.position,
    }));

  const sameCuisine = await prisma.rating.findMany({
    where: { userId, tier, dish: { cuisineId: newDish.cuisineId, id: { not: newDish.id } } },
    include: { dish: true },
    orderBy: { position: "asc" },
  });
  if (sameCuisine.length > 0) return toPoolEntries(sameCuisine);

  const regionId = regionIdOf(newDish.cuisine);
  const sameRegion = await prisma.rating.findMany({
    where: {
      userId,
      tier,
      dish: { id: { not: newDish.id }, cuisine: { OR: [{ id: regionId }, { parentId: regionId }] } },
    },
    include: { dish: true },
    orderBy: { position: "asc" },
  });
  if (sameRegion.length > 0) return toPoolEntries(sameRegion);

  const wholeTier = await prisma.rating.findMany({
    where: { userId, tier, dishId: { not: newDish.id } },
    include: { dish: true },
    orderBy: { position: "asc" },
  });
  return toPoolEntries(wholeTier);
}

/** Where a tier's band starts when the user has nothing else in that tier
 * yet — the count of all ratings in earlier (better) tiers. */
export async function bandStartPosition(userId: string, tier: RatingTier): Promise<number> {
  const betterTiers = TIER_ORDER.slice(0, TIER_ORDER.indexOf(tier));
  if (betterTiers.length === 0) return 0;
  return prisma.rating.count({ where: { userId, tier: { in: betterTiers } } });
}

/** Display score (0–10) from 0-indexed position among `total` ranked dishes.
 * Best dish (position 0) → 10.0, worst → 1.0, linear in between. This is
 * the pinned-down answer to spec §3's open "scoring formula" decision —
 * simple percentile mapping, revisit if it feels too linear in practice. */
export function positionToScore(position: number, total: number): number {
  if (total <= 1) return 10;
  const score = 10 - 9 * (position / (total - 1));
  return Math.round(score * 10) / 10;
}

/** Average + spread across a set of individual scores for one dish (spec
 * §3 "crowd score" / pod combined view) — shared by lib/pods.ts and
 * lib/profile.ts so both aggregate the same way. */
export function aggregateScores(scores: number[]): { avg: number | null; spread: number } {
  if (scores.length === 0) return { avg: null, spread: 0 };
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const spread = Math.max(...scores) - Math.min(...scores);
  return { avg, spread };
}

/** Short, warm copy for a spread value (DESIGN.md voice: "Split decision,"
 * "Everyone loved it" — never a bare number as the only signal). Shared by
 * the pod combined view and the profile crowd-score list. */
export function agreementLabel(spread: number, raterCount: number): string {
  if (raterCount <= 1) return "";
  if (spread <= 1) return "Everyone agrees";
  if (spread <= 3) return "Mostly agree";
  return "Split decision";
}

export type Direction = "up" | "down";

/**
 * Re-ranking (spec §3): "default to comparing only against immediate
 * neighbors... only trigger a fuller re-comparison if flagged notably
 * better/worse." We implement this as a local bubble check rather than a
 * separate "flag as different" step: check the neighbor above; if the
 * re-ranked dish beats it, swap and keep checking upward. Once it stops
 * winning upward, check the neighbor below the same way. Neighbors never
 * cross a tier boundary — re-ranking repositions within a tier, it doesn't
 * change the tier itself.
 */
export async function getAdjacentSameTierRating(userId: string, position: number, tier: RatingTier, direction: Direction) {
  const neighborPosition = direction === "up" ? position - 1 : position + 1;
  if (neighborPosition < 0) return null;
  const neighbor = await prisma.rating.findFirst({
    where: { userId, position: neighborPosition },
    include: { dish: true },
  });
  if (!neighbor || neighbor.tier !== tier) return null;
  return neighbor;
}

/** Swap two adjacent ratings' positions and fix up just their two scores
 * (the total count doesn't change, so no one else's score is affected). */
export async function swapAdjacentRatings(ratingAId: string, ratingBId: string) {
  const [a, b] = await Promise.all([
    prisma.rating.findUniqueOrThrow({ where: { id: ratingAId } }),
    prisma.rating.findUniqueOrThrow({ where: { id: ratingBId } }),
  ]);
  const total = await prisma.rating.count({ where: { userId: a.userId } });
  await prisma.$transaction([
    prisma.rating.update({ where: { id: a.id }, data: { position: b.position, score: positionToScore(b.position, total) } }),
    prisma.rating.update({ where: { id: b.id }, data: { position: a.position, score: positionToScore(a.position, total) } }),
  ]);
}

/** Insert a new dish's Rating (with its tier) at `position` for `userId`,
 * shifting everyone else down and recomputing every score (simple +
 * correct; fine at the list sizes an individual's dish log will
 * realistically hit). */
export async function insertRatingAndRescore(
  userId: string,
  dishId: string,
  position: number,
  tier: RatingTier,
) {
  await prisma.$transaction(async (tx) => {
    await tx.rating.updateMany({
      where: { userId, position: { gte: position } },
      data: { position: { increment: 1 } },
    });
    await tx.rating.create({
      data: { userId, dishId, position, tier, score: 0 }, // score fixed up below
    });

    const all = await tx.rating.findMany({ where: { userId }, orderBy: { position: "asc" } });
    for (const rating of all) {
      await tx.rating.update({
        where: { id: rating.id },
        data: { score: positionToScore(rating.position, all.length) },
      });
    }
  });
}
