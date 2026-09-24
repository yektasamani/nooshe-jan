"use client";

import { useActionState } from "react";
import { submitBugReport, type BugReportState } from "@/lib/actions/bug-reports";
import { SubmitButton } from "@/components/submit-button";

const initialState: BugReportState = {};

export function BugReportForm({ defaultPageUrl }: { defaultPageUrl?: string }) {
  const [state, formAction] = useActionState(submitBugReport, initialState);

  if (state.success) {
    return (
      <p className="mt-6 rounded-lg bg-sage-50 px-3.5 py-2.5 text-sm text-sage-900">
        Got it, thanks. I&apos;ll take a look.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">What happened?</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="What were you trying to do, and what went wrong?"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink/80">Page (optional)</span>
        <input
          type="text"
          name="pageUrl"
          defaultValue={defaultPageUrl}
          placeholder="Where were you when it happened?"
          className="rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
      )}

      <SubmitButton
        pendingText="Sending…"
        className="w-fit rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
      >
        Send report
      </SubmitButton>
    </form>
  );
}
