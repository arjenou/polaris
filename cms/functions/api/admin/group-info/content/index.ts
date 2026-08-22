/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { json } from "../../../../_lib/response";
import { toGroupInfoContentApiShape, type GroupInfoContentRow } from "../../../../_lib/groupInfo";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM group_info_content ORDER BY locale ASC").all<GroupInfoContentRow>();

  return json((results ?? []).map(toGroupInfoContentApiShape));
};
