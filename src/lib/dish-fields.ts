import { prisma } from "@/lib/prisma";

/** Resolve/create the cuisine — search-or-create, always nested under the
 * chosen top-level region (spec §1/§4). If no specific cuisine name was
 * given, the dish is just tagged with the region itself. */
export async function resolveCuisineId(regionId: string, cuisineName: string): Promise<string> {
  if (!cuisineName) return regionId;
  const existing = await prisma.cuisine.findFirst({
    where: { name: { equals: cuisineName, mode: "insensitive" }, parentId: regionId },
  });
  return existing
    ? existing.id
    : (await prisma.cuisine.create({ data: { name: cuisineName, parentId: regionId } })).id;
}

/** Tags — freeform, comma-separated, search-or-create (spec §1). */
export async function resolveTagIds(tagsRaw: string): Promise<string[]> {
  const tagNames = [...new Set(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))];
  const tagIds: string[] = [];
  for (const tagName of tagNames) {
    const existing = await prisma.tag.findFirst({
      where: { name: { equals: tagName, mode: "insensitive" } },
    });
    const tag = existing ?? (await prisma.tag.create({ data: { name: tagName } }));
    tagIds.push(tag.id);
  }
  return tagIds;
}

/** Same visibility rule used on the dish detail page: a PRIVATE dish is
 * only visible to whoever made, co-made, or ate it; PUBLIC is visible to
 * any signed-in user. Shared here so reaction actions (likes/comments)
 * and ranking access gate on the exact same rule as viewing the dish
 * itself. */
export function canViewDish(
  dish: {
    visibility: "PUBLIC" | "PRIVATE";
    makerId: string;
    coMakers: { userId: string }[];
    eaters: { userId: string }[];
  },
  userId: string,
): boolean {
  if (dish.visibility === "PUBLIC") return true;
  return (
    dish.makerId === userId ||
    dish.coMakers.some((c) => c.userId === userId) ||
    dish.eaters.some((e) => e.userId === userId)
  );
}

/** Who's allowed to rank a dish in their own personal list: the maker,
 * any co-maker, or anyone who ate it (spec intent: the point is for
 * whoever actually had the dish to be able to rank it, not just whoever
 * made or helped make it). */
export function canRankDish(
  dish: { makerId: string; coMakers: { userId: string }[]; eaters: { userId: string }[] },
  userId: string,
): boolean {
  return (
    dish.makerId === userId ||
    dish.coMakers.some((c) => c.userId === userId) ||
    dish.eaters.some((e) => e.userId === userId)
  );
}

export type PhotoShape = "SQUARE" | "ORIGINAL";

/** Pulls the "new photos" slots out of a dish create/edit submission —
 * paired `newPhotoUrls`/`newPhotoShapes` fields from PhotoGalleryField.
 * Photos are uploaded client-side (see src/lib/upload-client.ts) before
 * the form ever submits, so this receives already-uploaded URLs, not raw
 * files — each one still gets checked with isOwnedImageUrl before it's
 * trusted enough to save. */
export function collectNewPhotos(formData: FormData): { url: string; shape: PhotoShape }[] {
  const urls = formData.getAll("newPhotoUrls").map(String);
  const shapes = formData.getAll("newPhotoShapes").map(String);
  return urls
    .filter(Boolean)
    .map((url, i) => ({ url, shape: shapes[i] === "ORIGINAL" ? "ORIGINAL" : ("SQUARE" as PhotoShape) }));
}

/** Validates a client-submitted photo URL actually points to this user's
 * own folder in our own bucket, before trusting it enough to save to the
 * database. Necessary because uploads now happen directly from the
 * browser to Supabase Storage (Vercel's serverless functions enforce a
 * hard 4.5MB request body limit, so routing file bytes through a Server
 * Action breaks for any real-sized photo in production) — the server
 * action only ever sees the resulting URL, never the file itself, so it
 * can no longer trust it by construction the way it could when it did
 * the upload itself. */
export function isOwnedImageUrl(url: string, userId: string): boolean {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_DISH_PHOTOS_BUCKET;
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${userId}/`;
  return url.startsWith(base);
}
