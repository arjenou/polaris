/// <reference types="@cloudflare/workers-types" />

export type HomeHeroLocale = "ja" | "zh";

export function isHomeHeroLocale(value: unknown): value is HomeHeroLocale {
  return value === "ja" || value === "zh";
}

export interface HomeHeroHeadlineRow {
  locale: string;
  headline: string;
  updated_at: string;
}

export function toHomeHeroHeadlineApiShape(row: HomeHeroHeadlineRow) {
  return {
    locale: row.locale,
    headline: row.headline,
    updatedAt: row.updated_at,
  };
}

export interface HomeHeroSlideRow {
  id: number;
  image_key: string;
  image_width: number | null;
  image_height: number | null;
  object_position_x: number;
  object_position_y: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function toHomeHeroSlideApiShape(row: HomeHeroSlideRow, origin: string) {
  return {
    id: row.id,
    imageKey: row.image_key,
    imageUrl: `${origin}/media/${row.image_key}`,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    objectPositionX: row.object_position_x,
    objectPositionY: row.object_position_y,
    sortOrder: row.sort_order,
  };
}
