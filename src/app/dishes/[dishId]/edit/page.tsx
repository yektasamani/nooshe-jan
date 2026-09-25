import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { updateDish } from "@/lib/actions/dishes";
import { getPodMates } from "@/lib/pod-mates";
import { AddDishForm } from "@/components/add-dish-form";
import { DeleteDishButton } from "@/components/delete-dish-button";

export default async function EditDishPage({ params }: { params: Promise<{ dishId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { dishId } = await params;
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: { cuisine: true, eaters: true, coMakers: true, tags: { include: { tag: true } } },
  });
  if (!dish || dish.makerId !== user.id) redirect("/");

  const regions = await prisma.cuisine.findMany({ where: { parentId: null }, orderBy: { name: "asc" } });
  const podMates = await getPodMates(user.id);

  // If the dish's cuisine IS a top-level region, there's no "specific
  // cuisine" to prefill — just the region dropdown.
  const regionId = dish.cuisine.parentId ?? dish.cuisine.id;
  const cuisineName = dish.cuisine.parentId ? dish.cuisine.name : undefined;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl text-sage-900">Edit {dish.name}</h1>
      <p className="mt-2 text-sm text-ink/70">
        Position and score in your rank stay put. Re-rank separately if that&apos;s changed.
      </p>
      <AddDishForm
        action={updateDish}
        dishId={dish.id}
        regions={regions.map((r) => ({ id: r.id, name: r.name }))}
        privateByDefault={user.privateByDefault}
        currentUserName={user.name}
        podMates={podMates.map((m) => ({ id: m.id, name: m.name }))}
        initialName={dish.name}
        initialPhotoUrl={dish.photoUrl}
        initialRegionId={regionId}
        initialCuisineName={cuisineName}
        initialNotes={dish.notes ?? undefined}
        initialTags={dish.tags.map((t) => t.tag.name).join(", ")}
        initialRecipeUrl={dish.recipeUrl ?? undefined}
        initialCookDate={dish.cookDate ? dish.cookDate.toISOString().slice(0, 10) : undefined}
        initialVisibility={dish.visibility}
        initialEatSelf={dish.eaters.some((e) => e.userId === user.id)}
        initialSelectedEaterIds={dish.eaters.map((e) => e.userId).filter((id) => id !== user.id)}
        initialSelectedCoMakerIds={dish.coMakers.map((c) => c.userId)}
        submitLabel="Save changes"
        pendingLabel="Saving…"
      />

      <div className="mt-8 border-t border-sage-200 pt-6">
        <DeleteDishButton dishId={dish.id} dishName={dish.name} />
      </div>
    </main>
  );
}
