"use client";

import { useEffect, useState } from "react";
import { PhotoInput } from "@/components/photo-input";

export type ExistingDishPhoto = { id: string; url: string; displayShape: "SQUARE" | "ORIGINAL" };

/** Multi-photo picker for a dish, with a per-photo square-crop-vs-original
 * shape choice (spec extension — one photo forced into a square can look
 * worse than others, so it's a choice rather than a fixed rule). In
 * create mode there are no existing photos and the first slot can't be
 * removed, so "at least one photo" holds structurally; in edit mode,
 * removing photos is allowed but the parent form gets told via
 * onValidityChange if that would leave zero. */
export function PhotoGalleryField({
  existingPhotos = [],
  onValidityChange,
}: {
  existingPhotos?: ExistingDishPhoto[];
  onValidityChange?: (blocked: boolean) => void;
}) {
  const isCreateMode = existingPhotos.length === 0;
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [newSlots, setNewSlots] = useState<string[]>(isCreateMode ? ["0"] : []);
  const [nextSlotKey, setNextSlotKey] = useState(isCreateMode ? 1 : 0);
  const [oversizedSlots, setOversizedSlots] = useState<Record<string, boolean>>({});

  const survivingExistingCount = existingPhotos.filter((p) => !removedIds.has(p.id)).length;
  const noPhotosLeft = survivingExistingCount === 0 && newSlots.length === 0;
  const anyOversized = Object.values(oversizedSlots).some(Boolean);

  useEffect(() => {
    onValidityChange?.(noPhotosLeft || anyOversized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noPhotosLeft, anyOversized]);

  function removeExisting(id: string) {
    setRemovedIds((prev) => new Set(prev).add(id));
  }

  function addSlot() {
    setNewSlots((prev) => [...prev, String(nextSlotKey)]);
    setNextSlotKey((n) => n + 1);
  }

  function removeSlot(key: string) {
    setNewSlots((prev) => prev.filter((k) => k !== key));
    setOversizedSlots((prev) => {
      const next = { ...prev };
      delete next[`new-${key}`];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {survivingExistingCount > 0 && (
        <div className="flex flex-wrap gap-3">
          {existingPhotos
            .filter((p) => !removedIds.has(p.id))
            .map((photo) => (
              <div
                key={photo.id}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-sage-200 bg-white p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="h-20 w-20 rounded-md object-cover" />
                <select
                  name={`photoShape_${photo.id}`}
                  defaultValue={photo.displayShape}
                  className="rounded border border-sage-200 bg-white px-1.5 py-1 text-xs text-ink"
                >
                  <option value="SQUARE">Square crop</option>
                  <option value="ORIGINAL">Original shape</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeExisting(photo.id)}
                  className="text-xs text-ink/40 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
      )}

      {[...removedIds].map((id) => (
        <input key={id} type="hidden" name="removePhotoIds" value={id} />
      ))}

      {newSlots.map((key, i) => (
        <div key={key} className="flex items-start gap-2 rounded-lg border border-sage-200 bg-white p-2">
          <div className="flex-1">
            <PhotoInput
              name="newPhotos"
              onValidityChange={(tooLarge) =>
                setOversizedSlots((prev) => ({ ...prev, [`new-${key}`]: tooLarge }))
              }
              className="text-sm text-ink file:mr-2 file:rounded-full file:border-0 file:bg-sage-50 file:px-2.5 file:py-1 file:text-xs file:text-sage-900"
            />
          </div>
          <select
            name="newPhotoShapes"
            defaultValue="SQUARE"
            className="rounded border border-sage-200 bg-white px-1.5 py-1.5 text-xs text-ink"
          >
            <option value="SQUARE">Square crop</option>
            <option value="ORIGINAL">Original shape</option>
          </select>
          {!(isCreateMode && i === 0) && (
            <button
              type="button"
              onClick={() => removeSlot(key)}
              className="mt-1.5 text-xs text-ink/40 hover:text-red-600"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addSlot}
        className="w-fit rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600"
      >
        + Add another photo
      </button>

      {noPhotosLeft && <p className="text-xs text-red-600">Keep at least one photo.</p>}
      <span className="text-xs text-ink/50">
        Square crop keeps thumbnails consistent; original shows the photo as taken.
      </span>
    </div>
  );
}
