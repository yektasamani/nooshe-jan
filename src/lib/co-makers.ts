import { prisma } from "@/lib/prisma";

/** Resolves "cooked with" into a validated set of user ids — only people
 * sharing a pod with the primary maker, same trust boundary as eaters.
 * Never trusts client-submitted ids directly. */
export async function resolveCoMakerIds(
  makerId: string,
  myPodIds: string[],
  submittedCoMakerIds: string[],
): Promise<string[]> {
  if (myPodIds.length === 0 || submittedCoMakerIds.length === 0) return [];

  const validIds = await prisma.user.findMany({
    where: {
      id: { not: makerId, in: submittedCoMakerIds },
      podMemberships: { some: { podId: { in: myPodIds }, status: "active" } },
    },
    select: { id: true },
  });
  return validIds.map((u) => u.id);
}
