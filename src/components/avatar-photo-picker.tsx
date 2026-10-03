"use client";

import { useState, type ChangeEvent } from "react";
import { Avatar, AVATAR_SIZE_CLASSES } from "@/components/avatar";
import { MAX_PHOTO_BYTES, MAX_PHOTO_LABEL } from "@/lib/photo-limits";
import { uploadImageFromBrowser } from "@/lib/upload-client";

/** Click-the-photo-to-edit pattern for an avatar-shaped image (pod cover,
 * user avatar) — replaces a bare "Choose File" input, which read as
 * confusing/unstyled next to a circular photo. Hover reveals an "Edit"
 * overlay; picking a file shows a local preview immediately and uploads
 * straight to Storage in the background (Vercel's 4.5MB serverless body
 * limit means the file can't ride through the form/Server Action
 * anymore — see upload-client.ts). The parent still owns the actual
 * <form>/submit button (via onPickedChange, so it can show its own Save
 * control only once something's picked) since this can live inside a
 * bigger form (Settings) or its own small one (pod cover). */
export function AvatarPhotoPicker({
  name,
  currentName,
  currentPhotoUrl,
  size = "lg",
  onPickedChange,
  onValidityChange,
}: {
  name: string;
  currentName: string;
  currentPhotoUrl: string | null;
  size?: "sm" | "md" | "lg";
  onPickedChange?: (picked: boolean) => void;
  onValidityChange?: (blocked: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setUploadedUrl(null);
    onPickedChange?.(Boolean(file));

    if (!file) {
      setPreview(null);
      setError(null);
      onValidityChange?.(false);
      return;
    }

    setPreview(URL.createObjectURL(file));

    if (file.size > MAX_PHOTO_BYTES) {
      setError(`That photo is too big (over ${MAX_PHOTO_LABEL}). Pick a smaller one.`);
      onValidityChange?.(true);
      return;
    }

    setError(null);
    setUploading(true);
    onValidityChange?.(true);
    const result = await uploadImageFromBrowser(file);
    setUploading(false);

    if ("error" in result) {
      setError(result.error);
      onValidityChange?.(true);
      return;
    }
    setUploadedUrl(result.url);
    onValidityChange?.(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`group relative block w-fit cursor-pointer rounded-full ${AVATAR_SIZE_CLASSES[size]}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={currentName} className="h-full w-full rounded-full object-cover" />
        ) : (
          <Avatar name={currentName} avatarUrl={currentPhotoUrl} size={size} />
        )}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/0 text-xs font-medium text-transparent transition-colors group-hover:bg-ink/40 group-hover:text-white">
          Edit
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
          className="sr-only"
        />
      </label>
      {uploadedUrl && <input type="hidden" name={name} value={uploadedUrl} />}
      {uploading && <p className="text-xs text-ink/50">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
