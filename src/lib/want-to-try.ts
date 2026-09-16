import { prisma } from "@/lib/prisma";

/** Ideas visible to a user — their own, plus anything tagged to a pod
 * they're in — that haven't been cooked yet. Shared by /want-to-try and
 * the personal rank page's "want to try" tab (spec §2.2 filter chips). */
export async function getWantToTryItems(userId: string) {
  const myPodIds = (
    await prisma.podMember.findMany({ where: { userId, status: "active" }, select: { podId: true } })
  ).map((m) => m.podId);

  return prisma.wantToTry.findMany({
    where: {
      convertedToDishId: null,
      OR: [{ addedById: userId }, { podId: { in: myPodIds } }],
    },
    include: { addedBy: true, pod: true },
    orderBy: { createdAt: "desc" },
  });
}
