"use client";

import { createClient } from "@/lib/supabase/client";

export type UploadResult = { url: string } | { error: string };

/** Uploads an image straight from the browser to Supabase Storage,
 * bypassing the Next.js server entirely — Vercel enforces a hard,
 * non-configurable 4.5MB request body limit on serverless functions (no
 * plan raises it, including Enterprise), so routing file bytes through a
 * Server Action breaks for any real-sized photo once deployed, even
 * though it works fine locally. The server action that eventually saves
 * the resulting URL to the database re-validates it (isOwnedImageUrl in
 * dish-fields.ts) before trusting it, since it never sees the file
 * itself anymore. */
export async function uploadImageFromBrowser(file: File): Promise<UploadResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in to upload a photo." };

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_DISH_PHOTOS_BUCKET!;
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return { error: `Photo upload failed: ${error.message}` };
  return { url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl };
}
