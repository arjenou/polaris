/** The three fixed content pages managed under "page-galleries" and
 * "page-advantages" (不動産取引 / リノベーション / 不動産管理). */
export const PAGE_KEYS = ["real-estate", "renovation", "asset-management"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export function isPageKey(value: unknown): value is PageKey {
  return typeof value === "string" && (PAGE_KEYS as readonly string[]).includes(value);
}
