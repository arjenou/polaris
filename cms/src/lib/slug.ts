function toAsciiSlug(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generates a URL-safe slug for a post (news or recommended) without
 * requiring manual input. Titles are mostly Japanese/Chinese, so an
 * ASCII-derived prefix is only included when the title actually contains
 * usable Latin/number characters; a date component plus a short random
 * suffix keep every slug unique.
 */
export function generateSlug(title: string, date: string): string {
  const titlePart = toAsciiSlug(title).slice(0, 40);
  const datePart = date.replace(/[^0-9]/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8);
  return [titlePart, datePart, randomPart].filter(Boolean).join("-");
}
