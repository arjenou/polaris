/// <reference types="@cloudflare/workers-types" />
import { isPageKey, type PageKey } from "./pageKeys";

export { isPageKey as isAdvantagePageKey };
export type AdvantagePageKey = PageKey;

export interface PageAdvantageRow {
  id: number;
  page_key: string;
  locale: string;
  badge: string;
  heading: string;
  body: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  sort_order: number;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface PageAdvantageInput {
  locale?: string;
  badge?: string;
  heading?: string;
  body?: string;
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  published?: boolean;
}

export function toPageAdvantageApiShape(row: PageAdvantageRow, origin: string) {
  return {
    id: row.id,
    pageKey: row.page_key,
    locale: row.locale,
    badge: row.badge,
    heading: row.heading,
    body: row.body,
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    sortOrder: row.sort_order,
    published: row.published !== 0,
  };
}

export function validatePageAdvantage(input: PageAdvantageInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!input.heading) return "标题不能为空";
  if (!input.body) return "内容不能为空";
  return null;
}
