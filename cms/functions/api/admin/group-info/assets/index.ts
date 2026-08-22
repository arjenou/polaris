/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { json } from "../../../../_lib/response";
import { toGroupInfoAssetApiShape, type GroupInfoAssetRow } from "../../../../_lib/groupInfo";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM group_info_assets ORDER BY type ASC").all<GroupInfoAssetRow>();

  const origin = new URL(request.url).origin;
  return json((results ?? []).map((row) => toGroupInfoAssetApiShape(row, origin)));
};
