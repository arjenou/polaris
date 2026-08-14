/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import { toTagsJson, toTeamApiShape, validateTeamMember, type TeamMemberInput, type TeamMemberRow } from "../../../_lib/team";

interface TeamMemberRowWithCount extends TeamMemberRow {
  submission_count: number;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");

  const stmt = locale
    ? env.DB.prepare(
        `SELECT tm.*, (SELECT COUNT(*) FROM contact_submissions cs WHERE cs.member_id = tm.id) AS submission_count
         FROM team_members tm WHERE tm.locale = ? ORDER BY tm.sort_order ASC`,
      ).bind(locale)
    : env.DB.prepare(
        `SELECT tm.*, (SELECT COUNT(*) FROM contact_submissions cs WHERE cs.member_id = tm.id) AS submission_count
         FROM team_members tm ORDER BY tm.locale, tm.sort_order ASC`,
      );

  const { results } = await stmt.all<TeamMemberRowWithCount>();
  return json((results ?? []).map((row) => toTeamApiShape(row, url.origin, row.submission_count)));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: TeamMemberInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateTeamMember(input);
  if (validationError) return errorJson(validationError, 400);

  const maxOrder = await env.DB.prepare("SELECT MAX(sort_order) as maxOrder FROM team_members WHERE locale = ?")
    .bind(input.locale)
    .first<{ maxOrder: number | null }>();
  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  const result = await env.DB.prepare(
    `INSERT INTO team_members
       (locale, last_name, first_name, last_name_kana, first_name_kana, department, position, description,
        tags, languages, image_key, image_width, image_height, sort_order, published, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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
      nextOrder,
      input.published === false ? 0 : 1,
    )
    .run();

  const id = result.meta.last_row_id;
  const row = await env.DB.prepare("SELECT * FROM team_members WHERE id = ?").bind(id).first<TeamMemberRow>();
  await triggerRevalidate(env, { kind: "team", locale: input.locale! });
  return json(toTeamApiShape(row!, new URL(request.url).origin, 0), { status: 201 });
};
