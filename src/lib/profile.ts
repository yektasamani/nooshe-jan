import { prisma } from "@/lib/prisma";
import { aggregateScores } from "@/lib/ranking";

/** Signature dish / top dishes (spec §2.3): computed live from the
 * owner's own personal rank, filtered to dishes they made themselves —
 * not a separately stored list. */
export async function getSignatureDishes(userId: string, take = 5) {
  return prisma.rating.findMany({
    where: { userId, dish: { makerId: userId } },
    include: { dish: { include: { cuisine: true } } },
    orderBy: { position: "asc" },
    take,
  });
}

/**
 * "My dishes, ranked by crowd score" (spec §2.3/§3): every dish this user
 * made, aggregated across every rating anyone (including them) has given
 * it — separate from their personal rank, which only reflects their own
 * opinion.
 *
 * This only ever serves the owner viewing their own profile, so there's
 * no visibility filtering here — spec §3's "respect visibility... private
 * dishes shouldn't appear in another viewer's aggregate view" would apply
 * if/when a *different* user's profile becomes viewable; not built yet.
 */
export async function getCrowdScoredDishes(userId: string) {
  const dishes = await prisma.dish.findMany({
    where: { makerId: userId },
    include: { cuisine: true, ratings: { include: { user: true } } },
  });

  const withAggregates = dishes.map((dish) => {
    const { avg, spread } = aggregateScores(dish.ratings.map((r) => r.score));
    return { dish, avg, spread, perPerson: dish.ratings };
  });

  withAggregates.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  return withAggregates;
}
