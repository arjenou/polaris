/// <reference types="@cloudflare/workers-types" />

/** The three fixed content pages whose bottom photo carousel is managed from
 * the CMS. Keep in sync with the frontend's PAGE_GALLERY_LABELS. */
export const PAGE_GALLERY_KEYS = ["real-estate", "renovation", "asset-management"] as const;
export type PageGalleryKey = (typeof PAGE_GALLERY_KEYS)[number];

export function isPageGalleryKey(value: unknown): value is PageGalleryKey {
  return typeof value === "string" && (PAGE_GALLERY_KEYS as readonly string[]).includes(value);
}

export interface PageGalleryImageRow {
  id: number;
  page_key: string;
  image_key: string;
  image_width: number | null;
  image_height: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function toPageGalleryApiShape(row: PageGalleryImageRow, origin: string) {
  return {
    id: row.id,
    pageKey: row.page_key,
    imageKey: row.image_key,
    imageUrl: `${origin}/media/${row.image_key}`,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    sortOrder: row.sort_order,
  };
}
