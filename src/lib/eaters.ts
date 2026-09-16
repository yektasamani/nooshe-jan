import { prisma } from "@/lib/prisma";

/** Resolves "who ate it" (spec §1) into a validated set of user ids —
 * always the maker if they opted in, plus whichever submitted ids are
 * genuinely pod-mates of the maker. Never trusts client-submitted ids
 * directly, since anyone could otherwise tag an arbitrary user. */
export async function resolveEaterIds(
  makerId: string,
  myPodIds: string[],
  eatSelf: boolean,
  submittedEaterIds: string[],
): Promise<string[]> {
  const validPodMateIds =
    myPodIds.length > 0 && submittedEaterIds.length > 0
      ? (
          await prisma.user.findMany({
            where: {
              id: { not: makerId, in: submittedEaterIds },
              podMemberships: { some: { podId: { in: myPodIds }, status: "active" } },
            },
            select: { id: true },
          })
        ).map((u) => u.id)
      : [];

  return [...new Set([...(eatSelf ? [makerId] : []), ...validPodMateIds])];
}
