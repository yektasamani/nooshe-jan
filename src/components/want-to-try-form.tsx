"use client";

import { useState } from "react";
import { PhotoInput } from "@/components/photo-input";
import { SubmitButton } from "@/components/submit-button";

export function WantToTryForm({
  action,
  itemId,
  initialName,
  initialPhotoUrl,
  initialLink,
  initialPodId,
  memberships,
  submitLabel = "Add to the list",
  pendingLabel = "Adding…",
}: {
  action: (formData: FormData) => void;
  /** Present only in edit mode — included as a hidden field. */
  itemId?: string;
  initialName?: string;
  initialPhotoUrl?: string | null;
  initialLink?: string;
  initialPodId?: string | null;
  memberships: { pod: { id: string; name: string } }[];
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [photoTooLarge, setPhotoTooLarge] = useState(false);
  const isEdit = Boolean(itemId);

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      {itemId && <input type="hidden" name="id" value={itemId} />}

      <p className="text-xs text-ink/50">
        <span className="text-sage-600">*</span> Required
      </p>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">
          Name <span className="text-sage-600">*</span>
        </span>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialName}
          placeholder="Tahchin"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Photo</span>
        {initialPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initialPhotoUrl} alt="" className="h-24 w-24 rounded-lg object-cover" />
        )}
        <PhotoInput
          name="photo"
          onValidityChange={setPhotoTooLarge}
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink file:mr-3 file:rounded-full file:border-0 file:bg-sage-50 file:px-3 file:py-1.5 file:text-sage-900"
        />
        <span className="text-xs text-ink/50">
          {isEdit ? "Leave blank to keep the current photo." : "Add a photo or a link if you have one. Both optional."}
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Link</span>
        <input
          type="url"
          name="link"
          defaultValue={initialLink}
          placeholder="https:// (optional)"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      {memberships.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Pod (optional)</span>
          <select
            name="podId"
            defaultValue={initialPodId ?? ""}
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          >
            <option value="">Just for me</option>
            {memberships.map(({ pod }) => (
              <option key={pod.id} value={pod.id}>
                {pod.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <SubmitButton
        pendingText={pendingLabel}
        disabled={photoTooLarge}
        className="mt-2 w-fit rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
