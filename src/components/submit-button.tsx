"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/** A submit button that shows pending feedback via useFormStatus — works
 * inside any <form action={serverAction}>, even when the form itself
 * lives in a Server Component. Spec principle: "Fast beats thorough" —
 * every core-loop action should read as effortless, which starts with
 * never leaving a click looking like it did nothing. */
export function SubmitButton({
  children,
  pendingText,
  className,
  disabled = false,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  /** Blocks submission for a reason outside form-status pending-ness —
   * e.g. an oversized photo picked via PhotoInput. */
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {pending ? (pendingText ?? "Saving…") : children}
    </button>
  );
}
