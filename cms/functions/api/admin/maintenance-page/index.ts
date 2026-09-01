/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import { toMaintenancePageApiShape, type MaintenancePageRow } from "../../../_lib/maintenancePage";

interface MaintenancePageInput {
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
}

async function getRow(env: Env) {
  return env.DB.prepare("SELECT * FROM maintenance_page WHERE id = 1").first<MaintenancePageRow>();
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const row = await getRow(env);
  if (!row) {
    return json({
      imageKey: null,
      imageUrl: null,
      imageWidth: null,
      imageHeight: null,
      updatedAt: null,
    });
  }
  return json(toMaintenancePageApiShape(row, new URL(request.url).origin));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  let input: MaintenancePageInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }
  if (!input.imageKey) return errorJson("imageKey 不能为空", 400);

  await env.DB.prepare(
    `UPDATE maintenance_page SET image_key = ?, image_width = ?, image_height = ?, updated_at = datetime('now')
     WHERE id = 1`,
  )
    .bind(input.imageKey, input.imageWidth ?? null, input.imageHeight ?? null)
    .run();

  const row = await getRow(env);
  await triggerRevalidate(env, { kind: "maintenance-page" });
  return json(toMaintenancePageApiShape(row!, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  await env.DB.prepare(
    `UPDATE maintenance_page SET image_key = NULL, image_width = NULL, image_height = NULL, updated_at = datetime('now')
     WHERE id = 1`,
  ).run();

  const row = await getRow(env);
  await triggerRevalidate(env, { kind: "maintenance-page" });
  if (!row) {
    return json({
      imageKey: null,
      imageUrl: null,
      imageWidth: null,
      imageHeight: null,
      updatedAt: null,
    });
  }
  return json(toMaintenancePageApiShape(row, new URL(request.url).origin));
};
