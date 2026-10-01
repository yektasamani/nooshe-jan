import { prisma } from "@/lib/prisma";

/** Same visibility rule as getWantToTryItems below, for a single item:
 * the adder always sees it, plus anyone active in its pod (if any).
 * Shared here so reaction actions (likes/comments) gate on the exact
 * same rule as seeing the idea itself. */
export async function canViewWantToTry(
  item: { addedById: string; podId: string | null },
  userId: string,
): Promise<boolean> {
  if (item.addedById === userId) return true;
  if (!item.podId) return false;
  const membership = await prisma.podMember.findUnique({
    where: { podId_userId: { podId: item.podId, userId }, status: "active" },
  });
  return Boolean(membership);
}

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
