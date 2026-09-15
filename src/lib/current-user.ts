import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * The signed-in user's `public.users` profile row (name, avatar, privacy
 * setting — see prisma/schema.prisma), or null if nobody's logged in.
 * The row itself is created by a Postgres trigger on signup, see
 * docs/INFRA_SETUP.md §5.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.user.findUnique({ where: { id: user.id } });
}
