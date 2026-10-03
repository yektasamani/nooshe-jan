"use client";

import { useState } from "react";
import { AvatarPhotoPicker } from "@/components/avatar-photo-picker";
import { SubmitButton } from "@/components/submit-button";

/** Any active member can set/change the pod's cover photo — same
 * symmetric-permission philosophy as the rest of pod management. Hover
 * the photo to change it; "Save" only appears once something's picked. */
export function PodPhotoForm({
  podId,
  podName,
  coverPhotoUrl,
  action,
}: {
  podId: string;
  podName: string;
  coverPhotoUrl: string | null;
  action: (formData: FormData) => void;
}) {
  const [hasFile, setHasFile] = useState(false);
  const [blocked, setBlocked] = useState(false);

  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="podId" value={podId} />
      <AvatarPhotoPicker
        name="photo"
        currentName={podName}
        currentPhotoUrl={coverPhotoUrl}
        size="lg"
        onPickedChange={setHasFile}
        onValidityChange={setBlocked}
      />
      {hasFile && (
        <SubmitButton
          pendingText="…"
          disabled={blocked}
          className="shrink-0 rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600 disabled:opacity-60"
        >
          Save photo
        </SubmitButton>
      )}
    </form>
  );
}
