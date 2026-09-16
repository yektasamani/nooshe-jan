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
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (pendingText ?? "Saving…") : children}
    </button>
  );
}
