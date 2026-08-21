/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { json } from "../../../_lib/response";
import {
  CONTACT_SUBMISSION_SELECT,
  toContactSubmissionApiShape,
  type ContactSubmissionRow,
} from "../../../_lib/contactSubmissions";

/** Read-only list of real /contact submissions, newest first, with the
 * attributed team member's name (if the visitor came via their "consult"
 * button) so the admin can review actual inquiries, not just counts. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `${CONTACT_SUBMISSION_SELECT}
     ORDER BY cs.created_at DESC`,
  ).all<ContactSubmissionRow>();

  return json((results ?? []).map(toContactSubmissionApiShape));
};
