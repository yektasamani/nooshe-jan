/** Client-side-only ceiling now (photos upload straight to Supabase
 * Storage — see upload-client.ts — not through a Server Action), so this
 * isn't bounded by Vercel's request-body limit at all; it's just a
 * reasonable cap on an individual photo. */
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
export const MAX_PHOTO_LABEL = "20MB";
