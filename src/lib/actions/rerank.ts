"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { swapAdjacentRatings, type Direction } from "@/lib/ranking";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

/** One round of the re-rank bubble check (spec §3) — see ranking.ts for
 * the algorithm writeup. */
export async function recordRerankComparison(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const dishId = String(formData.get("dishId"));
  const neighborRatingId = String(formData.get("neighborRatingId"));
  const direction = String(formData.get("direction")) as Direction;
  const winner = String(formData.get("winner")); // "self" | "neighbor"

  const selfRating = await prisma.rating.findUnique({ where: { userId_dishId: { userId, dishId } } });
  if (!selfRating) redirect(`/dishes/${dishId}`);

  if (direction === "up") {
    if (winner === "self") {
      // Beat the one above — move up and keep checking further up.
      await swapAdjacentRatings(selfRating.id, neighborRatingId);
      revalidatePath("/");
      redirect(`/dishes/${dishId}/rerank?dir=up`);
    }
    // Didn't beat the one above — that's expected/no change from this
    // side. Now make sure it isn't *also* worse than the one below.
    redirect(`/dishes/${dishId}/rerank?dir=down`);
  }

  // direction === "down"
  if (winner === "neighbor") {
    // Lost to the one below — move down and keep checking further down.
    await swapAdjacentRatings(selfRating.id, neighborRatingId);
    revalidatePath("/");
    redirect(`/dishes/${dishId}/rerank?dir=down`);
  }
  // Beat the one below too — correctly positioned, nothing left to do.
  revalidatePath("/");
  redirect(`/dishes/${dishId}`);
}
