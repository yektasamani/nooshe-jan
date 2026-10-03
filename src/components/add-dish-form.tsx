"use client";

import { useActionState, useState } from "react";
import type { CreateDishState } from "@/lib/actions/dishes";
import { PhotoGalleryField, type ExistingDishPhoto } from "@/components/photo-gallery-field";

const initialState: CreateDishState = {};

export function AddDishForm({
  action,
  regions,
  privateByDefault,
  dishId,
  wantToTryId,
  currentUserName,
  podMates,
  initialName,
  initialPhotos = [],
  initialRegionId,
  initialCuisineName,
  initialNotes,
  initialTags,
  initialRecipeUrl,
  initialCookDate,
  initialVisibility,
  initialEatSelf = true,
  initialSelectedEaterIds = [],
  initialSelectedCoMakerIds = [],
  submitLabel = "Log a dish",
  pendingLabel = "Saving…",
}: {
  action: (prevState: CreateDishState, formData: FormData) => Promise<CreateDishState>;
  regions: { id: string; name: string }[];
  privateByDefault: boolean;
  /** Present only in edit mode — included as a hidden field. */
  dishId?: string;
  wantToTryId?: string;
  currentUserName: string;
  podMates: { id: string; name: string }[];
  initialName?: string;
  /** Edit mode only — existing photos, each editable/removable in place. */
  initialPhotos?: ExistingDishPhoto[];
  initialRegionId?: string;
  initialCuisineName?: string;
  initialNotes?: string;
  initialTags?: string;
  initialRecipeUrl?: string;
  initialCookDate?: string;
  initialVisibility?: "PUBLIC" | "PRIVATE";
  initialEatSelf?: boolean;
  initialSelectedEaterIds?: string[];
  initialSelectedCoMakerIds?: string[];
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [photoBlocked, setPhotoBlocked] = useState(false);
  const isEdit = Boolean(dishId);
  const isPrivateDefault = initialVisibility ? initialVisibility === "PRIVATE" : privateByDefault;

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {dishId && <input type="hidden" name="dishId" value={dishId} />}
      {wantToTryId && <input type="hidden" name="wantToTryId" value={wantToTryId} />}

      <p className="text-xs text-ink/50">
        <span className="text-sage-600">*</span> Required
      </p>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">
          Dish name <span className="text-sage-600">*</span>
        </span>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialName}
          placeholder="Ghormeh sabzi"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">
          Photos {!isEdit && <span className="text-sage-600">*</span>}
        </span>
        <PhotoGalleryField existingPhotos={initialPhotos} onValidityChange={setPhotoBlocked} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink/80">
            Cuisine region <span className="text-sage-600">*</span>
          </span>
          <select
            name="regionId"
            required
            defaultValue={initialRegionId ?? ""}
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
            defaultValue={initialCuisineName}
            placeholder="Persian (optional)"
            className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-ink/80">Who ate it</legend>
        <div className="flex flex-col gap-1.5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="eatSelf" value="on" defaultChecked={initialEatSelf} />
            {currentUserName} (you)
          </label>
          {podMates.map((mate) => (
            <label key={mate.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="eaterIds"
                value={mate.id}
                defaultChecked={initialSelectedEaterIds.includes(mate.id)}
              />
              {mate.name}
            </label>
          ))}
        </div>
        {podMates.length === 0 && (
          <span className="text-xs text-ink/50">Join a pod to tag others who ate it.</span>
        )}
      </fieldset>

      {podMates.length > 0 && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium text-ink/80">Cooked with</legend>
          <div className="flex flex-col gap-1.5 text-sm">
            {podMates.map((mate) => (
              <label key={mate.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="coMakerIds"
                  value={mate.id}
                  defaultChecked={initialSelectedCoMakerIds.includes(mate.id)}
                />
                {mate.name}
              </label>
            ))}
          </div>
          <span className="text-xs text-ink/50">
            If someone helped make this, they can rank it in their own list too.
          </span>
        </fieldset>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialNotes}
          placeholder="Anything worth remembering about it"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Tags</span>
        <input
          type="text"
          name="tags"
          defaultValue={initialTags}
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
          defaultValue={initialCookDate}
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-ink/80">Visibility</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="PUBLIC" defaultChecked={!isPrivateDefault} />
            Public
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="PRIVATE" defaultChecked={isPrivateDefault} />
            Private
          </label>
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || photoBlocked}
        className="mt-2 rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
