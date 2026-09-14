# Infra Setup — Noosh Jan

Stack: **Next.js** (frontend + API routes) + **Supabase** (Postgres + Auth +
Storage, one account/dashboard) + **Prisma** (ORM/migrations) + **Vercel**
(hosting). This is the "MVP-minimizing" stack from `dish-rank-app-spec.md`
§6 — Supabase bundles the database, auth, and photo storage so there's one
service to provision instead of three.

The codebase already has Prisma, the Supabase client libraries, the schema
(`prisma/schema.prisma`), and the Next.js/Supabase glue code (`src/lib/`,
`src/proxy.ts`) wired up. What's left is provisioning the actual services,
which needs your own accounts/credentials — that's this doc.

---

## 1. Create the Supabase project

1. Go to https://supabase.com → sign up / log in → **New project**.
2. Pick an org, name it `nooshe-jan` (or similar), set a **strong database
   password** — save it somewhere (a password manager), you'll need it below
   and it's shown only once.
3. Pick a region close to you/your users (e.g. closest US region if the pod
   is US-based). Wait ~2 min for provisioning.

## 2. Get your database connection strings

Prisma needs **two** connection strings (this is standard for
Supabase + Prisma, not optional):

1. In the Supabase dashboard: **Project Settings → Database**.
2. Under **Connection string**, copy:
   - **Transaction pooler** (port `6543`) → this is `DATABASE_URL`. Append
     `?pgbouncer=true&connection_limit=1` if it's not already there — the
     app talks to Postgres through this pooled connection at runtime.
   - **Direct connection** (port `5432`) → this is `DIRECT_URL`. Prisma
     Migrate needs a direct (non-pooled) connection to run schema changes.
3. Both strings contain `[YOUR-PASSWORD]` — replace with the DB password
   from step 1.

Put both into your local env file:

```bash
cp .env.example .env
# then edit .env and paste in DATABASE_URL / DIRECT_URL
```

(Prisma's CLI auto-loads `.env` — that's why it's `.env` and not
`.env.local`. Next.js loads `.env` too, so one file covers both. It's
already git-ignored.)

## 3. Get your Supabase API keys

**Project Settings → API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` — **never** put
  this behind `NEXT_PUBLIC_`, never send it to the browser. It bypasses
  row-level security and is only for trusted server-side code (e.g. an
  admin cleanup script).

Paste all three into `.env`.

## 4. Run the first migration

This creates every table from `prisma/schema.prisma` (users, dishes, pods,
pod_members, ratings, cuisines, want_to_trys, etc. — spec §1/§3) in your
new Supabase Postgres database.

```bash
npm install        # if you haven't already
npm run db:migrate -- --name init
```

Check **Table Editor** in the Supabase dashboard afterward — you should see
the new tables under the `public` schema.

## 5. Configure Auth (email/password)

Supabase Auth's email/password provider is **on by default** — nothing to
enable. Two things worth setting before you build the sign-up flow:

1. **Authentication → URL Configuration**: set `Site URL` to
   `http://localhost:3000` for now (change to your real domain once you
   have one — see §8). Add the same to `Redirect URLs`.
2. **Authentication → Providers → Email**: for local dev, you may want to
   turn off "Confirm email" so test signups don't need a real inbox.
   Turn it back on before you invite real people.

**Important — our own `users` table vs. Supabase's `auth.users`:**
Supabase manages its own `auth.users` table (email, password hash, etc.)
that we don't touch directly. Our Prisma `User` model (`prisma/schema.prisma`)
is a separate `public.users` table for app-specific profile fields (name,
avatar, privacy setting) — see spec §1. **After every sign-up, the app must
insert a row into `public.users` with the same `id` as the new
`auth.users` row.** The cleanest way to do this reliably (so it happens
even if the client never calls back) is a Postgres trigger. Run this once
via the Supabase **SQL Editor**:

```sql
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 6. Set up photo storage

**Storage → New bucket** → name it `dish-photos` (matches
`NEXT_PUBLIC_SUPABASE_DISH_PHOTOS_BUCKET` in `.env.example`) → mark it
**Public** (dish photos are viewable whenever the dish itself is public;
private-dish access control happens at the app/query level, same as the
spec's visibility rule — a public bucket just means "anyone with the exact
URL can view," which is fine for photos, not sensitive data).

Then add an upload policy so only signed-in users can write to it —
**Storage → Policies → New policy** on the `dish-photos` bucket:

```sql
create policy "Authenticated users can upload dish photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'dish-photos');
```

Uploading from the client uses the Supabase JS client
(`src/lib/supabase/client.ts`):
```ts
const { data, error } = await supabase.storage
  .from("dish-photos")
  .upload(`${userId}/${crypto.randomUUID()}.jpg`, file);
```

## 7. Row-Level Security (RLS)

Supabase enables RLS by default on new tables created through its own UI,
but tables created via **Prisma migrate** do **not** have RLS enabled
automatically — worth deciding deliberately rather than by accident:

- **If the app only ever talks to Postgres through Prisma using the
  `service_role`/direct connection from server-side code** (Server
  Components, Route Handlers, Server Actions — never a raw DB connection
  from the browser), RLS is optional since Postgres access itself is never
  exposed to the client. This is the simpler default for a Next.js app
  where Prisma is the only thing touching the database.
- **If you ever query Postgres directly from the browser via the Supabase
  JS client** (not just Storage/Auth), enable RLS and write policies per
  table — otherwise any signed-in user could read/write any row directly.

For v1, the simplest safe default: keep all Prisma/Postgres reads+writes
server-side (Server Actions/Route Handlers), and only use the Supabase JS
client from the browser for Auth and Storage (both of which have their own
policy systems, shown above). No RLS needed on the Prisma-managed tables
under that model — just make sure no API route naively trusts a
client-supplied `userId` instead of the session's authenticated user.

## 8. Deploy to Vercel

1. Push this repo to GitHub (if not already).
2. https://vercel.com → **Add New → Project** → import the repo.
3. **Environment Variables** (Project Settings → Environment Variables) —
   add every var from `.env` for **Production** and **Preview**:
   `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SUPABASE_DISH_PHOTOS_BUCKET`.
4. Deploy. Vercel runs `npm run build`, which via `postinstall` also runs
   `prisma generate` — but it does **not** run migrations automatically.
   Run `npm run db:migrate:deploy` yourself (locally, pointed at prod) after
   each migration that needs to ship, or wire it into a deploy step later.
5. Once you have a real domain, add it to Supabase's **Auth → URL
   Configuration → Redirect URLs**, and update `Site URL`.

## 9. Local dev loop, day to day

```bash
npm run dev            # start Next.js
npm run db:studio      # visual DB browser (Prisma Studio)
npm run db:migrate      # after changing prisma/schema.prisma
```

## Open items not covered here

- **Seeding the cuisine taxonomy** (spec §4/§5 — "finalize the seed list
  before building"): once the list is final, add a `prisma/seed.ts` script
  and a `"prisma": {"seed": "..."}` block in `package.json`.
- **Domain name**: tied to the branding decision in `DESIGN.md`; add it in
  Vercel's Domains tab once picked.
- **Notifications/real-time**: out of scope until the spec's open decision
  (§5) is resolved — Supabase has a Realtime feature built in if/when
  that's needed, no new service required.
