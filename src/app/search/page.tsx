import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { searchUsersByName } from "@/lib/users";
import { Avatar } from "@/components/avatar";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { q } = await searchParams;
  const results = q ? await searchUsersByName(q, user.id) : [];

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">Find people</h1>

      <form method="GET" className="mt-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name"
          autoFocus
          className="flex-1 rounded-lg border border-sage-200 bg-white px-3.5 py-2.5 text-ink outline-none focus:border-sage-600"
        />
        <button
          type="submit"
          className="rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
        >
          Search
        </button>
      </form>

      {q && (
        <ul className="mt-6 flex flex-col gap-2">
          {results.length === 0 ? (
            <p className="text-sm text-ink/50">No one found matching &quot;{q}&quot;.</p>
          ) : (
            results.map((result) => (
              <li key={result.id}>
                <Link
                  href={`/users/${result.id}`}
                  className="flex items-center gap-3 rounded-xl border border-sage-200/70 bg-white px-4 py-3 transition-colors hover:border-sage-600"
                >
                  <Avatar name={result.name} avatarUrl={result.avatarUrl} size="sm" />
                  <span className="text-ink">{result.name}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </main>
  );
}
