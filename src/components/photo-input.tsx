"use client";

import { useState, type ChangeEvent } from "react";
import { MAX_PHOTO_BYTES, MAX_PHOTO_LABEL } from "@/lib/photo-limits";

/** A file input that warns and blocks submission the moment an oversized
 * photo is picked, rather than letting the upload fail server-side. Uses
 * the browser's own constraint validation (setCustomValidity) to actually
 * stop the form from submitting — same mechanism already used for
 * `required` fields elsewhere in these forms — plus a persistent inline
 * message so the reason is visible without waiting for a submit attempt. */
export function PhotoInput({
  name,
  required = false,
  className,
  onValidityChange,
}: {
  name: string;
  required?: boolean;
  className?: string;
  onValidityChange?: (tooLarge: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (file && file.size > MAX_PHOTO_BYTES) {
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
    <>
      <input
        type="file"
        name={name}
        accept="image/*"
        required={required}
        onChange={handleChange}
        className={className}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </>
  );
}
