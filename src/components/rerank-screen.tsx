"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import type { Direction } from "@/lib/ranking";
import { recordRerankComparison } from "@/lib/actions/rerank";

/** Re-rank's neighbor-only comparison (spec §3) — same visual language as
 * the initial ComparisonScreen, phrased around "still holds up" instead of
 * a cold "which do you like more," since this is re-checking a dish
 * that's already ranked, not placing a brand new one. Both cards share one
 * form (two submit buttons) so clicking either disables both immediately. */
export function RerankScreen({
  dishId,
  dishName,
  dishPhotoUrl,
  neighborRatingId,
  neighborName,
  neighborPhotoUrl,
  direction,
}: {
  dishId: string;
  dishName: string;
  dishPhotoUrl: string;
  neighborRatingId: string;
  neighborName: string;
  neighborPhotoUrl: string;
  direction: Direction;
}) {
  const prompt =
    direction === "up"
      ? `Do you like ${dishName} more than ${neighborName} now?`
      : `Do you still like ${dishName} more than ${neighborName}?`;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="font-display text-2xl text-sage-900 sm:text-3xl">{prompt}</h1>
      <p className="mt-2 text-sm text-ink/60">Checking it against what's right next to it.</p>

      <form
        action={recordRerankComparison}
        className="mt-10 flex w-full max-w-3xl flex-col items-center gap-6 sm:flex-row sm:justify-center"
      >
        <input type="hidden" name="dishId" value={dishId} />
        <input type="hidden" name="neighborRatingId" value={neighborRatingId} />
        <input type="hidden" name="direction" value={direction} />

        <RerankCard name={dishName} photoUrl={dishPhotoUrl} winner="self" />
        <span className="font-display text-lg text-ink/40">vs</span>
        <RerankCard name={neighborName} photoUrl={neighborPhotoUrl} winner="neighbor" />
      </form>
    </main>
  );
}

function RerankCard({
  name,
  photoUrl,
  winner,
}: {
  name: string;
  photoUrl: string;
  winner: "self" | "neighbor";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="winner"
      value={winner}
      disabled={pending}
      className="group w-full max-w-xs overflow-hidden rounded-2xl border border-sage-200 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-sage-600 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 sm:w-64"
    >
      <div className="relative aspect-square w-full bg-sage-50">
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 90vw, 256px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <p className="font-display px-4 py-3 text-lg text-ink">{name}</p>
    </button>
  );
}
