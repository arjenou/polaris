/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import type { GroupCompanyRow } from "../../_lib/groupCompanies";

/** Public read-only endpoint consumed by the グループ情報 (enterprise-intelligence)
 * page's "グループ企業紹介" section.
 * GET ?locale=ja -> { domestic: [...], overseas: [...] }, each ordered by
 * admin-managed sort_order. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");

  if (locale !== "ja" && locale !== "zh") {
    return errorJson("locale 参数必须是 ja 或 zh", 400, PUBLIC_CORS_HEADERS);
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM group_companies WHERE locale = ? ORDER BY region, sort_order ASC",
  )
    .bind(locale)
    .all<GroupCompanyRow>();

  const shape = (row: GroupCompanyRow) => ({
    id: row.id,
    name: row.name,
    business: row.business,
    address: row.address,
    image: row.image_key ? `${url.origin}/media/${row.image_key}` : null,
    href: row.href,
    comingSoon: Boolean(row.coming_soon),
  });

  const rows = results ?? [];
  return json(
    {
      domestic: rows.filter((row) => row.region === "domestic").map(shape),
      overseas: rows.filter((row) => row.region === "overseas").map(shape),
    },
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
