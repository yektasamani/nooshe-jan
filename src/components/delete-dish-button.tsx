"use client";

import { deleteDish } from "@/lib/actions/dishes";
import { SubmitButton } from "@/components/submit-button";

export function DeleteDishButton({ dishId, dishName }: { dishId: string; dishName: string }) {
  return (
    <form
      action={deleteDish}
      onSubmit={(e) => {
        if (!confirm(`Delete "${dishName}"? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="dishId" value={dishId} />
      <SubmitButton
        pendingText="Deleting…"
        className="rounded-full border border-red-200 px-5 py-2.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        Delete dish
      </SubmitButton>
    </form>
  );
}
