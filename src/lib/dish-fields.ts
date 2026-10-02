import type { SupabaseClient } from "@supabase/supabase-js";
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
 * paired `newPhotos`/`newPhotoShapes` fields from PhotoGalleryField,
 * skipping any slot left empty (an unfilled file input still submits an
 * empty File, not nothing). */
export function collectNewPhotos(formData: FormData): { file: File; shape: PhotoShape }[] {
  const files = formData.getAll("newPhotos") as File[];
  const shapes = formData.getAll("newPhotoShapes").map(String);
  const result: { file: File; shape: PhotoShape }[] = [];
  files.forEach((file, i) => {
    if (file instanceof File && file.size > 0) {
      result.push({ file, shape: shapes[i] === "ORIGINAL" ? "ORIGINAL" : "SQUARE" });
    }
  });
  return result;
}

/** Upload any user-provided image (dish photo, want-to-try photo, pod
 * cover, avatar) to the shared bucket (docs/INFRA_SETUP.md §6) and return
 * its public URL, or an error message. Generic despite living in this
 * file — kept here since dish photos were its original and still most
 * common use. */
export async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  photo: File,
): Promise<{ url: string } | { error: string }> {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_DISH_PHOTOS_BUCKET!;
  const ext = photo.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, photo);
  if (error) return { error: `Photo upload failed: ${error.message}` };
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}
