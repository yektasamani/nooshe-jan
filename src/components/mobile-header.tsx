import Link from "next/link";
import { AccountMenu } from "@/components/account-menu";

/** Mobile-only top bar — logo + account menu. Primary nav lives in
 * BottomNav instead; desktop gets Sidebar instead of this. */
export function MobileHeader({
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
  return (
    <header className="flex items-center justify-between border-b border-sage-200 px-4 py-4 sm:hidden">
      <Link href="/" className="font-display text-xl text-sage-900">
        Nooshe Jan
      </Link>
      <AccountMenu userId={userId} userName={userName} avatarUrl={avatarUrl} signOutAction={signOutAction} />
    </header>
  );
}
