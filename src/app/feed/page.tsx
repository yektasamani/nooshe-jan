import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getFeed } from "@/lib/feed";
import { timeAgo } from "@/lib/format";
import {
  toggleDishLike,
  addDishComment,
  deleteDishComment,
  toggleWantToTryLike,
  addWantToTryComment,
  deleteWantToTryComment,
  addDishToMyWantToTry,
} from "@/lib/actions/reactions";
import { ReactionBar } from "@/components/reaction-bar";

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await getFeed(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl text-sage-900">Feed</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sage-200 px-6 py-12 text-center">
          <p className="text-ink/70">
            Nothing here yet. Join or create a pod to see what everyone&apos;s up to.
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
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-sage-200/70 bg-white p-3 transition-colors hover:border-sage-600"
              >
                <div className="flex items-center gap-4">
                  <Link href={`/dishes/${item.dishId}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                    <Image src={item.photoUrl} alt={item.dishName} fill sizes="56px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">
                      <Link href={`/users/${item.makerId}`} className="font-medium hover:underline">
                        {item.makerName}
                      </Link>{" "}
                      logged{" "}
                      <Link href={`/dishes/${item.dishId}`} className="font-display hover:underline">
                        {item.dishName}
                      </Link>
                    </p>
                    <p className="truncate text-xs text-ink/50">
                      {item.cuisineName} · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  {item.score !== null && (
                    <Link href={`/dishes/${item.dishId}`} className="font-display shrink-0 text-xl text-sage-600">
                      {item.score.toFixed(1)}
                    </Link>
                  )}
                  {item.makerId !== user.id && (
                    <form action={addDishToMyWantToTry} className="shrink-0">
                      <input type="hidden" name="dishId" value={item.dishId} />
                      <button
                        type="submit"
                        className="rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600"
                      >
                        + Want to try
                      </button>
                    </form>
                  )}
                </div>

                <div className="border-t border-sage-100 pt-2">
                  <ReactionBar
                    idFieldName="dishId"
                    targetId={item.dishId}
                    redirectTo="/feed"
                    liked={item.likedByUserIds.includes(user.id)}
                    likeCount={item.likedByUserIds.length}
                    comments={item.comments.map((c) => ({ ...c, isOwn: c.authorId === user.id }))}
                    likeAction={toggleDishLike}
                    commentAction={addDishComment}
                    deleteCommentAction={deleteDishComment}
                  />
                </div>
              </li>
            ) : (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-sage-200/70 bg-white p-3"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">
                      <Link href={`/users/${item.addedById}`} className="font-medium hover:underline">
                        {item.addedByName}
                      </Link>{" "}
                      added{" "}
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
                </div>

                <div className="border-t border-sage-100 pt-2">
                  <ReactionBar
                    idFieldName="wantToTryId"
                    targetId={item.wantToTryId}
                    redirectTo="/feed"
                    liked={item.likedByUserIds.includes(user.id)}
                    likeCount={item.likedByUserIds.length}
                    comments={item.comments.map((c) => ({ ...c, isOwn: c.authorId === user.id }))}
                    likeAction={toggleWantToTryLike}
                    commentAction={addWantToTryComment}
                    deleteCommentAction={deleteWantToTryComment}
                  />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </main>
  );
}
