import { prisma } from "@/lib/prisma";

/** How many pending pod invites this user has waiting on them — powers
 * the nav badge (spec §5's notifications question, resolved here as
 * "in-app only," no email). */
export async function getPendingInviteCount(userId: string): Promise<number> {
  return prisma.podMember.count({ where: { userId, status: "pending" } });
}
