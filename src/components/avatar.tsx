import Image from "next/image";

export const AVATAR_SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-24 w-24 text-2xl",
};
const SIZE_PX: Record<"sm" | "md" | "lg", string> = {
  sm: "28px",
  md: "40px",
  lg: "96px",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** A photo if the user has uploaded one, else a sage initials circle —
 * never a broken image or empty space. */
export function Avatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  if (avatarUrl) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full bg-sage-50 ${AVATAR_SIZE_CLASSES[size]}`}>
        <Image src={avatarUrl} alt={name} fill sizes={SIZE_PX[size]} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-sage-200 font-medium text-sage-900 ${AVATAR_SIZE_CLASSES[size]}`}
    >
      {initials(name) || "?"}
    </div>
  );
}
