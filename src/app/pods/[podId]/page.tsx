import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getPodCombinedView } from "@/lib/pods";
import { agreementLabel } from "@/lib/ranking";
import { CopyInviteLink } from "@/components/copy-invite-link";

export default async function PodPage({ params }: { params: Promise<{ podId: string }> }) {
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

  const combined = await getPodCombinedView(podId, user.id);
  const wantToTryItems = await prisma.wantToTry.findMany({
    where: { podId, convertedToDishId: null },
    include: { addedBy: true },
    orderBy: { createdAt: "desc" },
  });

  const requestHeaders = await headers();
  const origin = `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host")}`;
  const inviteUrl = `${origin}/pods/${podId}/join`;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">{pod.name}</h1>
      <p className="mt-1 text-sm text-ink/60">
        {pod.members.map((m) => m.user.name).join(", ")}
      </p>

      <div className="mt-4 rounded-xl border border-sage-200/70 bg-white p-4">
        <p className="text-sm font-medium text-ink/80">Invite someone</p>
        <CopyInviteLink url={inviteUrl} />
      </div>

      <h2 className="font-display mt-8 text-xl text-sage-900">Combined rank</h2>

      {combined.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
          <p className="text-ink/70">Nothing here yet — log your first dish together.</p>
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
