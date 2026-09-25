"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { FeedIcon, PodsIcon, WantToTryIcon, SearchIcon, PlusIcon } from "@/components/icons";

const LINKS = [
  { href: "/feed", label: "Feed", Icon: FeedIcon },
  { href: "/pods", label: "Pods", Icon: PodsIcon },
  { href: "/want-to-try", label: "Want to try", Icon: WantToTryIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
];

/** Persistent left nav on wider screens — an actual app shell (fills
 * vertical space, icon + label rows) instead of a cramped top bar that
 * reads as "a website with a thin header." Hidden below sm; mobile keeps
 * its own header + bottom tab bar untouched. */
export function Sidebar({
  userId,
  userName,
  avatarUrl,
  signOutAction,
  pendingInviteCount,
}: {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  signOutAction: () => Promise<void>;
  pendingInviteCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden shrink-0 flex-col border-r border-sage-200 px-4 py-6 sm:flex sm:w-60">
      <Link href="/" className="font-display px-2 text-xl text-sage-900">
        Nooshe Jan
      </Link>

      <Link
        href="/dishes/new"
        className="mt-6 flex items-center justify-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 font-medium text-white hover:bg-sage-900"
      >
        <PlusIcon className="h-4 w-4" />
        Log a dish
      </Link>

      <nav className="mt-6 flex flex-col gap-1">
        {LINKS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                active ? "bg-sage-50 font-medium text-sage-900" : "text-ink/70 hover:bg-sage-50 hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
              {href === "/pods" && pendingInviteCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sage-600 px-1 text-xs font-medium text-white">
                  {pendingInviteCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-sage-200 pt-4">
        <Link
          href={`/users/${userId}`}
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sage-50"
        >
          <Avatar name={userName} avatarUrl={avatarUrl} size="sm" />
          <span className="truncate text-sm text-ink">{userName}</span>
        </Link>
        <Link href="/settings" className="rounded-lg px-2 py-1.5 text-sm text-ink/60 hover:bg-sage-50 hover:text-ink">
          Settings
        </Link>
        <Link
          href="/report-bug"
          className="rounded-lg px-2 py-1.5 text-sm text-ink/60 hover:bg-sage-50 hover:text-ink"
        >
          Report a bug
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-ink/60 hover:bg-sage-50 hover:text-ink"
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
