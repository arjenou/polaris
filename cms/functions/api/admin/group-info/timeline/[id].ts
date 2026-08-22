/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import {
  toGroupTimelineApiShape,
  validateGroupTimeline,
  type GroupTimelineInput,
  type GroupTimelineRow,
} from "../../../../_lib/groupInfo";

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT * FROM group_timeline WHERE id = ?").bind(id).first<GroupTimelineRow>();
  if (!row) return errorJson("未找到该记录", 404);

  return json(toGroupTimelineApiShape(row));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  let input: GroupTimelineInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateGroupTimeline(input);
  if (validationError) return errorJson(validationError, 400);

  await env.DB.prepare(
    `UPDATE group_timeline SET locale = ?, date = ?, event = ?, published = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(input.locale, input.date, input.event, input.published === false ? 0 : 1, id)
    .run();

  const row = await env.DB.prepare("SELECT * FROM group_timeline WHERE id = ?").bind(id).first<GroupTimelineRow>();
  if (!row) return errorJson("未找到该记录", 404);

  await triggerRevalidate(env, { kind: "group-companies", locale: input.locale });
  return json(toGroupTimelineApiShape(row));
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT locale FROM group_timeline WHERE id = ?").bind(id).first<{ locale: string }>();

  await env.DB.prepare("DELETE FROM group_timeline WHERE id = ?").bind(id).run();

  if (row) await triggerRevalidate(env, { kind: "group-companies", locale: row.locale });
  return json({ ok: true });
};
