"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";

/** The avatar in the header — click opens Profile/Settings/Log out.
 * Separated from primary nav on purpose: this is "account stuff," not
 * "navigate the app." */
export function AccountMenu({
  userId,
  userName,
  avatarUrl,
  signOutAction,
}: {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block rounded-full"
      >
        <Avatar name={userName} avatarUrl={avatarUrl} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-xl border border-sage-200 bg-cream p-2 shadow-md">
          <p className="truncate px-3 py-1.5 text-sm font-medium text-ink">{userName}</p>
          <Link
            href={`/users/${userId}`}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-sage-50"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-sage-50"
          >
            Settings
          </Link>
          <Link
            href="/report-bug"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-sage-50"
          >
            Report a bug
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink/60 hover:bg-sage-50"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
