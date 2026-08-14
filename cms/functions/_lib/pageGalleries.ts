/// <reference types="@cloudflare/workers-types" />
import { isPageKey, type PageKey } from "./pageKeys";

export type PageGalleryKey = PageKey;
export const isPageGalleryKey = isPageKey;

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
