import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { createWantToTry } from "@/lib/actions/want-to-try";
import { SubmitButton } from "@/components/submit-button";

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
        Nothing to rank yet — just a place to remember what's next.
      </p>

      <form action={createWantToTry} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Name</span>
          <input
            type="text"
            name="name"
            required
            placeholder="Tahchin"
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Photo</span>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink file:mr-3 file:rounded-full file:border-0 file:bg-sage-50 file:px-3 file:py-1.5 file:text-sage-900"
          />
          <span className="text-xs text-ink/50">Optional — whichever you have, photo or link</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Link</span>
          <input
            type="url"
            name="link"
            placeholder="https:// (optional)"
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          />
        </label>

        {memberships.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink/80">Pod (optional)</span>
            <select
              name="podId"
              defaultValue=""
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
          pendingText="Adding…"
          className="mt-2 rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
        >
          Add to the list
        </SubmitButton>
      </form>
    </main>
  );
}
