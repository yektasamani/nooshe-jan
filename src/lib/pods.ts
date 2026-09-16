import { prisma } from "@/lib/prisma";
import { aggregateScores } from "@/lib/ranking";

/**
 * A pod's combined ranked view (spec §1 Pod / §2 "Pod home"): every dish
 * any active member made, that's either public or made by the viewer
 * themself (visibility is per-dish, not implied by pod membership — spec
 * §1: "joining a pod does not auto-expose a member's full history").
 * Scored by averaging whichever pod members have their own personal
 * Rating for that dish, plus a spread indicator so disagreement stays
 * visible (spec §3: "do not silently hide disagreement").
 *
 * Simplification: since every dish's ratings currently only ever include
 * the maker (no multi-person eaters/co-rating UI yet), "combined" mostly
 * reduces to the maker's own score for now — the aggregation itself
 * already supports more raters once that UI exists.
 */
export async function getPodCombinedView(podId: string, viewerId: string) {
  const memberIds = (
    await prisma.podMember.findMany({ where: { podId, status: "active" }, select: { userId: true } })
  ).map((m) => m.userId);

  const dishes = await prisma.dish.findMany({
    where: {
      makerId: { in: memberIds },
      OR: [{ visibility: "PUBLIC" }, { makerId: viewerId }],
    },
    include: {
      cuisine: true,
      maker: true,
      ratings: { where: { userId: { in: memberIds } }, include: { user: true } },
    },
  });

  const withAggregates = dishes.map((dish) => {
    const { avg, spread } = aggregateScores(dish.ratings.map((r) => r.score));
    return { dish, avg, spread, perPerson: dish.ratings };
  });

  withAggregates.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  return withAggregates;
}
