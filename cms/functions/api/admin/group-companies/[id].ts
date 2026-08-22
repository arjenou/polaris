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

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT * FROM group_companies WHERE id = ?").bind(id).first<GroupCompanyRow>();
  if (!row) return errorJson("未找到该企业", 404);

  return json(toGroupCompanyApiShape(row, new URL(request.url).origin));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  let input: GroupCompanyInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateGroupCompany(input);
  if (validationError) return errorJson(validationError, 400);

  await env.DB.prepare(
    `UPDATE group_companies SET
       locale = ?, region = ?, name = ?, business = ?, address = ?, image_key = ?, image_width = ?, image_height = ?,
       href = ?, coming_soon = ?, published = ?, updated_at = datetime('now')
     WHERE id = ?`,
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
      input.published === false ? 0 : 1,
      id,
    )
    .run();

  const row = await env.DB.prepare("SELECT * FROM group_companies WHERE id = ?").bind(id).first<GroupCompanyRow>();
  if (!row) return errorJson("未找到该企业", 404);

  await triggerRevalidate(env, { kind: "group-companies", locale: input.locale });
  return json(toGroupCompanyApiShape(row, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT locale FROM group_companies WHERE id = ?")
    .bind(id)
    .first<{ locale: string }>();

  await env.DB.prepare("DELETE FROM group_companies WHERE id = ?").bind(id).run();

  if (row) await triggerRevalidate(env, { kind: "group-companies", locale: row.locale });
  return json({ ok: true });
};
