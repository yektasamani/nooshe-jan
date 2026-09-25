import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getWantToTryItems } from "@/lib/want-to-try";
import { getUnrankedMadeDishes } from "@/lib/unranked-dishes";
import { deriveFilterOptions, filterRatings, type MakerFilter } from "@/lib/personal-rank";
import { DishFilterChips, buildFilterHref } from "@/components/filter-chips";

type SearchParams = {
    view?: string;
    maker?: string;
    cuisineId?: string;
    tagId?: string;
};

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
                <h1 className="font-display max-w-lg text-4xl text-sage-900 sm:text-5xl">
                    نوش جان — Nooshe Jan
                </h1>
                <p className="mt-2 text-sm italic text-ink/60">May it nourish your soul.</p>
                <p className="font-display mt-3 text-lg text-sage-600">
                    Log what you cook. Rank it. Never wonder what to make again.
                </p>
                <p className="mt-4 max-w-lg text-ink/70">
                    Settle family debates about what&apos;s good, keep every want-to-make
                    idea in one place, and if you&apos;re avoidant, introverted, or just
                    indecisive, ranking a dish honestly beats saying it to someone&apos;s face.
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
    const [allRatings, unrankedMadeDishes] = await Promise.all([
        prisma.rating.findMany({
            where: { userId: user.id },
            include: {
                dish: {
                    include: { cuisine: true, maker: true, coMakers: true, tags: { include: { tag: true } } },
                },
            },
            orderBy: { position: "asc" },
        }),
        getUnrankedMadeDishes(user.id),
    ]);

    // Filter chips (spec §2.2: maker / cuisine / tags / made vs. want-to-try).
    const { hasOthersMade, cuisineOptions, tagOptions } = deriveFilterOptions(allRatings, user.id);
    const ratings = filterRatings(allRatings, user.id, {
        maker,
        cuisineId: sp.cuisineId,
        tagId: sp.tagId,
    });

    const wantToTryItems = view === "want_to_try" ? await getWantToTryItems(user.id) : [];

    return (
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
            <h1 className="font-display text-2xl text-sage-900">Your rank</h1>

            {unrankedMadeDishes.length > 0 && (
                <div className="mt-4 rounded-xl border border-sage-200 bg-sage-50/60 p-3">
                    <p className="text-sm font-medium text-sage-900">
                        {unrankedMadeDishes.length === 1
                            ? "You made this, but haven't ranked it yet"
                            : `You made ${unrankedMadeDishes.length} dishes you haven't ranked yet`}
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                        {unrankedMadeDishes.map((dish) => (
                            <li key={dish.id} className="flex items-center gap-3">
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sage-100">
                                    <Image
                                        src={dish.photoUrl}
                                        alt={dish.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-ink">{dish.name}</p>
                                    <p className="truncate text-xs text-ink/50">
                                        {dish.cuisine.name}
                                        {dish.makerId !== user.id && ` · made by ${dish.maker.name}`}
                                    </p>
                                </div>
                                <Link
                                    href={`/dishes/${dish.id}/rank`}
                                    className="shrink-0 rounded-full bg-sage-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-900"
                                >
                                    Rank it
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-4 flex gap-2 border-b border-sage-200">
                <Link
                    href={buildFilterHref("/", sp, { view: "made" })}
                    className={
                        view === "made"
                            ? "border-b-2 border-sage-600 px-1 pb-2 text-sm font-medium text-sage-900"
                            : "border-b-2 border-transparent px-1 pb-2 text-sm text-ink/60 hover:text-ink"
                    }
                >
                    Made
                </Link>
                <Link
                    href={buildFilterHref("/", sp, { view: "want_to_try" })}
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
                                            <Image
                                                src={item.photoUrl}
                                                alt={item.name}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-display text-lg text-ink">
                                            {item.name}
                                        </p>
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
                                    {item.addedById === user.id && (
                                        <Link
                                            href={`/want-to-try/${item.id}/edit`}
                                            className="shrink-0 text-sm text-ink/50 hover:text-ink"
                                        >
                                            Edit
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                <>
                    <DishFilterChips
                        basePath="/"
                        maker={maker}
                        cuisineId={sp.cuisineId}
                        tagId={sp.tagId}
                        hasOthersMade={hasOthersMade}
                        cuisineOptions={cuisineOptions}
                        tagOptions={tagOptions}
                    />

                    {allRatings.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
                            <p className="text-ink/70">
                                Nothing here yet. Log your first dish to get started.
                            </p>
                            <Link
                                href="/dishes/new"
                                className="mt-4 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
                            >
                                Log a dish
                            </Link>
                        </div>
                    ) : ratings.length === 0 ? (
                        <p className="mt-8 text-center text-sm text-ink/50">
                            Nothing matches these filters.
                        </p>
                    ) : (
                        <ol className="mt-4 flex flex-col gap-3">
                            {ratings.map((rating) => (
                                <li key={rating.id}>
                                    <Link
                                        href={`/dishes/${rating.dish.id}`}
                                        className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3 transition-colors hover:border-sage-600"
                                    >
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                                            <Image
                                                src={rating.dish.photoUrl}
                                                alt={rating.dish.name}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-display text-lg text-ink">
                                                {rating.dish.name}
                                            </p>
                                            <p className="truncate text-sm text-ink/60">
                                                {rating.dish.cuisine.name} · made by{" "}
                                                {rating.dish.maker.name}
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
