"use client";

import { useRef, useState, type ReactNode } from "react";

/** A real in-app confirmation modal, styled like the rest of the app —
 * not the browser's native confirm() dialog, which is an unstyled black
 * box that even exposes the raw host (localhost:3000, or the prod domain)
 * to the user. Renders its own hidden form so the trigger button can live
 * outside it and just open the modal instead of submitting immediately. */
export function ConfirmButton({
  action,
  confirmMessage,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  triggerLabel,
  triggerTitle,
  triggerClassName,
  danger = false,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  confirmLabel?: string;
  cancelLabel?: string;
  triggerLabel: ReactNode;
  triggerTitle?: string;
  triggerClassName?: string;
  danger?: boolean;
  /** Hidden <input> fields the form needs to submit. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={action}>
        {children}
      </form>
      <button type="button" title={triggerTitle} className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-cream p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-ink">{confirmMessage}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-sage-200 px-4 py-2 text-sm text-ink hover:border-sage-600"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  formRef.current?.requestSubmit();
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium text-white ${
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-sage-600 hover:bg-sage-900"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
