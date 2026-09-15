import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { AddDishForm } from "@/components/add-dish-form";

export default async function NewDishPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const regions = await prisma.cuisine.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl text-sage-900">Log a dish</h1>
      <p className="mt-2 text-sm text-ink/70">
        Quick and minimal — you can always add more later.
      </p>
      <AddDishForm
        regions={regions.map((r) => ({ id: r.id, name: r.name }))}
        privateByDefault={user.privateByDefault}
      />
    </main>
  );
}
