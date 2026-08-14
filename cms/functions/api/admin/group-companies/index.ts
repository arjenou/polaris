/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import {
  toGroupCompanyApiShape,
  validateGroupCompany,
  type GroupCompanyInput,
  type GroupCompanyRow,
} from "../../../_lib/groupCompanies";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");
  const region = url.searchParams.get("region");

  const conditions: string[] = [];
  const values: string[] = [];
  if (locale) {
    conditions.push("locale = ?");
    values.push(locale);
  }
  if (region) {
    conditions.push("region = ?");
    values.push(region);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { results } = await env.DB.prepare(
    `SELECT * FROM group_companies ${where} ORDER BY locale, region, sort_order ASC`,
  )
    .bind(...values)
    .all<GroupCompanyRow>();

  return json((results ?? []).map((row) => toGroupCompanyApiShape(row, url.origin)));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: GroupCompanyInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateGroupCompany(input);
  if (validationError) return errorJson(validationError, 400);

  const maxOrder = await env.DB.prepare(
    "SELECT MAX(sort_order) as maxOrder FROM group_companies WHERE locale = ? AND region = ?",
  )
    .bind(input.locale, input.region)
    .first<{ maxOrder: number | null }>();
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  const result = await env.DB.prepare(
    `INSERT INTO group_companies
       (locale, region, name, business, address, image_key, image_width, image_height, href, coming_soon, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
  )
    .bind(
      input.locale,
      input.region,
      input.name,
      input.business ?? "",
      input.address ?? "",
      input.imageKey ?? null,
      input.imageWidth ?? null,
      input.imageHeight ?? null,
      input.href ?? null,
      input.comingSoon ? 1 : 0,
      nextOrder,
    )
    .run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare("SELECT * FROM group_companies WHERE id = ?").bind(id).first<GroupCompanyRow>();

  await triggerRevalidate(env, { kind: "group-companies", locale: input.locale });
  return json(toGroupCompanyApiShape(row!, new URL(request.url).origin), { status: 201 });
};
