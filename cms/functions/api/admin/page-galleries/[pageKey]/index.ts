/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import { isPageGalleryKey, toPageGalleryApiShape, type PageGalleryImageRow } from "../../../../_lib/pageGalleries";

interface PageGalleryImageInput {
  imageKey?: string;
  imageWidth?: number | null;
  imageHeight?: number | null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isPageGalleryKey(pageKey)) return errorJson("无效的 pageKey", 400);

  const { results } = await env.DB.prepare(
    "SELECT * FROM page_gallery_images WHERE page_key = ? ORDER BY sort_order ASC",
  )
    .bind(pageKey)
    .all<PageGalleryImageRow>();

  return json((results ?? []).map((row) => toPageGalleryApiShape(row, new URL(request.url).origin)));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isPageGalleryKey(pageKey)) return errorJson("无效的 pageKey", 400);

  let input: PageGalleryImageInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  if (!input.imageKey) return errorJson("imageKey 不能为空", 400);

  const maxOrder = await env.DB.prepare(
    "SELECT MAX(sort_order) as maxOrder FROM page_gallery_images WHERE page_key = ?",
  )
    .bind(pageKey)
    .first<{ maxOrder: number | null }>();
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  const result = await env.DB.prepare(
    `INSERT INTO page_gallery_images (page_key, image_key, image_width, image_height, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(pageKey, input.imageKey, input.imageWidth ?? null, input.imageHeight ?? null, nextOrder)
    .run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare("SELECT * FROM page_gallery_images WHERE id = ?")
    .bind(id)
    .first<PageGalleryImageRow>();

  await triggerRevalidate(env, { kind: "gallery", pageKey });
  return json(toPageGalleryApiShape(row!, new URL(request.url).origin), { status: 201 });
};
