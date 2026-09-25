import Link from "next/link";
import type { MakerFilter } from "@/lib/personal-rank";

export function buildFilterHref(
  basePath: string,
  current: Record<string, string | undefined>,
  changes: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-sage-600 px-3 py-1.5 text-sm font-medium text-white"
          : "rounded-full border border-sage-200 px-3 py-1.5 text-sm text-ink/70 hover:border-sage-600"
      }
    >
      {children}
    </Link>
  );
}

/** Maker/cuisine/tag filter chips (spec §2.2) — shared across every
 * "ranked list of dishes" view: personal rank, a pod's combined rank, and
 * a profile's crowd-score list. `baseParams` lets a caller preserve other
 * query state (e.g. a pod page's `view=made` tab) across chip clicks. */
export function DishFilterChips({
  basePath,
  baseParams,
  maker,
  cuisineId,
  tagId,
  hasOthersMade,
  cuisineOptions,
  tagOptions,
  showMakerFilter = true,
}: {
  basePath: string;
  baseParams?: Record<string, string | undefined>;
  maker: MakerFilter;
  cuisineId?: string;
  tagId?: string;
  hasOthersMade: boolean;
  cuisineOptions: { id: string; name: string }[];
  tagOptions: { id: string; name: string }[];
  showMakerFilter?: boolean;
}) {
  const showMaker = showMakerFilter && hasOthersMade;
  if (!showMaker && cuisineOptions.length <= 1 && tagOptions.length === 0) return null;

  const href = (changes: Record<string, string | undefined>) =>
    buildFilterHref(basePath, { ...baseParams, maker: maker === "all" ? undefined : maker, cuisineId, tagId }, changes);

  return (
    <div className="mt-4 flex flex-col gap-2">
      {showMaker && (
        <div className="flex flex-wrap gap-1.5">
          <Chip href={href({ maker: undefined })} active={maker === "all"}>
            Everyone
          </Chip>
          <Chip href={href({ maker: "me" })} active={maker === "me"}>
            Me
          </Chip>
          <Chip href={href({ maker: "others" })} active={maker === "others"}>
            Others
          </Chip>
        </div>
      )}
      {cuisineOptions.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <Chip href={href({ cuisineId: undefined })} active={!cuisineId}>
            All cuisines
          </Chip>
          {cuisineOptions.map((c) => (
            <Chip key={c.id} href={href({ cuisineId: c.id })} active={cuisineId === c.id}>
              {c.name}
            </Chip>
          ))}
        </div>
      )}
      {tagOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Chip href={href({ tagId: undefined })} active={!tagId}>
            All tags
          </Chip>
          {tagOptions.map((t) => (
            <Chip key={t.id} href={href({ tagId: t.id })} active={tagId === t.id}>
              {t.name}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
