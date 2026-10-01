"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { canViewDish } from "@/lib/dish-fields";
import { canViewWantToTry } from "@/lib/want-to-try";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

function redirectTarget(formData: FormData, fallback: string) {
  return String(formData.get("redirectTo") ?? fallback);
}

export async function toggleDishLike(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const dishId = String(formData.get("dishId"));
  const to = redirectTarget(formData, `/dishes/${dishId}`);

  const dish = await prisma.dish.findUnique({ where: { id: dishId }, include: { coMakers: true } });
  if (!dish || !canViewDish(dish, userId)) redirect(to);

  const existing = await prisma.dishLike.findUnique({ where: { dishId_userId: { dishId, userId } } });
  if (existing) {
    await prisma.dishLike.delete({ where: { dishId_userId: { dishId, userId } } });
  } else {
    await prisma.dishLike.create({ data: { dishId, userId } });
  }

  revalidatePath(to);
  redirect(to);
}

export async function addDishComment(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const dishId = String(formData.get("dishId"));
  const to = redirectTarget(formData, `/dishes/${dishId}`);
  const body = String(formData.get("body") ?? "").trim();
  if (!body) redirect(to);

  const dish = await prisma.dish.findUnique({ where: { id: dishId }, include: { coMakers: true } });
  if (!dish || !canViewDish(dish, userId)) redirect(to);

  await prisma.dishComment.create({ data: { dishId, userId, body } });

  revalidatePath(to);
  redirect(to);
}

export async function deleteDishComment(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const commentId = String(formData.get("commentId"));
  const to = redirectTarget(formData, "/feed");

  const comment = await prisma.dishComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) redirect(to);

  await prisma.dishComment.delete({ where: { id: commentId } });

  revalidatePath(to);
  redirect(to);
}

export async function toggleWantToTryLike(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const wantToTryId = String(formData.get("wantToTryId"));
  const to = redirectTarget(formData, "/feed");

  const item = await prisma.wantToTry.findUnique({ where: { id: wantToTryId } });
  if (!item || !(await canViewWantToTry(item, userId))) redirect(to);

  const existing = await prisma.wantToTryLike.findUnique({
    where: { wantToTryId_userId: { wantToTryId, userId } },
  });
  if (existing) {
    await prisma.wantToTryLike.delete({ where: { wantToTryId_userId: { wantToTryId, userId } } });
  } else {
    await prisma.wantToTryLike.create({ data: { wantToTryId, userId } });
  }

  revalidatePath(to);
  redirect(to);
}

export async function addWantToTryComment(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const wantToTryId = String(formData.get("wantToTryId"));
  const to = redirectTarget(formData, "/feed");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) redirect(to);

  const item = await prisma.wantToTry.findUnique({ where: { id: wantToTryId } });
  if (!item || !(await canViewWantToTry(item, userId))) redirect(to);

  await prisma.wantToTryComment.create({ data: { wantToTryId, userId, body } });

  revalidatePath(to);
  redirect(to);
}

export async function deleteWantToTryComment(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const commentId = String(formData.get("commentId"));
  const to = redirectTarget(formData, "/feed");

  const comment = await prisma.wantToTryComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) redirect(to);

  await prisma.wantToTryComment.delete({ where: { id: commentId } });

  revalidatePath(to);
  redirect(to);
}

/** "Someone else might also want to add that dish to want to try" —
 * copies a dish someone else made into the viewer's own personal
 * want-to-try list (name/photo/recipe link), separate from the maker's
 * own copy. Defaults to personal (no pod); the viewer can pod-tag it
 * later from the edit page same as any other want-to-try idea. */
export async function addDishToMyWantToTry(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const dishId = String(formData.get("dishId"));

  const dish = await prisma.dish.findUnique({ where: { id: dishId }, include: { coMakers: true } });
  if (!dish || !canViewDish(dish, userId)) redirect("/");

  await prisma.wantToTry.create({
    data: { name: dish.name, photoUrl: dish.photoUrl, link: dish.recipeUrl, addedById: userId },
  });

  revalidatePath("/want-to-try");
  redirect("/want-to-try");
}
