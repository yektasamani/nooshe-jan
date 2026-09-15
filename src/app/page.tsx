import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display max-w-lg text-4xl text-sage-900 sm:text-5xl">
          نوش جان — Noosh Jan
        </h1>
        <p className="mt-4 max-w-md text-ink/70">
          Log the dishes you cook, rank them against each other, and figure out
          what to cook next — with the people you cook for.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-sage-600 px-6 py-3 font-medium text-white hover:bg-sage-900"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-sage-200 px-6 py-3 font-medium text-ink hover:border-sage-600"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  // Not the ranked personal list yet (spec §3, still to build) — just
  // every dish this user made or ate, newest first, so there's something
  // to look at after logging a dish or two.
  const dishes = await prisma.dish.findMany({
    where: {
      OR: [{ makerId: user.id }, { eaters: { some: { userId: user.id } } }],
    },
    include: { cuisine: true, maker: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-sage-900">
          Nothing ranked yet — here's what you've logged
        </h1>
      </div>

      {dishes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-sage-200 px-6 py-16 text-center">
          <p className="text-ink/70">
            Nothing here yet — log your first dish to get started.
          </p>
          <Link
            href="/dishes/new"
            className="mt-4 inline-block rounded-full bg-sage-600 px-5 py-2.5 font-medium text-white hover:bg-sage-900"
          >
            Log a dish
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {dishes.map((dish) => (
            <li
              key={dish.id}
              className="flex items-center gap-4 rounded-xl border border-sage-200/70 bg-white p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sage-50">
                <Image src={dish.photoUrl} alt={dish.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg text-ink">{dish.name}</p>
                <p className="truncate text-sm text-ink/60">
                  {dish.cuisine.name} · made by {dish.maker.name}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
