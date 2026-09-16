"use client";

import { useRef } from "react";
import { updatePrivacyDefault } from "@/lib/actions/profile";

export function PrivacyToggle({ initialValue }: { initialValue: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updatePrivacyDefault} className="mt-3 flex items-start gap-3">
      <input
        type="checkbox"
        name="privateByDefault"
        id="privateByDefault"
        defaultChecked={initialValue}
        onChange={() => formRef.current?.requestSubmit()}
        className="mt-1"
      />
      <label htmlFor="privateByDefault" className="text-sm text-ink/80">
        Make my dishes private by default
        <span className="block text-xs text-ink/50">
          Only applies going forward — doesn't change dishes you've already logged.
        </span>
      </label>
    </form>
  );
}
