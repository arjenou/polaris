/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { json } from "../../_lib/response";
import { buildClearSessionCookie } from "../../_lib/session";

export const onRequestPost: PagesFunction<Env> = async () => {
  return json({ ok: true }, {}, { "Set-Cookie": buildClearSessionCookie() });
};
