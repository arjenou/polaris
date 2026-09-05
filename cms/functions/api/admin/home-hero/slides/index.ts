/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import { toHomeHeroSlideApiShape, type HomeHeroSlideRow } from "../../../../_lib/homeHero";

interface HomeHeroSlideInput {
  imageKey?: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
  objectPositionX?: number;
  objectPositionY?: number;
}

function clampPosition(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM home_hero_slides ORDER BY sort_order ASC").all<HomeHeroSlideRow>();

  return json((results ?? []).map((row) => toHomeHeroSlideApiShape(row, new URL(request.url).origin)));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: HomeHeroSlideInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  if (!input.imageKey) return errorJson("imageKey 不能为空", 400);

  const maxOrder = await env.DB.prepare("SELECT MAX(sort_order) as maxOrder FROM home_hero_slides").first<{
    maxOrder: number | null;
  }>();
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  const result = await env.DB.prepare(
    `INSERT INTO home_hero_slides
       (image_key, image_width, image_height, object_position_x, object_position_y, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(
      input.imageKey,
      input.imageWidth ?? null,
      input.imageHeight ?? null,
      clampPosition(input.objectPositionX, 50),
      clampPosition(input.objectPositionY, 0),
      nextOrder,
    )
    .run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare("SELECT * FROM home_hero_slides WHERE id = ?").bind(id).first<HomeHeroSlideRow>();

  await triggerRevalidate(env, { kind: "home-hero" });
  return json(toHomeHeroSlideApiShape(row!, new URL(request.url).origin), { status: 201 });
};
