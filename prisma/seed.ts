import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seeded top-level cuisine taxonomy (spec §1/§4 — "finalize the seed list
// before building"). User-created cuisines always nest under one of these
// via search-or-create; this list can grow but these names should stay
// stable once dishes start referencing them.
const TOP_LEVEL_CUISINES = [
  "Middle Eastern",
  "East Asian",
  "South Asian",
  "Southeast Asian",
  "European",
  "Latin American",
  "African",
  "North American",
  "Other / Uncategorized",
];

async function main() {
  // Prisma's compound-unique `where` (name_parentId) can't take a literal
  // `null` for parentId (Postgres NULLs aren't comparable via `=`), so we
  // can't use upsert here — find-then-create instead.
  for (const name of TOP_LEVEL_CUISINES) {
    const existing = await prisma.cuisine.findFirst({
      where: { name, parentId: null },
    });
    if (!existing) {
      await prisma.cuisine.create({ data: { name, parentId: null, isSeeded: true } });
    }
  }
  console.log(`Seeded ${TOP_LEVEL_CUISINES.length} top-level cuisines.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
