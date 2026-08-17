/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import { toContactQrApiShape, type ContactQrRow } from "../../_lib/contactQr";

/** Public read-only endpoint consumed by the QR code section of the
 * お問い合わせ (Contact) page. Returns both slots keyed by type; imageUrl is
 * null when no image has been uploaded yet, in which case the frontend
 * falls back to its own "coming soon" placeholder text. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM contact_qr_codes").all<ContactQrRow>();

  const origin = new URL(request.url).origin;
  const shapes = (results ?? []).map((row) => toContactQrApiShape(row, origin));
  const wechat = shapes.find((s) => s.type === "wechat") ?? null;
  const line = shapes.find((s) => s.type === "line") ?? null;

  return json({ wechat, line }, {}, PUBLIC_CORS_HEADERS);
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
