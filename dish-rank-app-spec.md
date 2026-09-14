# Noosh Jan — Product Spec (v1 / MVP)

A web app (mobile-friendly, not native) for families and friends to log dishes
they cook, rank them against each other (Beli-style pairwise comparison), and
use combined "pod" views to make faster decisions about what to cook next.

---

## 1. Core Objects

### Dish (the central object — replaces "recipe")
- `name` (required)
- `photo` (required)
- `cuisine` (required) — search-or-create, nests under a seeded top-level
  taxonomy (see §4)
- `maker` — defaults to the logged-in user; can only be someone else if you
  decide to support logging on another user's behalf (open decision, see §6)
- `eaters` ("who ate it") — defaults to `[me]`, editable, feeds pod/consensus
  logic
- `notes` (optional, freeform)
- `tags` (optional, freeform, same search-or-create UI pattern as cuisine)
- `recipe attachment` (optional) — a URL, or an uploaded photo/PDF, purely as
  a "view original" reference. No transcription, no AI extraction in v1.
- `visibility` — Public (default) / Private. Private hides it from
  feeds/pods/other profiles but still counts toward the owner's own personal
  rank.
- `rank score` — derived, not manually entered (see §3)
- `created_at`, `cook_date`

### Want-to-try
- `name`
- `photo` or `link` (optional, whichever is available)
- `added_by`
- optional pod tag(s)
- No ranking (nothing to rank until it's actually made)
- Converts into a Dish entry once someone logs having cooked it (carries over
  name/photo/link as the recipe attachment)

### User
- `name`, `email`, `password` (standard email/password auth)
- `avatar/photo`
- `privacy default` setting — global toggle: "make my dishes private by
  default" (forward-only; does not retroactively touch existing dishes
  unless explicitly confirmed)

### Pod
- A group of users (e.g. "Me and Aidan," "Mom, Dad, and brother")
- Can be created proactively (empty, before any shared cooking history) or
  emerge retroactively from "who ate it" tagging
- On joining a new pod, does **not** auto-expose a member's full history —
  visibility is controlled at the dish level (§ visibility above), not by
  pod membership
- On creating/joining, pull each member's existing eligible (public /
  shared-to-this-pod) dishes into a combined view immediately — no cold
  start

### Cuisine (taxonomy)
- Seeded top-level regions (Middle Eastern, East Asian, South Asian,
  European, Latin American, African, North American, Other/Uncategorized,
  etc. — finalize the seed list before building)
- User-created cuisines via search-or-create always nest under one of the
  top-level regions (never fully orphaned)
- Used both as a data tag and structurally in the ranking algorithm (§3)

---

## 2. Screens (v1)

1. **Auth** — sign up / log in (email + password), pod invite landing page
2. **Personal rank** — one unified list of every dish you've tried, sorted
   by your own pairwise rank score. Filter chips: maker (me / others),
   cuisine, tags, made vs. want-to-try.
3. **Profile**
   - Signature dish / top dishes — computed live from personal rank,
     filtered to maker = self, no separate stored list
   - "My dishes, ranked by crowd score" — dishes you made, aggregated across
     every rating anyone (including you) has given them, regardless of pod
   - Privacy setting
4. **Pod home** — combined ranked list for a pod: avg/consensus score,
   spread/agreement indicator, per-person scores, "made" vs. "want to try"
   tabs, cuisine/tag filters
5. **Dish detail** — photo, maker, eaters, individual scores side by side,
   notes, optional recipe link/attachment, re-rank action
6. **Add a dish** — name, photo, cuisine (search-or-create), maker, eaters,
   optional notes/tags/recipe attachment
7. **Add a want-to-try** — name, photo/link (optional)
8. **Pairwise comparison** — "which did you like more," cuisine-anchored
   (see §3), repeats a small number of times per new entry
9. **Pod creation / invite** — email or link invite, pending-member state
10. **Feed** — chronological activity across your pods (new dish logged,
    want-to-try added, re-ranks) — separate from personal rank, more social

---

## 3. Ranking / Scoring Algorithm

**Approach: insertion-sort style, cuisine-anchored (Beli's model), not Elo.**

Reasoning: scores are personal/per-user, not meant to be globally
comparable across users the way Elo ratings are; insertion-sort needs fewer
comparisons per new entry and keeps logging fast.

**Flow when a new dish is logged:**
1. Look for existing dishes in the user's personal list with the same
   cuisine. If none, fall back to the parent cuisine (via taxonomy), then to
   cross-cuisine (compare against overall top-rated dish) if still nothing.
2. Binary-search within that cuisine-filtered subset first (few
   comparisons) to get a rough position.
3. Use that position to seed a probable overall-list position, minimizing
   total comparisons needed against the full list.
4. Store final rank position; derive a display score (e.g. 0–10) from
   relative position in the list.

**Re-ranking (re-cooked dish):**
- Default to comparing only against immediate neighbors in the existing
  list (cheap, since it's likely to stay close to its old position).
- Only trigger a fuller re-comparison if the user flags the result as
  notably better/worse than before.

**Editing cuisine after the fact:** does not retroactively trigger new
comparisons — relabeling shouldn't force a re-rank.

**Aggregate / crowd score (profile "my dishes ranked" list):**
- Separate from personal rank. For each dish you made, pull every
  individual score anyone (including you) has given it, and combine
  (average, shown alongside a spread/agreement indicator rather than a
  flattened single number) — do not silently hide disagreement.
- Respect visibility: private-to-others dishes/ratings should not appear in
  another viewer's aggregate view.

**Open decision:** exact scoring scale/formula for converting list position
into a displayed number (e.g. simple percentile mapping vs. something more
weighted). Needs to be pinned down during build, not just "position-based."

---

## 4. Decisions Already Made

- Web app, mobile-responsive (not native), PWA "add to home screen" support
- No AI extraction / OCR / recipe transcription in v1 — recipe is optional
  metadata (link or photo attachment), never required to log or rank
- No structured ingredients in v1
- Cuisine required at dish creation; search-or-create UI; seeded top-level
  taxonomy with hierarchical matching
- "Who ate it" required but auto-defaults to "me" — low friction
- Dishes public by default; per-dish private toggle; global "private by
  default" account setting (forward-only unless explicitly made retroactive)
- Auth: standard email/password
- Invites: simple email/link, no artificial scarcity (rejected Beli's
  invite-scarcity growth model as not fitting a friends/family utility app)
- One unified personal rank list per user; maker/cuisine/tags are filters on
  it, not separate lists
- Recipe object concept fully replaced by "Dish" — no separate
  recipe-vs-cook-instance split needed

---

## 5. Still Open — Decide Before/During Build

- **Scoring formula specifics** — exact position-to-score mapping (§3)
- **Cross-user dish linking** — if two people cook "the same" dish
  independently (no shared source), should they ever be linkable/comparable,
  or fully separate entities forever? (Currently: fully separate, no dedup
  needed since dishes are maker-scoped.)
- **Logging on someone else's behalf** — can you log a dish Aidan made and
  tag him as maker, or must every dish be entered by its own maker? Affects
  whether "maker" needs an approval/claim step.
- **Notifications** — in or out of v1 (new dish logged, want-to-try
  threshold reached, it's-your-turn-to-rank nudges)
- **Leaderboard ("best cook" in a pod/family)** — in or out of v1; falls out
  fairly easily from existing data if wanted
- **Public layer beyond pods** — is "public" scoped to your pods/connections
  only, or genuinely open/discoverable like Beli's restaurant profiles?
  Affects search, moderation, and growth strategy.
- **Retroactive privacy** — when a user flips their global privacy default,
  do they get a distinct, explicit action to also hide past dishes, or is it
  forward-only permanently?
- **Cuisine seed list** — finalize the actual top-level taxonomy before
  building the create-dish flow
- **Branding** — sage green direction and app name (Noosh Jan) are chosen;
  still need full palette (secondary/accent pairing) and logo. See
  DESIGN.md for full brand direction.

---

## 6. Infrastructure Decisions Needed

These weren't discussed in depth and need to be picked before/at build
start:

| Area | Decision needed |
|---|---|
| **Frontend framework** | e.g. Next.js / React, or another web framework Claude Code can scaffold cleanly |
| **Backend** | Same framework's API routes vs. a separate backend service |
| **Database** | Postgres is a natural fit (relational: users, dishes, pods, ratings, cuisines) |
| **ORM** | e.g. Prisma / Drizzle if using Postgres + Node |
| **Auth** | Roll your own email/password vs. an auth provider (e.g. Auth.js/NextAuth, Clerk, Supabase Auth) — a provider will save significant build time for MVP |
| **Photo storage/hosting** | e.g. S3, Cloudinary, or Supabase Storage — affects cost and upload flow complexity |
| **Hosting** | e.g. Vercel (pairs well with Next.js), Railway, Render, Fly.io |
| **Real-time/notifications** | Needed only if notifications are in scope for v1; otherwise skip infra for this entirely |
| **Environment/secrets management** | How API keys, DB credentials, etc. are stored for local dev vs. production |
| **Domain/name** | Tied to the branding decision above |

**Suggested MVP-minimizing stack** (to reduce decisions and move fast):
Next.js (frontend + API routes) + Postgres + Prisma + an auth provider
(Supabase Auth or Clerk) + Supabase Storage or Cloudinary for photos +
Vercel for hosting. This keeps the whole stack in a small number of
services and is a well-trodden path for an app of this shape.

---

## 7. Suggested Build Order

1. Data model + database schema (users, dishes, pods, pod_members, ratings,
   cuisines, want_to_try)
2. Auth (sign up, log in, sessions)
3. Add-a-dish flow (no ranking yet — just create + store)
4. Personal rank list (display only, manually seed a couple of dishes to
   test)
5. Pairwise comparison flow + insertion-sort ranking logic (cuisine-anchored)
6. Dish detail page
7. Pods (create/join/invite) + combined pod view
8. Want-to-try (add, convert-to-dish flow)
9. Profile (signature dish, crowd-score list, privacy setting)
10. Feed
11. Polish pass: sage green branding, empty states, mobile responsiveness
