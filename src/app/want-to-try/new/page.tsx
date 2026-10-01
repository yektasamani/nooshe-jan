import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createWantToTry } from "@/lib/actions/want-to-try";
import { WantToTryForm } from "@/components/want-to-try-form";

export default async function NewWantToTryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await prisma.podMember.findMany({
    where: { userId: user.id, status: "active" },
    include: { pod: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl text-sage-900">Add an idea</h1>
      <p className="mt-2 text-sm text-ink/60">
        Nothing to rank yet. Just a place to remember what&apos;s next.
      </p>

      <WantToTryForm action={createWantToTry} memberships={memberships} />
    </main>
  );
}
