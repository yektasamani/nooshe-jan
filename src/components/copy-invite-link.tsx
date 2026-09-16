"use client";

import { useState } from "react";

export function CopyInviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-lg border border-sage-200 bg-sage-50 px-3 py-2 text-sm text-ink/70"
      />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 rounded-full border border-sage-200 px-4 py-2 text-sm font-medium text-ink hover:border-sage-600"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
