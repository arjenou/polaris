/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import { toHomeHeroSlideApiShape, type HomeHeroSlideRow } from "../../../../_lib/homeHero";

interface HomeHeroSlideUpdateInput {
  objectPositionX?: number;
  objectPositionY?: number;
}

function clampPosition(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  let input: HomeHeroSlideUpdateInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const row = await env.DB.prepare("SELECT * FROM home_hero_slides WHERE id = ?").bind(id).first<HomeHeroSlideRow>();
  if (!row) return errorJson("未找到该图片", 404);

  if (input.objectPositionX === undefined && input.objectPositionY === undefined) {
    return errorJson("请提供 objectPosition", 400);
  }

  await env.DB.prepare(
    `UPDATE home_hero_slides
     SET object_position_x = ?, object_position_y = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      clampPosition(input.objectPositionX, row.object_position_x ?? 50),
      clampPosition(input.objectPositionY, row.object_position_y ?? 0),
      id,
    )
    .run();

  const updated = await env.DB.prepare("SELECT * FROM home_hero_slides WHERE id = ?").bind(id).first<HomeHeroSlideRow>();
  await triggerRevalidate(env, { kind: "home-hero" });
  return json(toHomeHeroSlideApiShape(updated!, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  await env.DB.prepare("DELETE FROM home_hero_slides WHERE id = ?").bind(id).run();

  await triggerRevalidate(env, { kind: "home-hero" });
  return json({ ok: true });
};
