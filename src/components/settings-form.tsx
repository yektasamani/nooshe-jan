"use client";

import { useActionState, useState } from "react";
import { updateSettings, type SettingsState } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { PhotoInput } from "@/components/photo-input";
import { Avatar } from "@/components/avatar";

const initialState: SettingsState = {};

export function SettingsForm({
  currentName,
  avatarUrl,
  privateByDefault,
}: {
  currentName: string;
  avatarUrl: string | null;
  privateByDefault: boolean;
}) {
  const [state, formAction] = useActionState(updateSettings, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoTooLarge, setPhotoTooLarge] = useState(false);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Photo</span>
        <div className="flex items-center gap-4">
          {preview ? (
            // Plain <img> for the local blob: preview — next/image can't
            // optimize a blob URL (it only handles http(s) remote images
            // or same-origin paths), and this is a transient client-only
            // preview anyway, never sent anywhere.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={currentName}
              className="h-24 w-24 shrink-0 rounded-full object-cover"
            />
          ) : (
            <Avatar name={currentName} avatarUrl={avatarUrl} size="lg" />
          )}
          <PhotoInput
            name="avatar"
            onFileSelected={(file) => setPreview(file ? URL.createObjectURL(file) : null)}
            onValidityChange={setPhotoTooLarge}
            className="text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-sage-50 file:px-3 file:py-1.5 file:text-sage-900"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Name</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={currentName}
          className="max-w-sm rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="privateByDefault" defaultChecked={privateByDefault} className="mt-1" />
        <span className="text-ink/80">
          Make my dishes private by default
          <span className="block text-xs text-ink/50">
            Only applies going forward. It won&apos;t change dishes you&apos;ve already logged.
          </span>
        </span>
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-sage-50 px-3.5 py-2.5 text-sm text-sage-900">Saved.</p>
      )}

      <SubmitButton
        pendingText="Saving…"
        disabled={photoTooLarge}
        className="w-fit rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
      >
        Save changes
      </SubmitButton>
    </form>
  );
}
