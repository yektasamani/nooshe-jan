"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/pods", label: "Pods" },
  { href: "/want-to-try", label: "Want to try" },
];

/** Signed-in nav — inline links on wider screens, a dropdown menu on
 * phone width so 6 nav items never overflow (DESIGN.md: mobile-responsive
 * throughout). */
export function NavMenu({
  userName,
  signOutAction,
}: {
  userName: string;
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
      <nav className="hidden items-center gap-4 text-sm sm:flex">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-ink/70 hover:text-ink">
            {link.label}
          </Link>
        ))}
        <Link href="/dishes/new" className="font-medium text-sage-600 hover:text-sage-900">
          Log a dish
        </Link>
        <Link href="/profile" className="text-ink/60 hover:text-ink">
          {userName}
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="text-ink/60 hover:text-ink">
            Log out
          </button>
        </form>
      </nav>

      <div className="sm:hidden">
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-sage-200 text-ink"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-sage-200 bg-cream p-2 shadow-md">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-sage-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dishes/new"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-sage-600 hover:bg-sage-50"
            >
              Log a dish
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-sage-50"
            >
              {userName}
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
    </div>
  );
}
