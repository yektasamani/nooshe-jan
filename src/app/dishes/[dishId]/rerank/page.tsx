import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getAdjacentSameTierRating, type Direction } from "@/lib/ranking";
import { RerankScreen } from "@/components/rerank-screen";

export default async function RerankPage({
  params,
  searchParams,
}: {
  params: Promise<{ dishId: string }>;
  searchParams: Promise<{ dir?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { dishId } = await params;
  const dish = await prisma.dish.findUnique({ where: { id: dishId } });
  if (!dish) redirect("/");

  const selfRating = await prisma.rating.findUnique({ where: { userId_dishId: { userId: user.id, dishId } } });
  if (!selfRating) redirect(`/dishes/${dishId}`); // nothing to re-rank yet

  const direction: Direction = (await searchParams).dir === "down" ? "down" : "up";
  const neighbor = await getAdjacentSameTierRating(user.id, selfRating.position, selfRating.tier, direction);

  if (!neighbor) {
    // No neighbor in this direction (top/bottom of its tier). "up" falls
    // through to check "down"; "down" having nothing left means we're done.
    redirect(direction === "up" ? `/dishes/${dishId}/rerank?dir=down` : `/dishes/${dishId}`);
  }

  return (
    <RerankScreen
      dishId={dish.id}
      dishName={dish.name}
      dishPhotoUrl={dish.photoUrl}
      neighborRatingId={neighbor.id}
      neighborName={neighbor.dish.name}
      neighborPhotoUrl={neighbor.dish.photoUrl}
      direction={direction}
    />
  );
}
