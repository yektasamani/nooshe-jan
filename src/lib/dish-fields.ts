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

/** Upload a dish (or avatar) photo to the shared bucket (docs/INFRA_SETUP.md
 * §6) and return its public URL, or an error message. */
export async function uploadDishPhoto(
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
