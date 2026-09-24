import { prisma } from "@/lib/prisma";

/** Find users by (partial, case-insensitive) name — used for both
 * "browse people" search and pod invite-by-search. Name-based rather than
 * email-based deliberately: searching by email would let anyone probe
 * whether a specific address has an account here; name search doesn't. */
export async function searchUsersByName(
  query: string,
  excludeUserId: string,
  options?: { excludePodId?: string; take?: number },
) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      name: { contains: trimmed, mode: "insensitive" },
      ...(options?.excludePodId
        ? { podMemberships: { none: { podId: options.excludePodId } } }
        : {}),
    },
    orderBy: { name: "asc" },
    take: options?.take ?? 20,
  });
}
