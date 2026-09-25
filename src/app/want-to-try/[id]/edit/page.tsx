import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { updateWantToTry, deleteWantToTry } from "@/lib/actions/want-to-try";
import { SubmitButton } from "@/components/submit-button";
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

      <form action={updateWantToTry} className="mt-8 flex flex-col gap-5">
        <input type="hidden" name="id" value={item.id} />

        <p className="text-xs text-ink/50">
          <span className="text-sage-600">*</span> Required
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">
            Name <span className="text-sage-600">*</span>
          </span>
          <input
            type="text"
            name="name"
            required
            defaultValue={item.name}
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Photo</span>
          {item.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photoUrl} alt="" className="h-24 w-24 rounded-lg object-cover" />
          )}
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink file:mr-3 file:rounded-full file:border-0 file:bg-sage-50 file:px-3 file:py-1.5 file:text-sage-900"
          />
          <span className="text-xs text-ink/50">Leave blank to keep the current photo.</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Link</span>
          <input
            type="url"
            name="link"
            defaultValue={item.link ?? undefined}
            placeholder="https:// (optional)"
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          />
        </label>

        {memberships.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink/80">Pod (optional)</span>
            <select
              name="podId"
              defaultValue={item.podId ?? ""}
              className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
            >
              <option value="">Just for me</option>
              {memberships.map(({ pod }) => (
                <option key={pod.id} value={pod.id}>
                  {pod.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <SubmitButton
          pendingText="Saving…"
          className="mt-2 w-fit rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
        >
          Save changes
        </SubmitButton>
      </form>

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
