"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isOwnedImageUrl } from "@/lib/dish-fields";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

/** Creating a pod can happen proactively, before any shared history exists
 * (spec §1 Pod). The creator is added as the first active member. */
export async function createPod(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/pods");

  const pod = await prisma.pod.create({
    data: {
      name,
      members: { create: [{ userId, status: "active" }] },
    },
  });

  redirect(`/pods/${pod.id}`);
}

/** Joining via a shared link (spec §4: "simple email/link, no artificial
 * scarcity"). Simplification vs. spec's "pending-member state": since
 * anyone with the link joins immediately (no separate invite-acceptance
 * step, no invitee identity captured ahead of time), there's no pending
 * status here — joining is a one-step action. Revisit if a real
 * email-invite flow gets added later. On joining, the member immediately
 * sees the combined pod view (spec §1: "no cold start") since that view
 * is computed live, not cached per-member. */
export async function joinPod(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const podId = String(formData.get("podId"));

  const pod = await prisma.pod.findUnique({ where: { id: podId } });
  if (!pod) redirect("/pods");

  await prisma.podMember.upsert({
    where: { podId_userId: { podId, userId } },
    update: {},
    create: { podId, userId, status: "active" },
  });

  redirect(`/pods/${podId}`);
}

/** Inviting someone found via search (spec §5's "pending-member state" —
 * this is where it actually applies, unlike the link-invite above: since
 * the invitee didn't take any action themselves, they shouldn't be
 * silently added. Creates a pending row; they accept/decline from
 * /pods. */
export async function invitePodMember(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const podId = String(formData.get("podId"));
  const targetUserId = String(formData.get("targetUserId"));

  const requesterMembership = await prisma.podMember.findUnique({
    where: { podId_userId: { podId, userId }, status: "active" },
  });
  if (!requesterMembership) redirect("/pods");

  await prisma.podMember.upsert({
    where: { podId_userId: { podId, userId: targetUserId } },
    update: {},
    create: { podId, userId: targetUserId, status: "pending" },
  });

  revalidatePath(`/pods/${podId}`);
  redirect(`/pods/${podId}`);
}

/** Accepting a pending invite (spec §5 "pending-member state"). Only the
 * invitee themself can accept their own pending row. */
export async function acceptPodInvite(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const podId = String(formData.get("podId"));

  await prisma.podMember.updateMany({
    where: { podId, userId, status: "pending" },
    data: { status: "active" },
  });

  revalidatePath("/pods");
  redirect(`/pods/${podId}`);
}

/** Declining removes the pending row entirely (no "declined" state to
 * track — they're just not a member). */
export async function declinePodInvite(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const podId = String(formData.get("podId"));

  await prisma.podMember.deleteMany({ where: { podId, userId, status: "pending" } });

  revalidatePath("/pods");
  redirect("/pods");
}

/** Leaving a pod yourself. */
export async function leavePod(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const podId = String(formData.get("podId"));

  await prisma.podMember.deleteMany({ where: { podId, userId } });

  revalidatePath("/pods");
  redirect("/pods");
}

/** Setting/changing a pod's cover photo — any active member, same
 * symmetric-permission philosophy as the rest of pod management (no
 * owner concept). */
export async function updatePodPhoto(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const podId = String(formData.get("podId"));

  const membership = await prisma.podMember.findUnique({
    where: { podId_userId: { podId, userId }, status: "active" },
  });
  if (!membership) redirect("/pods");

  // Uploaded client-side before this ever submits (Vercel's 4.5MB
  // serverless body limit rules out sending the raw file through a
  // Server Action) — double-check it actually belongs to this user
  // before trusting it.
  const photoUrl = String(formData.get("photo") ?? "").trim();
  if (photoUrl && isOwnedImageUrl(photoUrl, userId)) {
    await prisma.pod.update({ where: { id: podId }, data: { coverPhotoUrl: photoUrl } });
  }

  revalidatePath(`/pods/${podId}`);
  revalidatePath("/pods");
  redirect(`/pods/${podId}`);
}

/** Removing someone else from a pod. Symmetric on purpose — pods have no
 * owner/admin concept (spec doesn't define one), so any active member can
 * remove any other member, including a pending invite they didn't send.
 * Covers "I want them out now" (e.g. a breakup) without waiting on the
 * other person to leave on their own. */
export async function removePodMember(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const podId = String(formData.get("podId"));
  const targetUserId = String(formData.get("targetUserId"));

  const requesterMembership = await prisma.podMember.findUnique({
    where: { podId_userId: { podId, userId }, status: "active" },
  });
  if (!requesterMembership) redirect("/pods");

  await prisma.podMember.deleteMany({ where: { podId, userId: targetUserId } });

  revalidatePath(`/pods/${podId}`);
  redirect(`/pods/${podId}`);
}
