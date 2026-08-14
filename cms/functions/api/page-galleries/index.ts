/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import { isPageGalleryKey, type PageGalleryImageRow } from "../../_lib/pageGalleries";

/** Public read-only endpoint consumed by the bottom photo carousel of the
 * 不動産取引 / リノベーション / 不動産管理 pages.
 * GET ?pageKey=real-estate -> ordered list of image URLs (shared across ja/zh). */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const pageKey = url.searchParams.get("pageKey");

  if (!isPageGalleryKey(pageKey)) {
    return errorJson("pageKey 参数不正确", 400, PUBLIC_CORS_HEADERS);
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM page_gallery_images WHERE page_key = ? ORDER BY sort_order ASC",
  )
    .bind(pageKey)
    .all<PageGalleryImageRow>();

  return json(
    (results ?? []).map((row) => ({ src: `${url.origin}/media/${row.image_key}` })),
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
