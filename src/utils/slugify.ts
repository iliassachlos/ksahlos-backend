// Unicode-aware slug: keeps letters/numbers (incl. Greek), lowercases, and
// collapses everything else into single hyphens. Avoids empty slugs.
export const slugify = (text: string): string =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

// Title-cases each word ("black & white" -> "Black & White"). Works on Greek too.
export const titleCase = (text: string): string =>
  text
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
