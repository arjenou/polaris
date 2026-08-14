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

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(id).first<EventRow>();
  if (!row) return errorJson("未找到该活动", 404);

  return json(toEventApiShape(row, new URL(request.url).origin));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  let input: EventInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateEvent(input);
  if (validationError) return errorJson(validationError, 400);

  const previous = await env.DB.prepare("SELECT locale, slug FROM events WHERE id = ?")
    .bind(id)
    .first<{ locale: string; slug: string }>();

  try {
    await env.DB.prepare(
      `UPDATE events SET
         locale = ?, slug = ?, title = ?, date = ?, date_range = ?, badge = ?, badge_color = ?, summary = ?,
         cover_image_key = ?, cover_image_width = ?, cover_image_height = ?,
         hero_image_key = ?, hero_image_width = ?, hero_image_height = ?, video_url = ?,
         overview_event_name = ?, overview_datetime = ?, overview_venue = ?, overview_participants = ?, overview_content = ?, overview_organizer = ?,
         gallery = ?, published = ?, scheduled_at = ?, updated_at = datetime('now')
       WHERE id = ?`,
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
        input.overview?.eventName ?? "",
        input.overview?.datetime ?? "",
        input.overview?.venue ?? "",
        input.overview?.participants ?? "",
        input.overview?.content ?? "",
        input.overview?.organizer ?? "",
        toGalleryJson(input.gallery),
        input.published === false ? 0 : 1,
        resolveEventScheduledAt(input),
        id,
      )
      .run();

    const row = await env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(id).first<EventRow>();
    if (!row) return errorJson("未找到该活动", 404);

    await triggerRevalidate(env, { kind: "events", locale: input.locale!, slug: input.slug! });
    if (previous && (previous.locale !== input.locale || previous.slug !== input.slug)) {
      await triggerRevalidate(env, { kind: "events", locale: previous.locale, slug: previous.slug });
    }

    return json(toEventApiShape(row, new URL(request.url).origin));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("UNIQUE")) return errorJson("该语言下 slug 已存在", 409);
    return errorJson(`更新失败: ${message}`, 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT locale, slug FROM events WHERE id = ?")
    .bind(id)
    .first<{ locale: string; slug: string }>();

  await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(id).run();

  if (row) await triggerRevalidate(env, { kind: "events", locale: row.locale, slug: row.slug });

  return json({ ok: true });
};
