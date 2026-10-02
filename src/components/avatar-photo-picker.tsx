"use client";

import { useState, type ChangeEvent } from "react";
import { Avatar, AVATAR_SIZE_CLASSES } from "@/components/avatar";
import { MAX_PHOTO_BYTES, MAX_PHOTO_LABEL } from "@/lib/photo-limits";

/** Click-the-photo-to-edit pattern for an avatar-shaped image (pod cover,
 * user avatar) — replaces a bare "Choose File" input, which read as
 * confusing/unstyled next to a circular photo. Hover reveals an "Edit"
 * overlay; picking a file swaps in a local preview immediately. The
 * parent still owns the actual <form>/submit button (via onFileChange,
 * so it can show its own Save control only once a file's picked) since
 * this can live inside a bigger form (Settings) or its own small one
 * (pod cover). */
export function AvatarPhotoPicker({
  name,
  currentName,
  currentPhotoUrl,
  size = "lg",
  onFileChange,
  onValidityChange,
}: {
  name: string;
  currentName: string;
  currentPhotoUrl: string | null;
  size?: "sm" | "md" | "lg";
  onFileChange?: (file: File | null) => void;
  onValidityChange?: (tooLarge: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileChange?.(file);

    if (!file) {
      setPreview(null);
      setError(null);
      onValidityChange?.(false);
      return;
    }

    setPreview(URL.createObjectURL(file));
    if (file.size > MAX_PHOTO_BYTES) {
      const message = `That photo is too big (over ${MAX_PHOTO_LABEL}). Pick a smaller one.`;
      setError(message);
      e.target.setCustomValidity(message);
      onValidityChange?.(true);
    } else {
      setError(null);
      e.target.setCustomValidity("");
      onValidityChange?.(false);
    }
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
          name={name}
          accept="image/*"
          onChange={handleChange}
          className="sr-only"
        />
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
