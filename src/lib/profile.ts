import { prisma } from "@/lib/prisma";
import { aggregateScores } from "@/lib/ranking";

/** Signature dish / top dishes (spec §2.3): computed live from the
 * profile owner's own personal rank, filtered to dishes they made
 * themselves — not a separately stored list.
 *
 * `viewerId` gates visibility: the owner sees everything (including
 * private dishes); anyone else only sees PUBLIC ones — this is what
 * makes profiles safe to open up to other users (spec §5's "public layer
 * beyond pods" question, resolved here as: profiles are viewable, but
 * private stays private regardless of who's looking). */
export async function getSignatureDishes(profileUserId: string, viewerId: string, take = 5) {
  const isSelf = viewerId === profileUserId;
  return prisma.rating.findMany({
    where: {
      userId: profileUserId,
      dish: { makerId: profileUserId, ...(isSelf ? {} : { visibility: "PUBLIC" }) },
    },
    include: { dish: { include: { cuisine: true } } },
    orderBy: { position: "asc" },
    take,
  });
}

/**
 * "My dishes, ranked by crowd score" (spec §2.3/§3): every dish this user
 * made, aggregated across every rating anyone (including them) has given
 * it — separate from their personal rank, which only reflects their own
 * opinion. Same visibility gating as getSignatureDishes.
 */
export async function getCrowdScoredDishes(profileUserId: string, viewerId: string) {
  const isSelf = viewerId === profileUserId;
  const dishes = await prisma.dish.findMany({
    where: { makerId: profileUserId, ...(isSelf ? {} : { visibility: "PUBLIC" }) },
    include: { cuisine: true, ratings: { include: { user: true } } },
  });

  const withAggregates = dishes.map((dish) => {
    const { avg, spread } = aggregateScores(dish.ratings.map((r) => r.score));
    return { dish, avg, spread, perPerson: dish.ratings };
  });

  withAggregates.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  return withAggregates;
}
