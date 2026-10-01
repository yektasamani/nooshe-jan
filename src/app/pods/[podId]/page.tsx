import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getPodCombinedView } from "@/lib/pods";
import { agreementLabel } from "@/lib/ranking";
import { searchUsersByName } from "@/lib/users";
import { invitePodMember, leavePod, removePodMember, updatePodPhoto } from "@/lib/actions/pods";
import { deriveFilterOptions, filterRatings, type MakerFilter } from "@/lib/personal-rank";
import { deriveAddedByOptions, filterByAddedBy } from "@/lib/want-to-try-filters";
import { CopyInviteLink } from "@/components/copy-invite-link";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmButton } from "@/components/confirm-button";
import { DishFilterChips, Chip, buildFilterHref } from "@/components/filter-chips";
import { Avatar } from "@/components/avatar";
import { PodPhotoForm } from "@/components/pod-photo-form";

export default async function PodPage({
  params,
  searchParams,
}: {
  params: Promise<{ podId: string }>;
  searchParams: Promise<{
    inviteQuery?: string;
    view?: string;
    maker?: string;
    cuisineId?: string;
    tagId?: string;
    addedById?: string;
  }>;
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

  const [combined, wantToTryItems, pendingInvites, sp] = await Promise.all([
    getPodCombinedView(podId, user.id),
    prisma.wantToTry.findMany({
      where: { podId, convertedToDishId: null },
      include: { addedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.podMember.findMany({ where: { podId, status: "pending" }, include: { user: true } }),
    searchParams,
  ]);
  const { inviteQuery } = sp;
  const inviteResults = inviteQuery
    ? await searchUsersByName(inviteQuery, user.id, { excludePodId: podId })
    : [];
  const view = sp.view === "want_to_try" ? "want_to_try" : "made";

  // Combined-rank filters (spec §2.2, shared logic with the personal rank
  // and profile crowd-score views).
  const maker: MakerFilter = sp.maker === "me" || sp.maker === "others" ? sp.maker : "all";
  const { hasOthersMade, cuisineOptions, tagOptions } = deriveFilterOptions(combined, user.id);
  const filteredCombined = filterRatings(combined, user.id, {
    maker,
    cuisineId: sp.cuisineId,
    tagId: sp.tagId,
  });

  // Want-to-try filter — narrow to one person's ideas once the list gets long.
  const addedByOptions = deriveAddedByOptions(wantToTryItems);
  const filteredWantToTryItems = filterByAddedBy(wantToTryItems, sp.addedById);

  const requestHeaders = await headers();
  const origin = `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host")}`;
  const inviteUrl = `${origin}/pods/${podId}/join`;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
      <div className="flex items-center gap-4">
        <Avatar name={pod.name} avatarUrl={pod.coverPhotoUrl} size="lg" />
        <div>
          <h1 className="font-display text-2xl text-sage-900">{pod.name}</h1>
          <div className="mt-2">
            <PodPhotoForm podId={pod.id} action={updatePodPhoto} />
          </div>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {pod.members.map((member) => (
          <li
            key={member.userId}
            className="flex items-center gap-1.5 rounded-full border border-sage-200 bg-white py-1 pl-3 pr-1 text-sm text-ink"
          >
            {member.user.name}
            {member.userId === user.id ? (
              <ConfirmButton
                action={leavePod}
                confirmMessage={`Leave "${pod.name}"? Your own dishes and ratings are unaffected. This just removes you from this pod's shared view.`}
                confirmLabel="Leave"
                triggerLabel="×"
                triggerTitle="Leave this pod"
                triggerClassName="rounded-full px-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                danger
              >
                <input type="hidden" name="podId" value={podId} />
              </ConfirmButton>
            ) : (
              <ConfirmButton
                action={removePodMember}
                confirmMessage={`Remove ${member.user.name} from "${pod.name}"? Their dishes and ratings are unaffected. This just removes them from this pod's shared view. They'd need a new invite to rejoin.`}
                confirmLabel="Remove"
                triggerLabel="×"
                triggerTitle={`Remove ${member.user.name} from this pod`}
                triggerClassName="rounded-full px-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
                danger
              >
                <input type="hidden" name="podId" value={podId} />
                <input type="hidden" name="targetUserId" value={member.userId} />
              </ConfirmButton>
            )}
          </li>
        ))}
      </ul>

      <details className="group mt-3" open={Boolean(inviteQuery)}>
        <summary className="inline-flex w-fit cursor-pointer list-none items-center gap-1 rounded-full border border-dashed border-sage-300 px-3 py-1.5 text-sm font-medium text-sage-700 hover:border-sage-600 hover:text-sage-900 [&::-webkit-details-marker]:hidden">
          <span aria-hidden>+</span> Invite someone
        </summary>

        <div className="mt-3 rounded-xl border border-sage-200/70 bg-white p-4">
          <CopyInviteLink url={inviteUrl} />

          <form method="GET" className="mt-4 flex gap-2">
            <input
              type="text"
              name="inviteQuery"
              defaultValue={inviteQuery ?? ""}
              placeholder="Find a person to invite"
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
      </details>

      <div className="mt-8 flex gap-2 border-b border-sage-200">
        <Link
          href={`/pods/${podId}?view=made`}
          className={
            view === "made"
              ? "border-b-2 border-sage-600 px-1 pb-2 text-sm font-medium text-sage-900"
              : "border-b-2 border-transparent px-1 pb-2 text-sm text-ink/60 hover:text-ink"
          }
        >
          Combined rank{combined.length > 0 && ` (${combined.length})`}
        </Link>
        <Link
          href={`/pods/${podId}?view=want_to_try`}
          className={
            view === "want_to_try"
              ? "border-b-2 border-sage-600 px-1 pb-2 text-sm font-medium text-sage-900"
              : "border-b-2 border-transparent px-1 pb-2 text-sm text-ink/60 hover:text-ink"
          }
        >
          Want to try{wantToTryItems.length > 0 && ` (${wantToTryItems.length})`}
        </Link>
      </div>

      {view === "made" ? (
        <>
          <DishFilterChips
            basePath={`/pods/${podId}`}
            baseParams={{ view: "made" }}
            maker={maker}
            cuisineId={sp.cuisineId}
            tagId={sp.tagId}
            hasOthersMade={hasOthersMade}
            cuisineOptions={cuisineOptions}
            tagOptions={tagOptions}
          />
          {combined.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
              <p className="text-ink/70">Nothing here yet. Log your first dish together.</p>
              <Link
                href="/dishes/new"
                className="mt-4 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
              >
                Log a dish
              </Link>
            </div>
          ) : filteredCombined.length === 0 ? (
            <p className="mt-8 text-center text-sm text-ink/50">Nothing matches these filters.</p>
          ) : (
            <ol className="mt-4 flex flex-col gap-3">
              {filteredCombined.map(({ dish, avg, spread, perPerson }, index) => (
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
                        {dish.cuisine.name} · made by{" "}
                        {[dish.maker, ...dish.coMakers.map((c) => c.user)]
                          .map((m) => m.name)
                          .join(" and ")}
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
        </>
      ) : (
        <>
          {addedByOptions.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Chip href={buildFilterHref(`/pods/${podId}`, { view: "want_to_try" }, { addedById: undefined })} active={!sp.addedById}>
                Everyone
              </Chip>
              {addedByOptions.map((o) => (
                <Chip
                  key={o.id}
                  href={buildFilterHref(`/pods/${podId}`, { view: "want_to_try" }, { addedById: o.id })}
                  active={sp.addedById === o.id}
                >
                  {o.name}
                </Chip>
              ))}
            </div>
          )}

          {wantToTryItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
              <p className="text-ink/70">Nothing on the list yet.</p>
              <Link
                href="/want-to-try/new"
                className="mt-4 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
              >
                Add an idea
              </Link>
            </div>
          ) : filteredWantToTryItems.length === 0 ? (
            <p className="mt-8 text-center text-sm text-ink/50">Nothing matches this filter.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {filteredWantToTryItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-sage-200/70 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-ink">{item.name}</p>
                    <p className="truncate text-xs text-ink/50">added by {item.addedBy.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.addedById === user.id && (
                      <Link href={`/want-to-try/${item.id}/edit`} className="text-sm text-ink/50 hover:text-ink">
                        Edit
                      </Link>
                    )}
                    <Link
                      href={`/dishes/new?wantToTryId=${item.id}`}
                      className="rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600"
                    >
                      Log it
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
