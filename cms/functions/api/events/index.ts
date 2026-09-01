/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import type { EventRow } from "../../_lib/events";

const EFFECTIVELY_PUBLISHED = "(published = 1 OR (scheduled_at IS NOT NULL AND scheduled_at <= datetime('now')))";

function parseGallery(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function toMediaUrl(origin: string, key: string | null): string | null {
  return key ? `${origin}/media/${key}` : null;
}

/** Public read-only endpoint consumed by the homepage carousel, the events
 * list pages, and the event detail pages.
 * GET ?locale=ja            -> published event cards, admin-managed order
 * GET ?locale=ja&slug=xxx   -> single published event with full detail
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
      `SELECT * FROM events WHERE locale = ? AND slug = ? AND ${EFFECTIVELY_PUBLISHED}`,
    )
      .bind(locale, slug)
      .first<EventRow>();

    if (!row) return errorJson("未找到该活动", 404, PUBLIC_CORS_HEADERS);

    return json(
      {
        slug: row.slug,
        title: row.title,
        date: row.date,
        dateRange: row.date_range || null,
        badge: row.badge,
        badgeColor: row.badge_color,
        summary: row.summary || null,
        image: toMediaUrl(url.origin, row.cover_image_key),
        heroImage: toMediaUrl(url.origin, row.hero_image_key) ?? toMediaUrl(url.origin, row.cover_image_key),
        videoUrl: row.video_url || null,
        videoPosterImage: toMediaUrl(url.origin, row.video_poster_key),
        overview:
          row.overview_event_name || row.overview_datetime || row.overview_venue
            ? {
                eventName: row.overview_event_name,
                datetime: row.overview_datetime,
                venue: row.overview_venue,
                participants: row.overview_participants,
                content: row.overview_content,
                organizer: row.overview_organizer,
              }
            : null,
        gallery: parseGallery(row.gallery)
          .map((key) => toMediaUrl(url.origin, key))
          .filter((v): v is string => Boolean(v)),
      },
      {},
      PUBLIC_CORS_HEADERS,
    );
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM events WHERE locale = ? AND ${EFFECTIVELY_PUBLISHED} ORDER BY sort_order ASC`,
  )
    .bind(locale)
    .all<EventRow>();

  return json(
    (results ?? []).map((row) => ({
      slug: row.slug,
      title: row.title,
      date: row.date,
      dateRange: row.date_range || null,
      badge: row.badge,
      badgeColor: row.badge_color,
      image: toMediaUrl(url.origin, row.cover_image_key),
    })),
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
