-- The existing upload policy only checked bucket_id — any signed-in user
-- could already upload to (or overwrite) ANY path in the bucket,
-- including another user's folder, by calling the Storage API directly
-- (the Supabase JS client + anon key is public by design, reachable
-- regardless of what the app's own UI does). Restricting uploads to the
-- user's own top-level folder closes that, and is required now that
-- uploads happen directly from the browser instead of being proxied
-- through a trusted server action.
drop policy if exists "Authenticated users can upload dish photos" on storage.objects;

create policy "Authenticated users can upload to their own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'dish-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
