import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use this in Server Components, Server Actions, and Route Handlers — it
// reads/writes the auth session via cookies. Must be called fresh per
// request (don't cache the client at module scope like src/lib/prisma.ts).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll called from a Server Component — safe to ignore if you
            // have middleware refreshing the session (see middleware.ts).
          }
        },
      },
    },
  );
}
