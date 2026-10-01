import Link from "next/link";
import { timeAgo } from "@/lib/format";
import { SubmitButton } from "@/components/submit-button";

export type ReactionComment = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
  isOwn: boolean;
};

/** Shared likes + comments UI for both dishes and want-to-try ideas (spec
 * extension: a social layer on top of the ranking/planning core). Used
 * compact-and-collapsed on the feed, open by default on the dish detail
 * page. Everything here is plain server-rendered forms — no client JS
 * needed, same as the rest of the app's action forms. */
export function ReactionBar({
  idFieldName,
  targetId,
  redirectTo,
  liked,
  likeCount,
  comments,
  likeAction,
  commentAction,
  deleteCommentAction,
  defaultOpen = false,
}: {
  idFieldName: "dishId" | "wantToTryId";
  targetId: string;
  redirectTo: string;
  liked: boolean;
  likeCount: number;
  comments: ReactionComment[];
  likeAction: (formData: FormData) => void;
  commentAction: (formData: FormData) => void;
  deleteCommentAction: (formData: FormData) => void;
  defaultOpen?: boolean;
}) {
  return (
    <div className="mt-2 flex items-start gap-3">
      <form action={likeAction}>
        <input type="hidden" name={idFieldName} value={targetId} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button
          type="submit"
          className={
            liked
              ? "flex items-center gap-1 text-sm font-medium text-sage-600"
              : "flex items-center gap-1 text-sm text-ink/50 hover:text-ink"
          }
        >
          <span aria-hidden>{liked ? "♥" : "♡"}</span>
          {likeCount > 0 && likeCount}
        </button>
      </form>

      <details className="group" open={defaultOpen}>
        <summary className="cursor-pointer list-none text-sm text-ink/50 hover:text-ink [&::-webkit-details-marker]:hidden">
          {comments.length > 0 ? `${comments.length} comment${comments.length === 1 ? "" : "s"}` : "Comment"}
        </summary>

        <div className="mt-2 flex flex-col gap-2">
          {comments.length > 0 && (
            <ul className="flex flex-col gap-2">
              {comments.map((comment) => (
                <li key={comment.id} className="rounded-lg bg-sage-50/60 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/users/${comment.authorId}`} className="font-medium text-ink hover:underline">
                      {comment.authorName}
                    </Link>
                    <span className="text-xs text-ink/40">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-ink/80">{comment.body}</p>
                  {comment.isOwn && (
                    <form action={deleteCommentAction} className="mt-1">
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="redirectTo" value={redirectTo} />
                      <button type="submit" className="text-xs text-ink/40 hover:text-red-600">
                        Delete
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form action={commentAction} className="flex gap-2">
            <input type="hidden" name={idFieldName} value={targetId} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input
              type="text"
              name="body"
              placeholder="Add a comment"
              className="flex-1 rounded-lg border border-sage-200 bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-sage-600"
            />
            <SubmitButton
              pendingText="…"
              className="shrink-0 rounded-full border border-sage-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-sage-600"
            >
              Send
            </SubmitButton>
          </form>
        </div>
      </details>
    </div>
  );
}
