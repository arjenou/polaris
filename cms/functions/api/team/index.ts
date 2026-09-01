/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import type { TeamMemberRow } from "../../_lib/team";

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Public read-only endpoint consumed by the homepage team carousel.
 * GET ?locale=ja -> published members; president flag included for client-side ordering. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");

  if (locale !== "ja" && locale !== "zh") {
    return errorJson("locale 参数必须是 ja 或 zh", 400, PUBLIC_CORS_HEADERS);
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM team_members WHERE locale = ? AND published = 1 ORDER BY sort_order ASC",
  )
    .bind(locale)
    .all<TeamMemberRow>();

  return json(
    (results ?? []).map((row) => ({
      id: row.id,
      lastName: row.last_name,
      firstName: row.first_name,
      lastNameKana: row.last_name_kana,
      firstNameKana: row.first_name_kana,
      department: row.department,
      position: row.position,
      description: row.description,
      tags: parseJsonArray(row.tags),
      languages: parseJsonArray(row.languages),
      image: row.image_key ? `${url.origin}/media/${row.image_key}` : null,
      imageWidth: row.image_width ?? 400,
      imageHeight: row.image_height ?? 500,
      isPresident: Boolean(row.is_president),
    })),
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
