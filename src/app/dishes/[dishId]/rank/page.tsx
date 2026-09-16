import { redirect } from "next/navigation";
import type { RatingTier } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { buildComparisonPool } from "@/lib/ranking";
import { ComparisonScreen } from "@/components/comparison-screen";
import { TierPicker } from "@/components/tier-picker";

function isRatingTier(value: string | undefined): value is RatingTier {
  return value === "LIKED" || value === "OKAY" || value === "DISLIKED";
}

export default async function RankDishPage({
  params,
  searchParams,
}: {
  params: Promise<{ dishId: string }>;
  searchParams: Promise<{ tier?: string; lo?: string; hi?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { dishId } = await params;
  const dish = await prisma.dish.findUnique({ where: { id: dishId }, include: { cuisine: true } });
  if (!dish || dish.makerId !== user.id) redirect("/");

  const alreadyRanked = await prisma.rating.findUnique({
    where: { userId_dishId: { userId: user.id, dishId } },
  });
  if (alreadyRanked) redirect("/");

  const { tier: tierParam, lo: loParam, hi: hiParam } = await searchParams;

  if (!isRatingTier(tierParam)) {
    return <TierPicker dishId={dish.id} dishName={dish.name} dishPhotoUrl={dish.photoUrl} />;
  }

  const pool = await buildComparisonPool(user.id, dish, tierParam);
  const lo = Number(loParam ?? 0);
  const hi = Number(hiParam ?? pool.length);
  const mid = Math.floor((lo + hi) / 2);
  const opponent = pool[mid];

  if (!opponent) redirect("/");

  return (
    <ComparisonScreen
      dishId={dish.id}
      dishName={dish.name}
      dishPhotoUrl={dish.photoUrl}
      opponentDishId={opponent.dishId}
      opponentName={opponent.dishName}
      opponentPhotoUrl={opponent.photoUrl}
      tier={tierParam}
      lo={lo}
      hi={hi}
    />
  );
}
