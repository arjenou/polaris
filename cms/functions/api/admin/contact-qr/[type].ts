/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import { isContactQrType, toContactQrApiShape, type ContactQrRow } from "../../../_lib/contactQr";

interface ContactQrInput {
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const type = params.type;
  if (!isContactQrType(type)) return errorJson("无效的 type", 400);

  let input: ContactQrInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }
  if (!input.imageKey) return errorJson("imageKey 不能为空", 400);

  await env.DB.prepare(
    `UPDATE contact_qr_codes SET image_key = ?, image_width = ?, image_height = ?, updated_at = datetime('now')
     WHERE type = ?`,
  )
    .bind(input.imageKey, input.imageWidth ?? null, input.imageHeight ?? null, type)
    .run();

  const row = await env.DB.prepare("SELECT * FROM contact_qr_codes WHERE type = ?")
    .bind(type)
    .first<ContactQrRow>();

  await triggerRevalidate(env, { kind: "contact" });
  return json(toContactQrApiShape(row!, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const type = params.type;
  if (!isContactQrType(type)) return errorJson("无效的 type", 400);

  await env.DB.prepare(
    `UPDATE contact_qr_codes SET image_key = NULL, image_width = NULL, image_height = NULL, updated_at = datetime('now')
     WHERE type = ?`,
  )
    .bind(type)
    .run();

  const row = await env.DB.prepare("SELECT * FROM contact_qr_codes WHERE type = ?")
    .bind(type)
    .first<ContactQrRow>();

  await triggerRevalidate(env, { kind: "contact" });
  return json(toContactQrApiShape(row!, new URL(request.url).origin));
};
