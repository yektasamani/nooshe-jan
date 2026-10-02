"use client";

import { useActionState, useState } from "react";
import { updateSettings, type SettingsState } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/submit-button";
import { AvatarPhotoPicker } from "@/components/avatar-photo-picker";

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
  const [photoTooLarge, setPhotoTooLarge] = useState(false);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Photo</span>
        <AvatarPhotoPicker
          name="avatar"
          currentName={currentName}
          currentPhotoUrl={avatarUrl}
          size="lg"
          onValidityChange={setPhotoTooLarge}
        />
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
