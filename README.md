# Nooshe Jan (نوش جان)

The brutally honest dish-ranking app for the people who cook for you.
Log what your partner, family, or roommates make, rank it against
everything else they've made (Beli-style pairwise comparison), and use
combined "pod" views to decide what to cook next — no more finding out
someone secretly hated a dish three weeks after they ate it. See
`dish-rank-app-spec.md` for the full product spec and `DESIGN.md` for the
visual/brand direction.

**Stack:** Next.js (App Router) + Supabase (Postgres, Auth, Storage) +
Prisma + Resend (bug report emails) + Vercel. See `docs/INFRA_SETUP.md` for
how to provision everything.

## Getting started

Requires Node `22.20.0` (see `.nvmrc`; run `nvm use` first) — Prisma 7+
doesn't support Node 23.

```bash
nvm use
npm install
cp .env.example .env   # fill in Supabase + Resend credentials, see docs/INFRA_SETUP.md
npm run db:migrate     # creates tables in your Supabase Postgres
npm run dev             # http://localhost:3000
```

## Features

- **Auth** — email/password (Supabase Auth)
- **Dishes** — log, edit, delete, re-rank; photo, cuisine (search-or-create),
  tags, notes, recipe link, visibility, who ate it
- **Ranking** — cuisine-anchored pairwise insertion sort, with a
  Beli-style liked/okay/disliked tier picked before comparisons start
- **Pods** — shared groups with a combined ranked view; invite by link or
  by searching a name (the latter creates a pending invite the other
  person has to accept); leave or remove a member any time
- **Want-to-try** — ideas not yet cooked, convertible into a real dish
- **Profile** — signature dishes, crowd-score aggregate, avatar, editable
  in Settings; other users' profiles are viewable (public dishes only)
- **Search** — find people by name
- **Feed** — chronological pod activity
- **Bug reports** — `/report-bug`, saved to the DB and emailed to the
  maintainer via Resend

## Project layout

- `prisma/schema.prisma` — data model (users, dishes, cuisines, pods,
  ratings, pairwise comparisons, want-to-trys, bug reports) — see spec §1/§3.
- `src/app/` — one route per screen; `dishes/[dishId]/{edit,rank,rerank}`
  are the dish-specific flows, `users/[userId]` is the profile page.
- `src/lib/actions/` — server actions (one file per feature area).
- `src/lib/ranking.ts` — the insertion-sort algorithm, tiers, and re-rank
  logic; `src/lib/pods.ts` / `src/lib/profile.ts` — the combined-view and
  crowd-score aggregation shared across pages.
- `src/lib/prisma.ts` — Prisma client singleton.
- `src/lib/supabase/{client,server}.ts` — Supabase client for browser vs.
  server (Server Components/Actions/Route Handlers).
- `src/components/sidebar.tsx` / `bottom-nav.tsx` / `mobile-header.tsx` —
  the app shell: a persistent sidebar on wider screens, a bottom tab bar
  on mobile.
- `src/proxy.ts` — refreshes the Supabase auth session cookie on every
  request (Next.js 16's proxy/middleware convention).
- `docs/INFRA_SETUP.md` — step-by-step Supabase + Vercel provisioning guide.
