import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getWantToTryItems } from "@/lib/want-to-try";
import { deriveFilterOptions, filterRatings, type MakerFilter } from "@/lib/personal-rank";

type SearchParams = {
  view?: string;
  maker?: string;
  cuisineId?: string;
  tagId?: string;
};

function buildHref(current: SearchParams, changes: Partial<SearchParams>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-sage-600 px-3 py-1.5 text-sm font-medium text-white"
          : "rounded-full border border-sage-200 px-3 py-1.5 text-sm text-ink/70 hover:border-sage-600"
      }
    >
      {children}
    </Link>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display max-w-lg text-4xl text-sage-900 sm:text-5xl">
          نوش جان — Noosh Jan
        </h1>
        <p className="mt-4 max-w-md text-ink/70">
          Log the dishes you cook, rank them against each other, and figure out
          what to cook next — with the people you cook for.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-sage-600 px-6 py-3 font-medium text-white hover:bg-sage-900"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-sage-200 px-6 py-3 font-medium text-ink hover:border-sage-600"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const sp = await searchParams;
  const view = sp.view === "want_to_try" ? "want_to_try" : "made";
  const maker: MakerFilter = sp.maker === "me" || sp.maker === "others" ? sp.maker : "all";

  // Personal rank (spec §2/§3) — every dish this user has ranked, sorted
  // by their own pairwise position, best first.
  const allRatings = await prisma.rating.findMany({
    where: { userId: user.id },
    include: {
      dish: { include: { cuisine: true, maker: true, tags: { include: { tag: true } } } },
    },
    orderBy: { position: "asc" },
  });

  // Filter chips (spec §2.2: maker / cuisine / tags / made vs. want-to-try).
  const { hasOthersMade, cuisineOptions, tagOptions } = deriveFilterOptions(allRatings, user.id);
  const ratings = filterRatings(allRatings, user.id, { maker, cuisineId: sp.cuisineId, tagId: sp.tagId });

  const wantToTryItems = view === "want_to_try" ? await getWantToTryItems(user.id) : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">Your rank</h1>

      <div className="mt-4 flex gap-2 border-b border-sage-200">
        <Link
          href={buildHref(sp, { view: "made" })}
          className={
            view === "made"
              ? "border-b-2 border-sage-600 px-1 pb-2 text-sm font-medium text-sage-900"
              : "border-b-2 border-transparent px-1 pb-2 text-sm text-ink/60 hover:text-ink"
          }
        >
          Made
        </Link>
        <Link
          href={buildHref(sp, { view: "want_to_try" })}
          className={
            view === "want_to_try"
              ? "border-b-2 border-sage-600 px-1 pb-2 text-sm font-medium text-sage-900"
              : "border-b-2 border-transparent px-1 pb-2 text-sm text-ink/60 hover:text-ink"
          }
        >
          Want to try
        </Link>
      </div>

      {view === "want_to_try" ? (
        <>
          <div className="mt-4 flex justify-end">
            <Link
              href="/want-to-try/new"
              className="rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-900"
            >
              Add an idea
            </Link>
          </div>
          {wantToTryItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
              <p className="text-ink/70">Nothing on the list yet.</p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {wantToTryItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                    {item.photoUrl && (
                      <Image src={item.photoUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg text-ink">{item.name}</p>
                    <p className="truncate text-sm text-ink/60">
                      added by {item.addedBy.name}
                      {item.pod && ` · ${item.pod.name}`}
                    </p>
                  </div>
                  <Link
                    href={`/dishes/new?wantToTryId=${item.id}`}
                    className="shrink-0 rounded-full border border-sage-200 px-4 py-2 text-sm font-medium text-ink hover:border-sage-600"
                  >
                    Log it
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          {(hasOthersMade || cuisineOptions.length > 1 || tagOptions.length > 0) && (
            <div className="mt-4 flex flex-col gap-2">
              {hasOthersMade && (
                <div className="flex flex-wrap gap-1.5">
                  <Chip href={buildHref(sp, { maker: undefined })} active={maker === "all"}>
                    Everyone
                  </Chip>
                  <Chip href={buildHref(sp, { maker: "me" })} active={maker === "me"}>
                    Me
                  </Chip>
                  <Chip href={buildHref(sp, { maker: "others" })} active={maker === "others"}>
                    Others
                  </Chip>
                </div>
              )}
              {cuisineOptions.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  <Chip href={buildHref(sp, { cuisineId: undefined })} active={!sp.cuisineId}>
                    All cuisines
                  </Chip>
                  {cuisineOptions.map((c) => (
                    <Chip key={c.id} href={buildHref(sp, { cuisineId: c.id })} active={sp.cuisineId === c.id}>
                      {c.name}
                    </Chip>
                  ))}
                </div>
              )}
              {tagOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <Chip href={buildHref(sp, { tagId: undefined })} active={!sp.tagId}>
                    All tags
                  </Chip>
                  {tagOptions.map((t) => (
                    <Chip key={t.id} href={buildHref(sp, { tagId: t.id })} active={sp.tagId === t.id}>
                      {t.name}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          )}

          {allRatings.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
              <p className="text-ink/70">Nothing here yet — log your first dish to get started.</p>
              <Link
                href="/dishes/new"
                className="mt-4 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
              >
                Log a dish
              </Link>
            </div>
          ) : ratings.length === 0 ? (
            <p className="mt-8 text-center text-sm text-ink/50">Nothing matches these filters.</p>
          ) : (
            <ol className="mt-4 flex flex-col gap-3">
              {ratings.map((rating) => (
                <li key={rating.id}>
                  <Link
                    href={`/dishes/${rating.dish.id}`}
                    className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3 transition-colors hover:border-sage-600"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                      <Image src={rating.dish.photoUrl} alt={rating.dish.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg text-ink">{rating.dish.name}</p>
                      <p className="truncate text-sm text-ink/60">
                        {rating.dish.cuisine.name} · made by {rating.dish.maker.name}
                      </p>
                    </div>
                    <span className="font-display shrink-0 text-2xl text-sage-600">
                      {rating.score.toFixed(1)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </main>
  );
}
