/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import {
  toEventApiShape,
  toGalleryJson,
  validateEvent,
  resolveEventScheduledAt,
  type EventInput,
  type EventRow,
} from "../../../_lib/events";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");

  const stmt = locale
    ? env.DB.prepare("SELECT * FROM events WHERE locale = ? ORDER BY sort_order ASC").bind(locale)
    : env.DB.prepare("SELECT * FROM events ORDER BY locale, sort_order ASC");

  const { results } = await stmt.all<EventRow>();
  return json((results ?? []).map((row) => toEventApiShape(row, url.origin)));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: EventInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateEvent(input);
  if (validationError) return errorJson(validationError, 400);

  const maxOrder = await env.DB.prepare("SELECT MAX(sort_order) as maxOrder FROM events WHERE locale = ?")
    .bind(input.locale)
    .first<{ maxOrder: number | null }>();
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  try {
    const result = await env.DB.prepare(
      `INSERT INTO events
         (locale, slug, title, date, date_range, badge, badge_color, summary,
          cover_image_key, cover_image_width, cover_image_height,
          hero_image_key, hero_image_width, hero_image_height, video_url,
          video_poster_key, video_poster_width, video_poster_height,
          overview_event_name, overview_datetime, overview_venue, overview_participants, overview_content, overview_organizer,
          gallery, published, scheduled_at, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
      .bind(
        input.locale,
        input.slug,
        input.title,
        input.date,
        input.dateRange ?? "",
        input.badge,
        input.badgeColor ?? "#1E6FD9",
        input.summary ?? "",
        input.coverImageKey ?? null,
        input.coverImageWidth ?? null,
        input.coverImageHeight ?? null,
        input.heroImageKey ?? null,
        input.heroImageWidth ?? null,
        input.heroImageHeight ?? null,
        input.videoUrl ?? "",
        input.videoPosterKey ?? null,
        input.videoPosterWidth ?? null,
        input.videoPosterHeight ?? null,
        input.overview?.eventName ?? "",
        input.overview?.datetime ?? "",
        input.overview?.venue ?? "",
        input.overview?.participants ?? "",
        input.overview?.content ?? "",
        input.overview?.organizer ?? "",
        toGalleryJson(input.gallery),
        input.published === false ? 0 : 1,
        resolveEventScheduledAt(input),
        nextOrder,
      )
      .run();

    const id = result.meta.last_row_id;
    const row = await env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(id).first<EventRow>();
    await triggerRevalidate(env, { kind: "events", locale: input.locale!, slug: input.slug! });
    return json(toEventApiShape(row!, new URL(request.url).origin), { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("UNIQUE")) return errorJson("该语言下 slug 已存在", 409);
    return errorJson(`创建失败: ${message}`, 500);
  }
};
