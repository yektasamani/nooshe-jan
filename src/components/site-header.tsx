import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { signOut } from "@/lib/actions/auth";
import { NavMenu } from "@/components/nav-menu";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center justify-between border-b border-sage-200 px-4 py-4 sm:px-8">
      <Link href="/" className="font-display text-xl text-sage-900">
        Noosh Jan
      </Link>

      {user ? (
        <NavMenu userName={user.name} signOutAction={signOut} />
      ) : (
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
      )}
    </header>
  );
}
