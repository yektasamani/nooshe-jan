"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
