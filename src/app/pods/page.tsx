import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createPod, acceptPodInvite, declinePodInvite } from "@/lib/actions/pods";
import { SubmitButton } from "@/components/submit-button";
import { Avatar } from "@/components/avatar";

export default async function PodsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [memberships, pendingInvites] = await Promise.all([
    prisma.podMember.findMany({
      where: { userId: user.id, status: "active" },
      include: { pod: { include: { members: { where: { status: "active" } } } } },
      orderBy: { pod: { createdAt: "desc" } },
    }),
    prisma.podMember.findMany({
      where: { userId: user.id, status: "pending" },
      include: { pod: true },
      orderBy: { joinedAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">Your pods</h1>
      <p className="mt-1 text-sm text-ink/60">
        A pod is you and whoever you cook for, with a combined view of what everyone&apos;s made.
      </p>

      {pendingInvites.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink/60">Invites</h2>
          {pendingInvites.map((invite) => (
            <div
              key={invite.podId}
              className="flex items-center justify-between rounded-xl border border-sage-200 bg-sage-50 px-4 py-3"
            >
              <span className="text-ink">{invite.pod.name}</span>
              <div className="flex gap-2">
                <form action={acceptPodInvite}>
                  <input type="hidden" name="podId" value={invite.podId} />
                  <SubmitButton
                    pendingText="…"
                    className="rounded-full bg-sage-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sage-900 disabled:opacity-60"
                  >
                    Accept
                  </SubmitButton>
                </form>
                <form action={declinePodInvite}>
                  <input type="hidden" name="podId" value={invite.podId} />
                  <SubmitButton
                    pendingText="…"
                    className="rounded-full border border-sage-200 px-3 py-1.5 text-sm text-ink/70 hover:border-sage-600 disabled:opacity-60"
                  >
                    Decline
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {memberships.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sage-200 px-6 py-12 text-center">
          <p className="text-ink/70">No pods yet.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {memberships.map(({ pod }) => (
            <li key={pod.id}>
              <Link
                href={`/pods/${pod.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-sage-200/70 bg-white p-4 transition-colors hover:border-sage-600"
              >
                <span className="flex items-center gap-3">
                  <Avatar name={pod.name} avatarUrl={pod.coverPhotoUrl} size="md" />
                  <span className="font-display text-lg text-ink">{pod.name}</span>
                </span>
                <span className="shrink-0 text-sm text-ink/50">
                  {pod.members.length} {pod.members.length === 1 ? "member" : "members"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form action={createPod} className="mt-8 flex gap-2">
        <input
          type="text"
          name="name"
          required
          placeholder="Family"
          className="flex-1 rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
        <SubmitButton
          pendingText="Creating…"
          className="rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900 disabled:opacity-60"
        >
          Create a pod
        </SubmitButton>
      </form>
    </main>
  );
}
