/** Kept comfortably under the 50mb total request-body limit in
 * next.config.ts (serverActions.bodySizeLimit / proxyClientMaxBodySize).
 * A dish can have several photos in one submission, not just one, so the
 * total limit has to cover multiple photos at this size, not just a
 * single one plus a little overhead. */
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
export const MAX_PHOTO_LABEL = "20MB";

export function isPhotoTooLarge(file: File): boolean {
  return file.size > MAX_PHOTO_BYTES;
}
