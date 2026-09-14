# Design Brief — Noosh Jan (نوش جان)

For Claude Code to reference when building any screen/component. This
should be treated as ground truth for visual direction — check new UI
against it rather than reaching for generic component defaults.

## Subject & audience

This is not a restaurant-discovery app and not a recipe manager. It's a
personal, slightly playful ranking tool for food people actually cook for
each other — couples, roommates, families. The emotional core is
relationships and home cooking, not productivity or logistics. The
audience is small, known groups (a partner, a family, a close friend
group), not a public feed of strangers. Design should feel like something
you'd show your mom, not something you'd pitch to a VC.

## Color

Base palette (4–6 named values — treat these as starting points, not
final, but keep the relationships):

- `sage-900` `#293D1D` — darkest, for text-on-accent and high-contrast
  headlines where needed
- `sage-600` `#5F7F45` — primary accent: active tabs, primary buttons,
  score numbers, links
- `sage-200` `#C3D9B4` — mid accent for secondary fills (chips, subtle
  highlights)
- `sage-50` `#EEF3EA` — lightest accent tint, backgrounds for tags/chips
- `cream` `#FBF9F4` — warm neutral background (avoid stark white; avoid the
  generic AI-cream near #F4F1EA — go slightly warmer/yellower to
  differentiate)
- `ink` `#2A2A24` — near-black text color, warm-toned rather than true
  black or blue-black

Avoid: terracotta/clay accents (too close to the generic AI-generated
default), acid green on near-black, and a flat grey/blue SaaS palette.
Sage should feel like an herb garden and a well-used cutting board, not a
"wellness app" mint.

## Type

Two typefaces, clearly distinct roles:
- **Display/headline**: a warm, slightly humanist serif or slab serif with
  some personality — used for dish names, screen titles, and the score
  number itself (the score should feel like a stamp or a hand-set number,
  not a data-dashboard digit).
- **Body/UI**: a clean, legible sans-serif for everything functional — nav,
  buttons, form labels, filter chips.

Avoid tracked-out all-caps labels, middle-dot-joined meta strings, and
appended arrows on buttons/links — write plain, direct labels instead
("Log a dish," not "LOG A DISH →").

## Layout

- Photo-forward throughout — dish photos should be the largest visual
  element on any card or list row, never a small thumbnail competing with
  text.
- Center-aligned for focused single-action moments (the pairwise
  comparison screen especially — this should feel like a clean, almost
  ceremonial choice between two things, not a busy form).
- Left-aligned, list-based for browsing screens (personal rank, pod home,
  feed) — these are scanning contexts, not landing pages.
- Avoid the identical-rounded-card-with-soft-shadow treatment on every
  element; vary card treatment by hierarchy (e.g. the featured
  "signature dish" on a profile should look meaningfully different from a
  plain list row, not just a bigger version of the same card).
- Score numbers and agreement/spread indicators should sit close to the
  dish name — this is the single most important piece of information on
  most screens and should never be an afterthought in a corner.

## Interaction & motion

- Motion should respond to user action, not decorate on load — e.g. a
  satisfying, single settle-into-place animation when a new dish slots
  into its rank position after a comparison, not fade-in-on-scroll effects
  scattered across every screen.
- The pairwise comparison ("which did you like more") is the one moment
  worth spending real design/motion energy on — it's the most repeated
  interaction in the app and should feel tactile and quick, closer to a
  card flip/swipe than a form submission.

## Voice & copy

- Plain, warm, direct — write like you're talking to family, not a SaaS
  product. "Log a dish," "Which did you like more?", "Split decision,"
  "Everyone loved it" rather than corporate-neutral phrasing.
- Empty states are invitations, not apologies: a new pod with no shared
  history yet should read like "Nothing here yet — log your first dish
  together," not a generic "No data available."
- Never editorialize about the food itself (no invented flavor descriptors)
  — the app reflects what real people rated, not marketing copy.

## Principles

1. **The score is the hero, the photo is the context.** Every layout
   decision should protect the visibility of both.
2. **Disagreement is a feature, not noise.** Never let a UI treatment
   flatten two very different opinions into a single number without a
   visible spread/agreement cue nearby.
3. **Fast beats thorough.** Every screen tied to the core loop (log a
   dish, rank a dish) should read as effortless — minimal fields, minimal
   copy, nothing that feels like paperwork.
4. **Warm, not wellness.** Sage green here means garden/kitchen, not spa —
   avoid pairing it with the soft, minimal "calm app" visual language that
   the color often defaults to.

## Name

**Noosh Jan** (نوش جان) — a Persian phrase said to someone before/after a
meal, roughly "enjoy your meal" / "may it nourish you." Warm, personal,
food-and-people-centered — use this spelling consistently everywhere
(repo, domain, UI copy, app store listing if applicable). Don't mix with
alternate transliterations (Noosh Jan / Nush Jan / Nooshe Jan) once this
is picked.

The name's cultural warmth pairs naturally with the sage/kitchen-garden
palette and the "said with love, not marketing" voice described above —
lean into that in copy (e.g. a header greeting or empty-state message
could genuinely use the phrase itself).

## Open (decide during build, update this file once settled)

- Final display serif / body sans-serif pairing — consider whether the
  serif choice should have any visual nod to the name's origin without
  tipping into cliché (a decorative "ethnic" font is a trap to avoid;
  a well-chosen humanist serif is safer and more timeless)
- Whether a secondary accent color (e.g. a warm cream/terracotta contrast)
  is added alongside sage, or the palette stays sage-and-neutral only
