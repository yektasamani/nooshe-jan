import { prisma } from "@/lib/prisma";

/** Dishes this user made or co-made but hasn't ranked yet — the main
 * reason this exists is co-makers (spec extension: someone else logged
 * the dish, so it never went through *this* person's own tier/comparison
 * flow), but it also naturally recovers the primary maker's own dish if
 * they abandoned the flow partway through right after creating it. */
export async function getUnrankedMadeDishes(userId: string) {
  return prisma.dish.findMany({
    where: {
      OR: [{ makerId: userId }, { coMakers: { some: { userId } } }],
      ratings: { none: { userId } },
    },
    include: { cuisine: true, maker: true },
    orderBy: { createdAt: "desc" },
  });
}
