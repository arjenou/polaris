/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";

interface NewsPostRow {
  id: number;
  locale: string;
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
}

function toImageUrl(origin: string, imageKey: string | null): string | null {
  return imageKey ? `${origin}/media/${imageKey}` : null;
}

/** Public read-only endpoint consumed by the Vercel-hosted front-end.
 * GET /api/news?locale=ja            -> published post summaries, newest first
 * GET /api/news?locale=ja&slug=xxx   -> single published post with full content
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");
  const slug = url.searchParams.get("slug");

  if (locale !== "ja" && locale !== "zh") {
    return errorJson("locale 参数必须是 ja 或 zh", 400, PUBLIC_CORS_HEADERS);
  }

  if (slug) {
    const row = await env.DB.prepare(
      "SELECT * FROM news_posts WHERE locale = ? AND slug = ? AND published = 1",
    )
      .bind(locale, slug)
      .first<NewsPostRow>();

    if (!row) return errorJson("未找到该新闻", 404, PUBLIC_CORS_HEADERS);

    return json(
      {
        slug: row.slug,
        title: row.title,
        date: row.date,
        tag: row.tag,
        excerpt: row.excerpt,
        content: row.content,
        image: toImageUrl(url.origin, row.image_key),
        imageWidth: row.image_width ?? 1200,
        imageHeight: row.image_height ?? 800,
      },
      {},
      PUBLIC_CORS_HEADERS,
    );
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM news_posts WHERE locale = ? AND published = 1 ORDER BY date DESC",
  )
    .bind(locale)
    .all<NewsPostRow>();

  return json(
    (results ?? []).map((row) => ({
      slug: row.slug,
      title: row.title,
      date: row.date,
      tag: row.tag,
      excerpt: row.excerpt,
      image: toImageUrl(url.origin, row.image_key),
    })),
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
