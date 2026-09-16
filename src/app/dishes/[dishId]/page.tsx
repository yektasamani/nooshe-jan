import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const TIER_LABEL: Record<string, string> = {
  LIKED: "Liked",
  OKAY: "Okay",
  DISLIKED: "Disliked",
};

export default async function DishDetailPage({ params }: { params: Promise<{ dishId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { dishId } = await params;
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: {
      cuisine: true,
      maker: true,
      eaters: { include: { user: true } },
      tags: { include: { tag: true } },
    },
  });
  if (!dish) notFound();

  // No pods/sharing yet (spec §5, still open) — for now a private dish is
  // visible only to its maker; a public one is visible to any signed-in user.
  if (dish.visibility === "PRIVATE" && dish.makerId !== user.id) notFound();

  const ratings = await prisma.rating.findMany({
    where: { dishId },
    include: { user: true },
    orderBy: { score: "desc" },
  });
  const myRating = ratings.find((r) => r.userId === user.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sage-50">
        <Image
          src={dish.photoUrl}
          alt={dish.name}
          fill
          sizes="(max-width: 672px) 100vw, 672px"
          className="object-cover"
          priority
        />
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-sage-900">{dish.name}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {dish.cuisine.name} · made by {dish.maker.name}
            {dish.visibility === "PRIVATE" && " · Private"}
          </p>
        </div>
        {myRating && (
          <span className="font-display shrink-0 text-3xl text-sage-600">{myRating.score.toFixed(1)}</span>
        )}
      </div>

      {ratings.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-ink/60">Scores</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ratings.map((rating) => (
              <li
                key={rating.id}
                className="flex items-center gap-2 rounded-full border border-sage-200 bg-white px-3 py-1.5 text-sm"
              >
                <span className="text-ink/80">{rating.user.name}</span>
                <span className="font-display text-sage-600">{rating.score.toFixed(1)}</span>
                <span className="text-xs text-ink/40">{TIER_LABEL[rating.tier]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dish.eaters.length > 0 && (
        <p className="mt-4 text-sm text-ink/60">
          Eaten by {dish.eaters.map((e) => e.user.name).join(", ")}
        </p>
      )}

      {dish.notes && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-ink/60">Notes</h2>
          <p className="mt-1 whitespace-pre-wrap text-ink">{dish.notes}</p>
        </div>
      )}

      {dish.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {dish.tags.map(({ tag }) => (
            <li key={tag.id} className="rounded-full bg-sage-50 px-3 py-1 text-xs text-sage-900">
              {tag.name}
            </li>
          ))}
        </ul>
      )}

      {dish.recipeUrl && (
        <p className="mt-4">
          <a
            href={dish.recipeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-sage-600 hover:text-sage-900"
          >
            View recipe
          </a>
        </p>
      )}

      {myRating && (
        <Link
          href={`/dishes/${dish.id}/rerank`}
          className="mt-8 inline-block rounded-full border border-sage-200 px-5 py-2.5 font-medium text-ink hover:border-sage-600"
        >
          Re-rank
        </Link>
      )}
    </main>
  );
}
