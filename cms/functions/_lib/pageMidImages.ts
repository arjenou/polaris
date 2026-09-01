/// <reference types="@cloudflare/workers-types" />
import { isPageKey, type PageKey } from "./pageKeys";

export type PageMidImageKey = PageKey;
export const isPageMidImageKey = isPageKey;

export interface PageMidImageRow {
  page_key: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  updated_at: string;
}

export function toPageMidImageApiShape(row: PageMidImageRow, origin: string) {
  return {
    pageKey: row.page_key,
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    updatedAt: row.updated_at,
  };
}

export function toPageMidImagePublicShape(row: PageMidImageRow, origin: string) {
  if (!row.image_key) return null;
  return {
    src: `${origin}/media/${row.image_key}`,
    width: row.image_width ?? 1200,
    height: row.image_height ?? 400,
  };
}
