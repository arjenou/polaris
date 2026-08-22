/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import { toHomeHeroSlideApiShape, type HomeHeroSlideRow } from "../../../../_lib/homeHero";

interface HomeHeroSlideInput {
  imageKey?: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
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
    `INSERT INTO home_hero_slides (image_key, image_width, image_height, sort_order, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
  )
    .bind(input.imageKey, input.imageWidth ?? null, input.imageHeight ?? null, nextOrder)
    .run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare("SELECT * FROM home_hero_slides WHERE id = ?").bind(id).first<HomeHeroSlideRow>();

  await triggerRevalidate(env, { kind: "home-hero" });
  return json(toHomeHeroSlideApiShape(row!, new URL(request.url).origin), { status: 201 });
};
