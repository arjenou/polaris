/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import {
  isPageMidImageKey,
  toPageMidImagePublicShape,
  type PageMidImageRow,
} from "../../_lib/pageMidImages";

/** Public read-only endpoint for the optional mid-page banner on the three
 * subsidiary pages (between advantages and the photo carousel).
 * GET ?pageKey=real-estate -> { src, width, height } or null */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const pageKey = url.searchParams.get("pageKey");

  if (!isPageMidImageKey(pageKey)) {
    return errorJson("pageKey 参数不正确", 400, PUBLIC_CORS_HEADERS);
  }

  const row = await env.DB.prepare("SELECT * FROM page_mid_images WHERE page_key = ?")
    .bind(pageKey)
    .first<PageMidImageRow>();

  if (!row) {
    return json(null, {}, PUBLIC_CORS_HEADERS);
  }

  return json(toPageMidImagePublicShape(row, url.origin), {}, PUBLIC_CORS_HEADERS);
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
