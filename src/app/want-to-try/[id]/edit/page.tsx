import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { updateWantToTry, deleteWantToTry } from "@/lib/actions/want-to-try";
import { WantToTryForm } from "@/components/want-to-try-form";
import { ConfirmButton } from "@/components/confirm-button";

export default async function EditWantToTryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const item = await prisma.wantToTry.findUnique({ where: { id } });
  if (!item) notFound();
  if (item.addedById !== user.id) redirect("/want-to-try");

  const memberships = await prisma.podMember.findMany({
    where: { userId: user.id, status: "active" },
    include: { pod: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl text-sage-900">Edit idea</h1>

      <WantToTryForm
        action={updateWantToTry}
        itemId={item.id}
        initialName={item.name}
        initialPhotoUrl={item.photoUrl}
        initialLink={item.link ?? undefined}
        initialPodId={item.podId}
        memberships={memberships}
        submitLabel="Save changes"
        pendingLabel="Saving…"
      />

      <div className="mt-8 border-t border-sage-200 pt-6">
        <ConfirmButton
          action={deleteWantToTry}
          confirmMessage={`Delete "${item.name}"? This can't be undone.`}
          confirmLabel="Delete"
          triggerLabel="Delete idea"
          triggerClassName="rounded-full border border-red-200 px-5 py-2.5 font-medium text-red-600 hover:bg-red-50"
          danger
        >
          <input type="hidden" name="id" value={item.id} />
        </ConfirmButton>
      </div>
    </main>
  );
}
