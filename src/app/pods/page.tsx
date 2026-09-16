import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createPod } from "@/lib/actions/pods";
import { SubmitButton } from "@/components/submit-button";

export default async function PodsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await prisma.podMember.findMany({
    where: { userId: user.id, status: "active" },
    include: { pod: { include: { members: true } } },
    orderBy: { pod: { createdAt: "desc" } },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">Your pods</h1>
      <p className="mt-1 text-sm text-ink/60">
        A pod is you and whoever you cook for — a combined view of what everyone's made.
      </p>

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
                className="flex items-center justify-between rounded-xl border border-sage-200/70 bg-white p-4 transition-colors hover:border-sage-600"
              >
                <span className="font-display text-lg text-ink">{pod.name}</span>
                <span className="text-sm text-ink/50">
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
          placeholder="Me and Aidan"
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
