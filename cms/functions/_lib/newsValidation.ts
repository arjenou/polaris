export const EXCERPT_MAX_LENGTH = 120;

/** Converts an ISO 8601 timestamp (e.g. from `Date.toISOString()`) into the
 * 'YYYY-MM-DD HH:MM:SS' UTC format SQLite's `datetime('now')` produces, so
 * `scheduled_at` can be compared directly against it in SQL. Returns null for
 * empty/invalid input. */
export function toSqliteDatetime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/** Converts a stored 'YYYY-MM-DD HH:MM:SS' UTC value back into an ISO 8601
 * string for API responses. */
export function fromSqliteDatetime(value: string | null): string | null {
  if (!value) return null;
  return `${value.replace(" ", "T")}Z`;
}
