import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { signOut } from "@/lib/actions/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNav } from "@/components/bottom-nav";
import { getPendingInviteCount } from "@/lib/pod-invites";

/** Owns the whole app shell (not just a header) — different wrapping
 * depending on auth state, which is why it takes `children` rather than
 * being a sibling of them in layout.tsx:
 * - Signed in: Sidebar (sm+) sits beside content in a row; MobileHeader +
 *   BottomNav handle the mobile version instead.
 * - Signed out: a single top header, full width, content below it —
 *   the row-layout Sidebar treatment doesn't apply here at all. */
export async function SiteHeader({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-sage-200 px-4 py-4 sm:px-8">
                    <Link href="/" className="font-display text-xl text-sage-900">
                        Nooshe Jan
                    </Link>
                    <nav className="flex items-center gap-4 text-sm">
                        <Link href="/login" className="text-ink/70 hover:text-ink">
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="rounded-full bg-sage-600 px-4 py-2 font-medium text-white hover:bg-sage-900"
                        >
                            Sign up
                        </Link>
                    </nav>
                </header>
                {children}
            </div>
        );
    }

    const pendingInviteCount = await getPendingInviteCount(user.id);

    return (
        <>
            <Sidebar
                userId={user.id}
                userName={user.name}
                avatarUrl={user.avatarUrl}
                signOutAction={signOut}
                pendingInviteCount={pendingInviteCount}
            />
            <MobileHeader userId={user.id} userName={user.name} avatarUrl={user.avatarUrl} signOutAction={signOut} />
            {/* Bottom padding reserves space for the fixed mobile bottom nav. */}
            <div className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</div>
            <BottomNav pendingInviteCount={pendingInviteCount} />
        </>
    );
}
