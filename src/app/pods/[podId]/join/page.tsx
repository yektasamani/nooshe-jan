import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { joinPod } from "@/lib/actions/pods";
import { SubmitButton } from "@/components/submit-button";

export default async function JoinPodPage({ params }: { params: Promise<{ podId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { podId } = await params;
  const pod = await prisma.pod.findUnique({
    where: { id: podId },
    include: { members: { where: { status: "active" }, include: { user: true } } },
  });
  if (!pod) redirect("/pods");

  const alreadyMember = pod.members.some((m) => m.userId === user.id);
  if (alreadyMember) redirect(`/pods/${podId}`);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-2xl text-sage-900">Join {pod.name}?</h1>
      <p className="mt-2 max-w-xs text-sm text-ink/60">
        {pod.members.length > 0
          ? `You'll see a combined rank with ${pod.members.map((m) => m.user.name).join(", ")}.`
          : "You'll be the first one in."}
      </p>
      <form action={joinPod} className="mt-6">
        <input type="hidden" name="podId" value={podId} />
        <SubmitButton
          pendingText="Joining…"
          className="rounded-full bg-sage-600 px-6 py-3 font-medium text-white hover:bg-sage-900 disabled:opacity-60"
        >
          Join pod
        </SubmitButton>
      </form>
    </main>
  );
}
