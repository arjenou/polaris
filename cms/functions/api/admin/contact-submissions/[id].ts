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

  // Opening the detail view is how an admin "reads" an inquiry, so clear its
  // unread dot here rather than requiring a separate mark-as-read call.
  if (!row.is_read) {
    await env.DB.prepare("UPDATE contact_submissions SET is_read = 1 WHERE id = ?").bind(id).run();
    row.is_read = 1;
  }

  return json(toContactSubmissionApiShape(row));
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const existing = await env.DB.prepare("SELECT id FROM contact_submissions WHERE id = ?")
    .bind(id)
    .first<{ id: number }>();
  if (!existing) return errorJson("未找到该咨询记录", 404);

  await env.DB.prepare("DELETE FROM contact_submissions WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
