"use client";

import { deleteDish } from "@/lib/actions/dishes";
import { ConfirmButton } from "@/components/confirm-button";

export function DeleteDishButton({ dishId, dishName }: { dishId: string; dishName: string }) {
  return (
    <ConfirmButton
      action={deleteDish}
      confirmMessage={`Delete "${dishName}"? This can't be undone.`}
      confirmLabel="Delete"
      triggerLabel="Delete dish"
      triggerClassName="rounded-full border border-red-200 px-5 py-2.5 font-medium text-red-600 hover:bg-red-50"
      danger
    >
      <input type="hidden" name="dishId" value={dishId} />
    </ConfirmButton>
  );
}
