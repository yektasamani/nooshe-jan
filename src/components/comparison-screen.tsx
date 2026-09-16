"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import type { RatingTier } from "@prisma/client";
import { recordComparison } from "@/lib/actions/ranking";

/**
 * The pairwise "which did you like more" screen — DESIGN.md calls this out
 * as the one interaction worth real design/motion energy: center-aligned,
 * ceremonial, closer to a card choice than a form. Both cards live in one
 * shared form (two submit buttons, differing only in their `winner`
 * value) so that clicking either one disables both immediately — no
 * window where the other card is still clickable mid-request.
 */
export function ComparisonScreen({
  dishId,
  dishName,
  dishPhotoUrl,
  opponentDishId,
  opponentName,
  opponentPhotoUrl,
  tier,
  lo,
  hi,
}: {
  dishId: string;
  dishName: string;
  dishPhotoUrl: string;
  opponentDishId: string;
  opponentName: string;
  opponentPhotoUrl: string;
  tier: RatingTier;
  lo: number;
  hi: number;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="font-display text-2xl text-sage-900 sm:text-3xl">Which did you like more?</h1>
      <p className="mt-2 text-sm text-ink/60">A quick call — we'll use it to slot the new dish in.</p>

      <form action={recordComparison} className="mt-10 flex w-full max-w-3xl flex-col items-center gap-6 sm:flex-row sm:justify-center">
        <input type="hidden" name="dishId" value={dishId} />
        <input type="hidden" name="opponentDishId" value={opponentDishId} />
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="lo" value={lo} />
        <input type="hidden" name="hi" value={hi} />

        <ComparisonCard name={dishName} photoUrl={dishPhotoUrl} winner="new" />
        <span className="font-display text-lg text-ink/40">vs</span>
        <ComparisonCard name={opponentName} photoUrl={opponentPhotoUrl} winner="opponent" />
      </form>
    </main>
  );
}

function ComparisonCard({
  name,
  photoUrl,
  winner,
}: {
  name: string;
  photoUrl: string;
  winner: "new" | "opponent";
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
