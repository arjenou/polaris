/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import { toTagsJson, toTeamApiShape, validateTeamMember, applyTeamPresident, type TeamMemberInput, type TeamMemberRow } from "../../../_lib/team";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT * FROM team_members WHERE id = ?").bind(id).first<TeamMemberRow>();
  if (!row) return errorJson("未找到该社员", 404);

  const count = await env.DB.prepare("SELECT COUNT(*) as count FROM contact_submissions WHERE member_id = ?")
    .bind(id)
    .first<{ count: number }>();

  return json(toTeamApiShape(row, new URL(request.url).origin, count?.count ?? 0));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  let input: TeamMemberInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateTeamMember(input);
  if (validationError) return errorJson(validationError, 400);

  await env.DB.prepare(
    `UPDATE team_members SET
       locale = ?, last_name = ?, first_name = ?, last_name_kana = ?, first_name_kana = ?,
       department = ?, position = ?, description = ?, tags = ?, languages = ?,
       image_key = ?, image_width = ?, image_height = ?, is_president = ?, published = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      input.locale,
      input.lastName,
      input.firstName,
      input.lastNameKana ?? "",
      input.firstNameKana ?? "",
      input.department,
      input.position ?? "",
      input.description ?? "",
      toTagsJson(input.tags),
      toTagsJson(input.languages),
      input.imageKey ?? null,
      input.imageWidth ?? null,
      input.imageHeight ?? null,
      input.isPresident ? 1 : 0,
      input.published === false ? 0 : 1,
      id,
    )
    .run();

  if (input.isPresident) {
    await applyTeamPresident(env, input.locale!, id);
  }

  const row = await env.DB.prepare("SELECT * FROM team_members WHERE id = ?").bind(id).first<TeamMemberRow>();
  if (!row) return errorJson("未找到该社员", 404);

  const count = await env.DB.prepare("SELECT COUNT(*) as count FROM contact_submissions WHERE member_id = ?")
    .bind(id)
    .first<{ count: number }>();

  await triggerRevalidate(env, { kind: "team", locale: input.locale! });
  return json(toTeamApiShape(row, new URL(request.url).origin, count?.count ?? 0));
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT locale FROM team_members WHERE id = ?")
    .bind(id)
    .first<{ locale: string }>();

  await env.DB.prepare("DELETE FROM team_members WHERE id = ?").bind(id).run();

  if (row) await triggerRevalidate(env, { kind: "team", locale: row.locale });

  return json({ ok: true });
};
