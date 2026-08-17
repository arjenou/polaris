/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { json } from "../../../_lib/response";
import { toContactQrApiShape, type ContactQrRow } from "../../../_lib/contactQr";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM contact_qr_codes ORDER BY type ASC").all<ContactQrRow>();

  const origin = new URL(request.url).origin;
  return json((results ?? []).map((row) => toContactQrApiShape(row, origin)));
};
