import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getWantToTryItems } from "@/lib/want-to-try";

export default async function WantToTryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await getWantToTryItems(user.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-sage-900">Want to try</h1>
        <Link
          href="/want-to-try/new"
          className="rounded-full bg-sage-600 px-4 py-2 text-sm font-medium text-white hover:bg-sage-900"
        >
          Add an idea
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sage-200 px-6 py-12 text-center">
          <p className="text-ink/70">Nothing on the list yet.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                {item.photoUrl && (
                  <Image src={item.photoUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-ink">{item.name}</p>
                <p className="truncate text-sm text-ink/60">
                  added by {item.addedBy.name}
                  {item.pod && ` · ${item.pod.name}`}
                  {item.link && (
                    <>
                      {" · "}
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="underline">
                        link
                      </a>
                    </>
                  )}
                </p>
              </div>
              <Link
                href={`/dishes/new?wantToTryId=${item.id}`}
                className="shrink-0 rounded-full border border-sage-200 px-4 py-2 text-sm font-medium text-ink hover:border-sage-600"
              >
                Log it
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
