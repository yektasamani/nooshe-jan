import { prisma } from "@/lib/prisma";

/**
 * "Chronological activity across your pods" (spec §2, screen 10) — new
 * dishes logged and want-to-try ideas added, merged into one timeline.
 * Scoped to pod membership: if the viewer is in no pods, there's no feed
 * (their own solo activity lives in their personal rank instead — spec's
 * wording is specifically "across your pods").
 *
 * Simplification: spec also lists "re-ranks" as a feed event. There's no
 * discrete "a re-rank happened" record — PairwiseComparison rows exist for
 * both initial ranking and re-ranking, indistinguishable, and a single
 * re-rank can produce several of them. Left out rather than guessed at;
 * would need a dedicated event log to do properly.
 */
export type FeedItem =
  | {
      type: "dish";
      id: string;
      createdAt: Date;
      dishId: string;
      dishName: string;
      photoUrl: string;
      cuisineName: string;
      makerName: string;
      /** The maker's own score for it, if they've finished ranking it —
       * null right after logging, before the tier/comparison flow. */
      score: number | null;
    }
  | {
      type: "want_to_try";
      id: string;
      createdAt: Date;
      wantToTryId: string;
      name: string;
      addedByName: string;
      podName: string;
    };

export async function getFeed(userId: string, take = 30): Promise<FeedItem[]> {
  const myPodIds = (
    await prisma.podMember.findMany({ where: { userId, status: "active" }, select: { podId: true } })
  ).map((m) => m.podId);

  if (myPodIds.length === 0) return [];

  const memberIds = [
    ...new Set(
      (
        await prisma.podMember.findMany({
          where: { podId: { in: myPodIds }, status: "active" },
          select: { userId: true },
        })
      ).map((m) => m.userId),
    ),
  ];

  const [dishes, wantToTrys] = await Promise.all([
    prisma.dish.findMany({
      where: { makerId: { in: memberIds }, OR: [{ visibility: "PUBLIC" }, { makerId: userId }] },
      include: { maker: true, cuisine: true, ratings: true },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.wantToTry.findMany({
      where: { podId: { in: myPodIds } },
      include: { addedBy: true, pod: true },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ]);

  const items: FeedItem[] = [
    ...dishes.map((d) => ({
      type: "dish" as const,
      id: `dish-${d.id}`,
      createdAt: d.createdAt,
      dishId: d.id,
      dishName: d.name,
      photoUrl: d.photoUrl,
      cuisineName: d.cuisine.name,
      makerName: d.maker.name,
      score: d.ratings.find((r) => r.userId === d.makerId)?.score ?? null,
    })),
    ...wantToTrys.map((w) => ({
      type: "want_to_try" as const,
      id: `wtt-${w.id}`,
      createdAt: w.createdAt,
      wantToTryId: w.id,
      name: w.name,
      addedByName: w.addedBy.name,
      podName: w.pod?.name ?? "",
    })),
  ];

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, take);
}
