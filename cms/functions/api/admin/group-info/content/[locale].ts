/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import {
  isGroupInfoLocale,
  toGroupInfoContentApiShape,
  validateGroupInfoContent,
  type GroupInfoContentInput,
  type GroupInfoContentRow,
} from "../../../../_lib/groupInfo";

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const locale = params.locale;
  if (!isGroupInfoLocale(locale)) return errorJson("无效的 locale", 400);

  let input: GroupInfoContentInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validateGroupInfoContent(input);
  if (validationError) return errorJson(validationError, 400);

  await env.DB.prepare(
    `UPDATE group_info_content SET
       hero_title = ?, intro_title = ?, intro = ?, timeline_title = ?,
       companies_title = ?, domestic_title = ?, overseas_title = ?, updated_at = datetime('now')
     WHERE locale = ?`,
  )
    .bind(
      input.heroTitle,
      input.introTitle,
      JSON.stringify(input.intro),
      input.timelineTitle,
      input.companiesTitle ?? "",
      input.domesticTitle ?? "",
      input.overseasTitle ?? "",
      locale,
    )
    .run();

  const row = await env.DB.prepare("SELECT * FROM group_info_content WHERE locale = ?")
    .bind(locale)
    .first<GroupInfoContentRow>();

  await triggerRevalidate(env, { kind: "group-companies", locale });
  return json(toGroupInfoContentApiShape(row!));
};
