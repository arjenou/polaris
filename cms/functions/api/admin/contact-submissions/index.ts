/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { json } from "../../../_lib/response";
import { fromSqliteDatetime } from "../../../_lib/newsValidation";

interface SubmissionRow {
  id: number;
  locale: string;
  member_id: number | null;
  member_last_name: string | null;
  member_first_name: string | null;
  name: string;
  furigana: string;
  email: string;
  phone: string;
  inquiry_type: string;
  message: string;
  contact_method: string;
  created_at: string;
}

/** Read-only list of real /contact submissions, newest first, with the
 * attributed team member's name (if the visitor came via their "consult"
 * button) so the admin can review actual inquiries, not just counts. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `SELECT cs.*, tm.last_name AS member_last_name, tm.first_name AS member_first_name
     FROM contact_submissions cs
     LEFT JOIN team_members tm ON tm.id = cs.member_id
     ORDER BY cs.created_at DESC`,
  ).all<SubmissionRow>();

  return json(
    (results ?? []).map((row) => ({
      id: row.id,
      locale: row.locale,
      memberId: row.member_id,
      memberName: row.member_last_name ? `${row.member_last_name} ${row.member_first_name}` : null,
      name: row.name,
      furigana: row.furigana,
      email: row.email,
      phone: row.phone,
      inquiryType: row.inquiry_type,
      message: row.message,
      contactMethod: row.contact_method,
      createdAt: fromSqliteDatetime(row.created_at) ?? row.created_at,
    })),
  );
};
