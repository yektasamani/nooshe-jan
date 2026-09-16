"use client";

import { useActionState } from "react";
import { createDish, type CreateDishState } from "@/lib/actions/dishes";

const initialState: CreateDishState = {};

export function AddDishForm({
  regions,
  privateByDefault,
  initialName,
  initialRecipeUrl,
  wantToTryId,
  currentUserName,
  podMates,
}: {
  regions: { id: string; name: string }[];
  privateByDefault: boolean;
  initialName?: string;
  initialRecipeUrl?: string;
  wantToTryId?: string;
  currentUserName: string;
  podMates: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createDish, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {wantToTryId && <input type="hidden" name="wantToTryId" value={wantToTryId} />}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Dish name</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialName}
          placeholder="Ghormeh sabzi"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Photo</span>
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink file:mr-3 file:rounded-full file:border-0 file:bg-sage-50 file:px-3 file:py-1.5 file:text-sage-900"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Cuisine region</span>
          <select
            name="regionId"
            required
            defaultValue=""
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          >
            <option value="" disabled>
              Choose one
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">Specific cuisine</span>
          <input
            type="text"
            name="cuisineName"
            placeholder="Persian (optional)"
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-ink/80">Who ate it</legend>
        <div className="flex flex-col gap-1.5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="eatSelf" value="on" defaultChecked />
            {currentUserName} (you)
          </label>
          {podMates.map((mate) => (
            <label key={mate.id} className="flex items-center gap-2">
              <input type="checkbox" name="eaterIds" value={mate.id} />
              {mate.name}
            </label>
          ))}
        </div>
        {podMates.length === 0 && (
          <span className="text-xs text-ink/50">Join a pod to tag others who ate it.</span>
        )}
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Notes</span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Anything worth remembering about it"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Tags</span>
        <input
          type="text"
          name="tags"
          placeholder="comfort food, weeknight, spicy"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
        <span className="text-xs text-ink/50">Comma-separated</span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Recipe link</span>
        <input
          type="url"
          name="recipeUrl"
          defaultValue={initialRecipeUrl}
          placeholder="https:// (optional)"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Cook date</span>
        <input
          type="date"
          name="cookDate"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-ink/80">Visibility</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="PUBLIC"
              defaultChecked={!privateByDefault}
            />
            Public
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="PRIVATE"
              defaultChecked={privateByDefault}
            />
            Private
          </label>
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Log a dish"}
      </button>
    </form>
  );
}
