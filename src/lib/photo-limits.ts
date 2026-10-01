/** Kept comfortably under the 15mb total request-body limit in
 * next.config.ts (serverActions.bodySizeLimit / proxyClientMaxBodySize) —
 * a photo this size still leaves headroom for the rest of the form and
 * multipart overhead, so we never hit that limit server-side again. */
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
export const MAX_PHOTO_LABEL = "12MB";

export function isPhotoTooLarge(file: File): boolean {
  return file.size > MAX_PHOTO_BYTES;
}
