import { prisma } from "@/lib/prisma";

/** Everyone the user shares an active pod with — used to populate the
 * "who ate it" checkboxes on the add/edit dish forms. */
export async function getPodMates(userId: string) {
  const myPodIds = (
    await prisma.podMember.findMany({ where: { userId, status: "active" }, select: { podId: true } })
  ).map((m) => m.podId);

  if (myPodIds.length === 0) return [];

  return prisma.user.findMany({
    where: {
      id: { not: userId },
      podMemberships: { some: { podId: { in: myPodIds }, status: "active" } },
    },
    orderBy: { name: "asc" },
  });
}
