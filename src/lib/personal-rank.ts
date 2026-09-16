/** Shapes just narrow enough for the filter logic below — the actual
 * Prisma query includes more fields, which structurally satisfy these. */
export type FilterableRating = {
  dish: {
    makerId: string;
    cuisineId: string;
    cuisine: { id: string; name: string };
    tags: { tag: { id: string; name: string } }[];
  };
};

export type MakerFilter = "all" | "me" | "others";

/** Personal rank filter chips (spec §2.2: maker / cuisine / tags) —
 * chip options are derived from the *full* unfiltered set so the
 * available choices don't shrink away as filters get applied. */
export function deriveFilterOptions(ratings: FilterableRating[], viewerId: string) {
  const hasOthersMade = ratings.some((r) => r.dish.makerId !== viewerId);
  const cuisineOptions = [
    ...new Map(ratings.map((r) => [r.dish.cuisine.id, r.dish.cuisine.name])).entries(),
  ].map(([id, name]) => ({ id, name }));
  const tagOptions = [
    ...new Map(ratings.flatMap((r) => r.dish.tags.map(({ tag }) => [tag.id, tag.name] as const))).entries(),
  ].map(([id, name]) => ({ id, name }));

  return { hasOthersMade, cuisineOptions, tagOptions };
}

export function filterRatings<T extends FilterableRating>(
  ratings: T[],
  viewerId: string,
  filters: { maker: MakerFilter; cuisineId?: string; tagId?: string },
): T[] {
  return ratings.filter((r) => {
    if (filters.maker === "me" && r.dish.makerId !== viewerId) return false;
    if (filters.maker === "others" && r.dish.makerId === viewerId) return false;
    if (filters.cuisineId && r.dish.cuisineId !== filters.cuisineId) return false;
    if (filters.tagId && !r.dish.tags.some((t) => t.tag.id === filters.tagId)) return false;
    return true;
  });
}
