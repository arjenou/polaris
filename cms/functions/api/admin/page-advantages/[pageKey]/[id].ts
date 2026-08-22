/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import {
  isAdvantagePageKey,
  toPageAdvantageApiShape,
  validatePageAdvantage,
  type PageAdvantageInput,
  type PageAdvantageRow,
} from "../../../../_lib/pageAdvantages";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isAdvantagePageKey(pageKey)) return errorJson("无效的 pageKey", 400);

  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT * FROM page_advantages WHERE id = ? AND page_key = ?")
    .bind(id, pageKey)
    .first<PageAdvantageRow>();
  if (!row) return errorJson("未找到该条目", 404);

  return json(toPageAdvantageApiShape(row, new URL(request.url).origin));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isAdvantagePageKey(pageKey)) return errorJson("无效的 pageKey", 400);

  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  let input: PageAdvantageInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validatePageAdvantage(input);
  if (validationError) return errorJson(validationError, 400);

  await env.DB.prepare(
    `UPDATE page_advantages SET
       locale = ?, badge = ?, heading = ?, body = ?, image_key = ?, image_width = ?, image_height = ?,
       published = ?, updated_at = datetime('now')
     WHERE id = ? AND page_key = ?`,
  )
    .bind(
      input.locale,
      input.badge ?? "",
      input.heading,
      input.body,
      input.imageKey ?? null,
      input.imageWidth ?? null,
      input.imageHeight ?? null,
      input.published === false ? 0 : 1,
      id,
      pageKey,
    )
    .run();

  const row = await env.DB.prepare("SELECT * FROM page_advantages WHERE id = ? AND page_key = ?")
    .bind(id, pageKey)
    .first<PageAdvantageRow>();
  if (!row) return errorJson("未找到该条目", 404);

  await triggerRevalidate(env, { kind: "advantages", pageKey, locale: input.locale });
  return json(toPageAdvantageApiShape(row, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const pageKey = params.pageKey;
  if (!isAdvantagePageKey(pageKey)) return errorJson("无效的 pageKey", 400);

  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT locale FROM page_advantages WHERE id = ? AND page_key = ?")
    .bind(id, pageKey)
    .first<{ locale: string }>();

  await env.DB.prepare("DELETE FROM page_advantages WHERE id = ? AND page_key = ?").bind(id, pageKey).run();

  if (row) await triggerRevalidate(env, { kind: "advantages", pageKey, locale: row.locale });
  return json({ ok: true });
};
