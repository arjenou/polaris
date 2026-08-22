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

  const locale = new URL(request.url).searchParams.get("locale");
  const stmt = locale
    ? env.DB.prepare("SELECT * FROM page_advantages WHERE page_key = ? AND locale = ? ORDER BY sort_order ASC").bind(
        pageKey,
        locale,
      )
    : env.DB.prepare("SELECT * FROM page_advantages WHERE page_key = ? ORDER BY locale, sort_order ASC").bind(
        pageKey,
      );

  const { results } = await stmt.all<PageAdvantageRow>();
  return json((results ?? []).map((row) => toPageAdvantageApiShape(row, new URL(request.url).origin)));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const pageKey = params.pageKey;
  if (!isAdvantagePageKey(pageKey)) return errorJson("无效的 pageKey", 400);

  let input: PageAdvantageInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validatePageAdvantage(input);
  if (validationError) return errorJson(validationError, 400);

  const maxOrder = await env.DB.prepare(
    "SELECT MAX(sort_order) as maxOrder FROM page_advantages WHERE page_key = ? AND locale = ?",
  )
    .bind(pageKey, input.locale)
    .first<{ maxOrder: number | null }>();
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  const result = await env.DB.prepare(
    `INSERT INTO page_advantages (page_key, locale, badge, heading, body, image_key, image_width, image_height, sort_order, published, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(
      pageKey,
      input.locale,
      input.badge ?? "",
      input.heading,
      input.body,
      input.imageKey ?? null,
      input.imageWidth ?? null,
      input.imageHeight ?? null,
      nextOrder,
      input.published === false ? 0 : 1,
    )
    .run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare("SELECT * FROM page_advantages WHERE id = ?").bind(id).first<PageAdvantageRow>();

  await triggerRevalidate(env, { kind: "advantages", pageKey, locale: input.locale });
  return json(toPageAdvantageApiShape(row!, new URL(request.url).origin), { status: 201 });
};
