"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeedIcon, PodsIcon, WantToTryIcon, SearchIcon, PlusIcon } from "@/components/icons";

const LEFT_LINKS = [
  { href: "/feed", label: "Feed", Icon: FeedIcon },
  { href: "/pods", label: "Pods", Icon: PodsIcon },
];
const RIGHT_LINKS = [
  { href: "/want-to-try", label: "Want to try", Icon: WantToTryIcon },
  { href: "/search", label: "Find people", Icon: SearchIcon },
];

/** Fixed bottom tab bar, mobile only — "Log a dish" sits elevated in the
 * center since it's the core-loop action (spec: "fast beats thorough").
 * Account (profile/settings/log out) lives in the header's avatar menu
 * instead of down here — this bar is purely "navigate the app." */
export function BottomNav({ pendingInviteCount }: { pendingInviteCount: number }) {
  const pathname = usePathname();

  const tab = (href: string, label: string, Icon: typeof FeedIcon) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        aria-label={label}
        className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
          active ? "text-sage-900" : "text-ink/50"
        }`}
      >
        <span className="relative">
          <Icon className="h-5 w-5" />
          {href === "/pods" && pendingInviteCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-sage-600 text-[8px] text-white">
              {pendingInviteCount}
            </span>
          )}
        </span>
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex items-end border-t border-sage-200 bg-cream pb-[env(safe-area-inset-bottom)] sm:hidden">
      {LEFT_LINKS.map(({ href, label, Icon }) => tab(href, label, Icon))}

      <Link
        href="/dishes/new"
        aria-label="Log a dish"
        className="flex flex-1 flex-col items-center pb-2"
      >
        <span className="-mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-600 text-white shadow-md">
          <PlusIcon className="h-6 w-6" />
        </span>
      </Link>

      {RIGHT_LINKS.map(({ href, label, Icon }) => tab(href, label, Icon))}
    </nav>
  );
}
