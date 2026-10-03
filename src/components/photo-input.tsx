"use client";

import { useState, type ChangeEvent } from "react";
import { MAX_PHOTO_BYTES, MAX_PHOTO_LABEL } from "@/lib/photo-limits";
import { uploadImageFromBrowser } from "@/lib/upload-client";

/** A file input that uploads straight to Supabase Storage the moment a
 * valid photo is picked, rather than submitting the raw file through the
 * form (Vercel's serverless functions cap request bodies at 4.5MB, hard
 * limit, no plan raises it — see upload-client.ts). Reports back via
 * callbacks instead of rendering its own form field, since callers
 * decide what to submit and when (e.g. PhotoGalleryField only wants a
 * paired shape <select> to exist once a slot has actually finished
 * uploading). `onValidityChange` covers "blocks submission" broadly:
 * oversized, uploading, or failed — not just size, despite the name
 * staying from before file uploads moved client-side. */
export function PhotoInput({
  className,
  onValidityChange,
  onUploaded,
}: {
  className?: string;
  onValidityChange?: (blocked: boolean) => void;
  onUploaded?: (url: string | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onUploaded?.(null);

    if (!file) {
      setError(null);
      onValidityChange?.(false);
      return;
    }

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
    onValidityChange?.(false);
    onUploaded?.(result.url);
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={uploading}
        className={className}
      />
      {uploading && <p className="text-xs text-ink/50">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
