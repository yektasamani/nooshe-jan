import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getSignatureDishes, getCrowdScoredDishes } from "@/lib/profile";
import { agreementLabel } from "@/lib/ranking";
import { PrivacyToggle } from "@/components/privacy-toggle";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [signatureDishes, crowdScored] = await Promise.all([
    getSignatureDishes(user.id),
    getCrowdScoredDishes(user.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl text-sage-900">{user.name}</h1>

      {signatureDishes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink/60">Top dishes</h2>
          {/* Deliberately different treatment from the plain list rows
              below (DESIGN.md: vary card treatment by hierarchy) — the
              photo carries the whole card, with the score overlaid on it
              rather than sitting in a separate text row, and #1 gets a
              visibly bigger, labeled spot rather than just being first
              in an identical row. */}
          <div className="mt-3 flex items-end gap-3 overflow-x-auto pb-1">
            {signatureDishes.map((rating, index) => (
              <Link
                key={rating.id}
                href={`/dishes/${rating.dish.id}`}
                className={
                  index === 0
                    ? "group relative aspect-[4/5] w-44 shrink-0 overflow-hidden rounded-2xl bg-sage-50 shadow-sm"
                    : "group relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-sage-50"
                }
              >
                <Image
                  src={rating.dish.photoUrl}
                  alt={rating.dish.name}
                  fill
                  sizes={index === 0 ? "176px" : "112px"}
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                {index === 0 && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-cream/90 px-2.5 py-1 text-[11px] font-medium text-sage-900">
                    Signature dish
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p
                    className={
                      index === 0
                        ? "font-display truncate text-base text-cream"
                        : "truncate text-xs text-cream/90"
                    }
                  >
                    {rating.dish.name}
                  </p>
                  <p className={index === 0 ? "font-display text-lg text-cream" : "font-display text-sm text-cream"}>
                    {rating.score.toFixed(1)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink/60">My dishes, ranked by crowd score</h2>
        {crowdScored.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">Nothing logged yet.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-3">
            {crowdScored.map(({ dish, avg, spread, perPerson }, index) => (
              <li key={dish.id}>
                <Link
                  href={`/dishes/${dish.id}`}
                  className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3 transition-colors hover:border-sage-600"
                >
                  <span className="w-6 shrink-0 text-center text-sm text-ink/40">{index + 1}</span>
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                    <Image src={dish.photoUrl} alt={dish.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg text-ink">{dish.name}</p>
                    <p className="truncate text-sm text-ink/60">{dish.cuisine.name}</p>
                    {perPerson.length > 1 && (
                      <p className="mt-0.5 truncate text-xs text-ink/50">
                        {perPerson.map((r) => `${r.user.name} ${r.score.toFixed(1)}`).join(" · ")}
                        {" · "}
                        {agreementLabel(spread, perPerson.length)}
                      </p>
                    )}
                  </div>
                  <span className="font-display shrink-0 text-2xl text-sage-600">
                    {avg !== null ? avg.toFixed(1) : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10 border-t border-sage-200 pt-6">
        <h2 className="text-sm font-medium text-ink/60">Privacy</h2>
        <PrivacyToggle initialValue={user.privateByDefault} />
      </section>
    </main>
  );
}
