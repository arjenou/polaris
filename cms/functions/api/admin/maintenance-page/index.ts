/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import { toMaintenancePageApiShape, type MaintenancePageRow } from "../../../_lib/maintenancePage";

interface MaintenancePageInput {
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  objectPositionX?: number;
  objectPositionY?: number;
}

function clampPosition(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
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
      objectPositionX: 50,
      objectPositionY: 0,
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

  const row = await getRow(env);
  if (!row) return errorJson("记录不存在", 404);

  if (input.imageKey) {
    await env.DB.prepare(
      `UPDATE maintenance_page
       SET image_key = ?, image_width = ?, image_height = ?,
           object_position_x = ?, object_position_y = ?, updated_at = datetime('now')
       WHERE id = 1`,
    )
      .bind(
        input.imageKey,
        input.imageWidth ?? null,
        input.imageHeight ?? null,
        clampPosition(input.objectPositionX, row.object_position_x ?? 50),
        clampPosition(input.objectPositionY, row.object_position_y ?? 0),
      )
      .run();
  } else if (input.objectPositionX !== undefined || input.objectPositionY !== undefined) {
    await env.DB.prepare(
      `UPDATE maintenance_page
       SET object_position_x = ?, object_position_y = ?, updated_at = datetime('now')
       WHERE id = 1`,
    )
      .bind(
        clampPosition(input.objectPositionX, row.object_position_x ?? 50),
        clampPosition(input.objectPositionY, row.object_position_y ?? 0),
      )
      .run();
  } else {
    return errorJson("请提供 imageKey 或 objectPosition", 400);
  }

  const updated = await getRow(env);
  await triggerRevalidate(env, { kind: "maintenance-page" });
  return json(toMaintenancePageApiShape(updated!, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  await env.DB.prepare(
    `UPDATE maintenance_page
     SET image_key = NULL, image_width = NULL, image_height = NULL,
         object_position_x = 50, object_position_y = 0, updated_at = datetime('now')
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
      objectPositionX: 50,
      objectPositionY: 0,
      updatedAt: null,
    });
  }
  return json(toMaintenancePageApiShape(row, new URL(request.url).origin));
};
