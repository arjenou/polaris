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

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");

  const where = locale ? "WHERE locale = ?" : "";
  const stmt = env.DB.prepare(`SELECT * FROM group_timeline ${where} ORDER BY locale, sort_order ASC`);
  const { results } = await (locale ? stmt.bind(locale) : stmt).all<GroupTimelineRow>();

  return json((results ?? []).map(toGroupTimelineApiShape));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: GroupTimelineInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateGroupTimeline(input);
  if (validationError) return errorJson(validationError, 400);

  const maxOrder = await env.DB.prepare("SELECT MAX(sort_order) as maxOrder FROM group_timeline WHERE locale = ?")
    .bind(input.locale)
    .first<{ maxOrder: number | null }>();
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  const result = await env.DB.prepare(
    `INSERT INTO group_timeline (locale, date, event, published, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(input.locale, input.date, input.event, input.published === false ? 0 : 1, nextOrder)
    .run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare("SELECT * FROM group_timeline WHERE id = ?").bind(id).first<GroupTimelineRow>();

  await triggerRevalidate(env, { kind: "group-companies", locale: input.locale });
  return json(toGroupTimelineApiShape(row!), { status: 201 });
};
