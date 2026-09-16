import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { AddDishForm } from "@/components/add-dish-form";

export default async function NewDishPage({
  searchParams,
}: {
  searchParams: Promise<{ wantToTryId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const regions = await prisma.cuisine.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });

  // Who's available to tag as an eater (spec §1: "who ate it," defaults to
  // [me], editable) — scoped to people you actually share a pod with,
  // since that's the only "known contacts" concept the app has.
  const myPodIds = (
    await prisma.podMember.findMany({ where: { userId: user.id, status: "active" }, select: { podId: true } })
  ).map((m) => m.podId);
  const podMates =
    myPodIds.length > 0
      ? await prisma.user.findMany({
          where: {
            id: { not: user.id },
            podMemberships: { some: { podId: { in: myPodIds }, status: "active" } },
          },
          orderBy: { name: "asc" },
        })
      : [];

  // Converting a want-to-try into a real Dish (spec §1): carries over its
  // name and link as a starting point — the actual cooked dish still needs
  // its own fresh photo.
  const { wantToTryId } = await searchParams;
  let wantToTry: { id: string; name: string; link: string | null } | null = null;
  if (wantToTryId) {
    const candidate = await prisma.wantToTry.findUnique({ where: { id: wantToTryId } });
    if (candidate && !candidate.convertedToDishId) {
      const isMine = candidate.addedById === user.id;
      const isMyPods = candidate.podId
        ? await prisma.podMember.findUnique({
            where: { podId_userId: { podId: candidate.podId, userId: user.id } },
          })
        : null;
      if (isMine || isMyPods) wantToTry = candidate;
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl text-sage-900">Log a dish</h1>
      <p className="mt-2 text-sm text-ink/70">
        {wantToTry
          ? `Making "${wantToTry.name}" — nice.`
          : "Quick and minimal — you can always add more later."}
      </p>
      <AddDishForm
        regions={regions.map((r) => ({ id: r.id, name: r.name }))}
        privateByDefault={user.privateByDefault}
        initialName={wantToTry?.name}
        initialRecipeUrl={wantToTry?.link ?? undefined}
        wantToTryId={wantToTry?.id}
        currentUserName={user.name}
        podMates={podMates.map((m) => ({ id: m.id, name: m.name }))}
      />
    </main>
  );
}
