/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import { isHomeHeroLocale, type HomeHeroHeadlineRow, type HomeHeroSlideRow } from "../../_lib/homeHero";

/** Public read-only endpoint consumed by the homepage hero section.
 * GET ?locale=ja -> { headline, slides: [{ src }] }. Slides are shared
 * across ja/zh (same background images regardless of language), the
 * headline text differs per locale. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");

  if (!isHomeHeroLocale(locale)) {
    return errorJson("locale 参数不正确", 400, PUBLIC_CORS_HEADERS);
  }

  const [headlineRow, slidesResult] = await Promise.all([
    env.DB.prepare("SELECT * FROM home_hero_headlines WHERE locale = ?").bind(locale).first<HomeHeroHeadlineRow>(),
    env.DB.prepare("SELECT * FROM home_hero_slides ORDER BY sort_order ASC").all<HomeHeroSlideRow>(),
  ]);

  return json(
    {
      headline: headlineRow?.headline ?? "",
      slides: (slidesResult.results ?? []).map((row) => ({ src: `${url.origin}/media/${row.image_key}` })),
    },
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
