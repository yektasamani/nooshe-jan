import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getPodCombinedView } from "@/lib/pods";
import { agreementLabel } from "@/lib/ranking";
import { searchUsersByName } from "@/lib/users";
import { invitePodMember, leavePod, removePodMember } from "@/lib/actions/pods";
import { CopyInviteLink } from "@/components/copy-invite-link";
import { SubmitButton } from "@/components/submit-button";

export default async function PodPage({
  params,
  searchParams,
}: {
  params: Promise<{ podId: string }>;
  searchParams: Promise<{ inviteQuery?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { podId } = await params;
  const pod = await prisma.pod.findUnique({
    where: { id: podId },
    include: { members: { where: { status: "active" }, include: { user: true } } },
  });
  if (!pod) redirect("/pods");

  const isMember = pod.members.some((m) => m.userId === user.id);
  if (!isMember) redirect(`/pods/${podId}/join`);

  const [combined, wantToTryItems, pendingInvites, { inviteQuery }] = await Promise.all([
    getPodCombinedView(podId, user.id),
    prisma.wantToTry.findMany({
      where: { podId, convertedToDishId: null },
      include: { addedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.podMember.findMany({ where: { podId, status: "pending" }, include: { user: true } }),
    searchParams,
  ]);
  const inviteResults = inviteQuery
    ? await searchUsersByName(inviteQuery, user.id, { excludePodId: podId })
    : [];

  const requestHeaders = await headers();
  const origin = `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host")}`;
  const inviteUrl = `${origin}/pods/${podId}/join`;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">{pod.name}</h1>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {pod.members.map((member) => (
          <li
            key={member.userId}
            className="flex items-center gap-1.5 rounded-full border border-sage-200 bg-white py-1 pl-3 pr-1 text-sm text-ink"
          >
            {member.user.name}
            {member.userId === user.id ? (
              <form action={leavePod}>
                <input type="hidden" name="podId" value={podId} />
                <button
                  type="submit"
                  title="Leave this pod"
                  className="rounded-full px-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                >
                  ×
                </button>
              </form>
            ) : (
              <form action={removePodMember}>
                <input type="hidden" name="podId" value={podId} />
                <input type="hidden" name="targetUserId" value={member.userId} />
                <button
                  type="submit"
                  title={`Remove ${member.user.name} from this pod`}
                  className="rounded-full px-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                >
                  ×
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-sage-200/70 bg-white p-4">
        <p className="text-sm font-medium text-ink/80">Invite someone</p>
        <CopyInviteLink url={inviteUrl} />

        <form method="GET" className="mt-4 flex gap-2">
          <input
            type="text"
            name="inviteQuery"
            defaultValue={inviteQuery ?? ""}
            placeholder="Or search by name"
            className="flex-1 rounded-lg border border-sage-200 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-sage-600"
          />
          <button
            type="submit"
            className="rounded-full border border-sage-200 px-4 py-2 text-sm font-medium text-ink hover:border-sage-600"
          >
            Search
          </button>
        </form>

        {inviteQuery && (
          <ul className="mt-2 flex flex-col gap-1.5">
            {inviteResults.length === 0 ? (
              <p className="text-sm text-ink/50">No one found matching &quot;{inviteQuery}&quot;.</p>
            ) : (
              inviteResults.map((result) => (
                <li
                  key={result.id}
                  className="flex items-center justify-between rounded-lg bg-cream px-3 py-2"
                >
                  <span className="text-sm text-ink">{result.name}</span>
                  <form action={invitePodMember}>
                    <input type="hidden" name="podId" value={podId} />
                    <input type="hidden" name="targetUserId" value={result.id} />
                    <SubmitButton
                      pendingText="…"
                      className="rounded-full bg-sage-600 px-3 py-1 text-xs font-medium text-white hover:bg-sage-900 disabled:opacity-60"
                    >
                      Invite
                    </SubmitButton>
                  </form>
                </li>
              ))
            )}
          </ul>
        )}

        {pendingInvites.length > 0 && (
          <p className="mt-3 text-xs text-ink/50">
            Invited, waiting to accept: {pendingInvites.map((i) => i.user.name).join(", ")}
          </p>
        )}
      </div>

      <h2 className="font-display mt-8 text-xl text-sage-900">Combined rank</h2>

      {combined.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
          <p className="text-ink/70">Nothing here yet. Log your first dish together.</p>
          <Link
            href="/dishes/new"
            className="mt-4 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
          >
            Log a dish
          </Link>
        </div>
      ) : (
        <ol className="mt-4 flex flex-col gap-3">
          {combined.map(({ dish, avg, spread, perPerson }, index) => (
            <li key={dish.id}>
              <Link
                href={`/dishes/${dish.id}`}
                className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3 transition-colors hover:border-sage-600"
              >
                <span className="w-6 shrink-0 text-center text-sm text-ink/40">{index + 1}</span>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                  <Image src={dish.photoUrl} alt={dish.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg text-ink">{dish.name}</p>
                  <p className="truncate text-sm text-ink/60">
                    {dish.cuisine.name} · made by {dish.maker.name}
                  </p>
                  {perPerson.length > 0 && (
                    <p className="mt-0.5 truncate text-xs text-ink/50">
                      {perPerson.map((r) => `${r.user.name} ${r.score.toFixed(1)}`).join(" · ")}
                      {agreementLabel(spread, perPerson.length) && (
                        <> · {agreementLabel(spread, perPerson.length)}</>
                      )}
                    </p>
                  )}
                </div>
                <span className="font-display shrink-0 text-2xl text-sage-600">
                  {avg !== null ? avg.toFixed(1) : "—"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {wantToTryItems.length > 0 && (
        <>
          <h2 className="font-display mt-8 text-xl text-sage-900">Want to try</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {wantToTryItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-sage-200/70 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-ink">{item.name}</p>
                  <p className="truncate text-xs text-ink/50">added by {item.addedBy.name}</p>
                </div>
                <Link
                  href={`/dishes/new?wantToTryId=${item.id}`}
                  className="shrink-0 rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600"
                >
                  Log it
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
