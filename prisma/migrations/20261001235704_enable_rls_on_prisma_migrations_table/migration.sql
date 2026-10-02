-- Prisma's own migration-history table also lives in the public schema,
-- so it was exposed through the same public REST API hole as every app
-- table (migration names/timestamps aren't secret, but there's no reason
-- to leave it readable either — same reasoning as the other migration).
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- handle_new_user() is a SECURITY DEFINER trigger on auth.users (fires on
-- every signup to create the matching public.users row) — it only ever
-- needs to run as part of that INSERT, performed by Supabase's own auth
-- service, not by anon/authenticated. But every function in the public
-- schema is auto-exposed by PostgREST as a callable RPC endpoint
-- (/rest/v1/rpc/handle_new_user) unless EXECUTE is revoked, regardless of
-- whether it's meant to be called directly. Revoking it here only blocks
-- that direct-call path; the trigger itself keeps firing normally since
-- it isn't invoked through anon/authenticated at all.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
