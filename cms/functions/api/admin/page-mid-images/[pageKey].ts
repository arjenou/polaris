/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import {
  isPageMidImageKey,
  toPageMidImageApiShape,
  type PageMidImageRow,
} from "../../../_lib/pageMidImages";

interface PageMidImageInput {
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isPageMidImageKey(pageKey)) return errorJson("无效的 pageKey", 400);

  const row = await env.DB.prepare("SELECT * FROM page_mid_images WHERE page_key = ?")
    .bind(pageKey)
    .first<PageMidImageRow>();

  if (!row) {
    return json({
      pageKey,
      imageKey: null,
      imageUrl: null,
      imageWidth: null,
      imageHeight: null,
      updatedAt: null,
    });
  }

  return json(toPageMidImageApiShape(row, new URL(request.url).origin));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isPageMidImageKey(pageKey)) return errorJson("无效的 pageKey", 400);

  let input: PageMidImageInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }
  if (!input.imageKey) return errorJson("imageKey 不能为空", 400);

  await env.DB.prepare(
    `INSERT INTO page_mid_images (page_key, image_key, image_width, image_height, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(page_key) DO UPDATE SET
       image_key = excluded.image_key,
       image_width = excluded.image_width,
       image_height = excluded.image_height,
       updated_at = datetime('now')`,
  )
    .bind(pageKey, input.imageKey, input.imageWidth ?? null, input.imageHeight ?? null)
    .run();

  const row = await env.DB.prepare("SELECT * FROM page_mid_images WHERE page_key = ?")
    .bind(pageKey)
    .first<PageMidImageRow>();

  await triggerRevalidate(env, { kind: "gallery", pageKey });
  return json(toPageMidImageApiShape(row!, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isPageMidImageKey(pageKey)) return errorJson("无效的 pageKey", 400);

  await env.DB.prepare(
    `UPDATE page_mid_images SET image_key = NULL, image_width = NULL, image_height = NULL, updated_at = datetime('now')
     WHERE page_key = ?`,
  )
    .bind(pageKey)
    .run();

  const row = await env.DB.prepare("SELECT * FROM page_mid_images WHERE page_key = ?")
    .bind(pageKey)
    .first<PageMidImageRow>();

  await triggerRevalidate(env, { kind: "gallery", pageKey });
  if (!row) {
    return json({
      pageKey,
      imageKey: null,
      imageUrl: null,
      imageWidth: null,
      imageHeight: null,
      updatedAt: null,
    });
  }
  return json(toPageMidImageApiShape(row, new URL(request.url).origin));
};
