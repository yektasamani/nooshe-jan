/** "Added by" filter for want-to-try lists — a pod's list can get long
 * fast once everyone's dumping ideas into it, so it's worth being able to
 * narrow to one person's. */
export function deriveAddedByOptions(items: { addedBy: { id: string; name: string } }[]) {
  return [...new Map(items.map((i) => [i.addedBy.id, i.addedBy.name])).entries()].map(([id, name]) => ({
    id,
    name,
  }));
}

export function filterByAddedBy<T extends { addedById: string }>(items: T[], addedById?: string): T[] {
  return addedById ? items.filter((i) => i.addedById === addedById) : items;
}
