import { prisma } from "@/lib/prisma";

/** Dishes this user made, co-made, or ate but hasn't ranked yet — the
 * point is for whoever actually had the dish to be able to rank it, not
 * just whoever made it, so a co-maker or eater won't otherwise know to
 * check since it never showed up in their own "Made" tab. Also naturally
 * recovers the maker's own dish if they abandoned the flow partway
 * through right after creating it. */
export async function getUnrankedDishes(userId: string) {
  return prisma.dish.findMany({
    where: {
      OR: [{ makerId: userId }, { coMakers: { some: { userId } } }, { eaters: { some: { userId } } }],
      ratings: { none: { userId } },
    },
    include: { cuisine: true, maker: true },
    orderBy: { createdAt: "desc" },
  });
}
