"use client";

import Image from "next/image";
import type { RatingTier } from "@prisma/client";
import { selectTier } from "@/lib/actions/ranking";
import { SubmitButton } from "@/components/submit-button";

const TIERS: { value: RatingTier; label: string }[] = [
  { value: "LIKED", label: "I liked it!" },
  { value: "OKAY", label: "It was okay" },
  { value: "DISLIKED", label: "I didn't like it" },
];

/** First step after logging a dish (Beli-style, not in the original spec):
 * a broad sentiment call before any pairwise comparisons. Comparisons that
 * follow are scoped to whichever tier gets picked here. */
export function TierPicker({
  dishId,
  dishName,
  dishPhotoUrl,
}: {
  dishId: string;
  dishName: string;
  dishPhotoUrl: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-sage-50">
        <Image src={dishPhotoUrl} alt={dishName} fill sizes="112px" className="object-cover" />
      </div>
      <h1 className="font-display mt-6 text-2xl text-sage-900 sm:text-3xl">{dishName}</h1>
      <p className="mt-2 text-sm text-ink/60">How was it, overall?</p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {TIERS.map((t) => (
          <form key={t.value} action={selectTier}>
            <input type="hidden" name="dishId" value={dishId} />
            <input type="hidden" name="tier" value={t.value} />
            <SubmitButton
              pendingText="…"
              className="w-full rounded-full border border-sage-200 bg-white px-5 py-3 font-medium text-ink transition-colors hover:border-sage-600 hover:bg-sage-50 disabled:opacity-60"
            >
              {t.label}
            </SubmitButton>
          </form>
        ))}
      </div>
    </main>
  );
}
