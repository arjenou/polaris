/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import {
  CONTACT_SUBMISSION_SELECT,
  toContactSubmissionApiShape,
  type ContactSubmissionRow,
} from "../../../_lib/contactSubmissions";

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare(`${CONTACT_SUBMISSION_SELECT} WHERE cs.id = ?`)
    .bind(id)
    .first<ContactSubmissionRow>();
  if (!row) return errorJson("未找到该咨询记录", 404);

  return json(toContactSubmissionApiShape(row));
};
