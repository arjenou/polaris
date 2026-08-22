/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { json } from "../../../_lib/response";

/** Powers the "new inquiry" red dot in the sidebar nav. Kept as a tiny
 * dedicated endpoint (instead of reusing the full list) so the layout can
 * poll it cheaply on every navigation without re-fetching every submission. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM contact_submissions WHERE is_read = 0",
  ).first<{ count: number }>();

  return json({ count: row?.count ?? 0 });
};
