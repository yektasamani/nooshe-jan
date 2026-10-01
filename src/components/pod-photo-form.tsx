"use client";

import { useState } from "react";
import { PhotoInput } from "@/components/photo-input";
import { SubmitButton } from "@/components/submit-button";

/** Any active member can set/change the pod's cover photo — same
 * symmetric-permission philosophy as the rest of pod management. */
export function PodPhotoForm({
  podId,
  action,
}: {
  podId: string;
  action: (formData: FormData) => void;
}) {
  const [photoTooLarge, setPhotoTooLarge] = useState(false);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="podId" value={podId} />
      <PhotoInput
        name="photo"
        onValidityChange={setPhotoTooLarge}
        className="text-xs text-ink file:mr-2 file:rounded-full file:border-0 file:bg-sage-50 file:px-2.5 file:py-1 file:text-xs file:text-sage-900"
      />
      <SubmitButton
        pendingText="…"
        disabled={photoTooLarge}
        className="shrink-0 rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600 disabled:opacity-60"
      >
        Save
      </SubmitButton>
    </form>
  );
}
