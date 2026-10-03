-- The previous migration's DROP POLICY didn't match: Supabase's dashboard
-- had appended an internal suffix to the original policy's actual name
-- ("...gfanf8_0") that isn't visible in the dashboard UI or docs, so the
-- DROP (by the name shown in the UI) silently no-opped and the old,
-- unrestricted policy stayed active alongside the new one. Since RLS
-- OR's multiple permissive policies together for the same command, the
-- old one alone was still enough to allow uploading into ANY folder —
-- confirmed by a smoke test where a user could write into someone else's
-- path. Dropping it by its real name this time.
drop policy "Authenticated users can upload dish photos gfanf8_0" on storage.objects;
