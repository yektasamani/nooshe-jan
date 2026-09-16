import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getFeed } from "@/lib/feed";
import { timeAgo } from "@/lib/format";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await getFeed(user.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">Feed</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sage-200 px-6 py-12 text-center">
          <p className="text-ink/70">
            Nothing here yet — join or create a pod to see what everyone's up to.
          </p>
          <Link
            href="/pods"
            className="mt-4 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
          >
            Go to pods
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((item) =>
            item.type === "dish" ? (
              <li key={item.id}>
                <Link
                  href={`/dishes/${item.dishId}`}
                  className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3 transition-colors hover:border-sage-600"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                    <Image src={item.photoUrl} alt={item.dishName} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">
                      <span className="font-medium">{item.makerName}</span> logged{" "}
                      <span className="font-display">{item.dishName}</span>
                    </p>
                    <p className="truncate text-xs text-ink/50">
                      {item.cuisineName} · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  {item.score !== null && (
                    <span className="font-display shrink-0 text-xl text-sage-600">
                      {item.score.toFixed(1)}
                    </span>
                  )}
                </Link>
              </li>
            ) : (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-ink">
                    <span className="font-medium">{item.addedByName}</span> added{" "}
                    <span className="font-display">{item.name}</span> to want to try
                  </p>
                  <p className="truncate text-xs text-ink/50">
                    {item.podName} · {timeAgo(item.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/dishes/new?wantToTryId=${item.wantToTryId}`}
                  className="shrink-0 rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600"
                >
                  Log it
                </Link>
              </li>
            ),
          )}
        </ul>
      )}
    </main>
  );
}
