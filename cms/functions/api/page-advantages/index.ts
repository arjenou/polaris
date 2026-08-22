/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import { isAdvantagePageKey, type PageAdvantageRow } from "../../_lib/pageAdvantages";

/** Public read-only endpoint consumed by the "私たちが選ばれる理由" section of the
 * 不動産取引 / リノベーション / 不動産管理 pages.
 * GET ?pageKey=real-estate&locale=ja -> ordered list of {badge, heading, body, image}. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const pageKey = url.searchParams.get("pageKey");
  const locale = url.searchParams.get("locale");

  if (!isAdvantagePageKey(pageKey)) return errorJson("pageKey 参数不正确", 400, PUBLIC_CORS_HEADERS);
  if (locale !== "ja" && locale !== "zh") return errorJson("locale 参数不正确", 400, PUBLIC_CORS_HEADERS);

  const { results } = await env.DB.prepare(
    "SELECT * FROM page_advantages WHERE page_key = ? AND locale = ? AND published = 1 ORDER BY sort_order ASC",
  )
    .bind(pageKey, locale)
    .all<PageAdvantageRow>();

  return json(
    (results ?? []).map((row) => ({
      id: row.id,
      badge: row.badge,
      heading: row.heading,
      body: row.body,
      image: row.image_key ? `${url.origin}/media/${row.image_key}` : null,
    })),
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
