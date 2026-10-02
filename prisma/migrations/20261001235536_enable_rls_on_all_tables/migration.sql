-- Supabase flagged every public table as publicly readable/writable via
-- its auto-generated REST API (PostgREST), since Row-Level Security was
-- never enabled. The app never queries through that API or the anon/
-- authenticated Postgres roles it uses (supabase-js is only used for
-- .auth and .storage here, never .from()) — every real query goes
-- through Prisma over DATABASE_URL/DIRECT_URL as the `postgres` role,
-- which owns these tables and is unaffected by RLS. So enabling RLS with
-- no policies is safe for the app and closes the hole: it blocks the
-- anon/authenticated roles (whose key is public, shipped to every
-- client) from reading or writing any row directly, while leaving every
-- app code path exactly as it was.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cuisines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pod_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dishes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dish_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dish_eaters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dish_co_makers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dish_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dish_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dish_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pairwise_comparisons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "want_to_trys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "want_to_try_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "want_to_try_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bug_reports" ENABLE ROW LEVEL SECURITY;
