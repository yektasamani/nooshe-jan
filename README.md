# Noosh Jan (نوش جان)

A web app for families and friends to log dishes they cook, rank them
against each other (Beli-style pairwise comparison), and use combined "pod"
views to decide what to cook next. See `dish-rank-app-spec.md` for the full
product spec and `DESIGN.md` for the visual/brand direction.

**Stack:** Next.js (App Router) + Supabase (Postgres, Auth, Storage) +
Prisma + Vercel. See `docs/INFRA_SETUP.md` for how to provision everything.

## Getting started

Requires Node `22.20.0` (see `.nvmrc`; run `nvm use` first) — Prisma 7+
doesn't support Node 23.

```bash
nvm use
npm install
cp .env.example .env   # then fill in Supabase credentials, see docs/INFRA_SETUP.md
npm run db:migrate     # creates tables in your Supabase Postgres
npm run dev             # http://localhost:3000
```

## Project layout

- `prisma/schema.prisma` — data model (users, dishes, cuisines, pods,
  ratings, pairwise comparisons, want-to-trys) — see spec §1/§3.
- `src/lib/prisma.ts` — Prisma client singleton.
- `src/lib/supabase/{client,server}.ts` — Supabase client for browser vs.
  server (Server Components/Actions/Route Handlers).
- `src/proxy.ts` — refreshes the Supabase auth session cookie on every
  request (Next.js 16's proxy/middleware convention).
- `docs/INFRA_SETUP.md` — step-by-step Supabase + Vercel provisioning guide.