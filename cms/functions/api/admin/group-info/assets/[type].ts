/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import { isGroupInfoAssetType, toGroupInfoAssetApiShape, type GroupInfoAssetRow } from "../../../../_lib/groupInfo";

interface GroupInfoAssetInput {
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

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const type = params.type;
  if (!isGroupInfoAssetType(type)) return errorJson("无效的 type", 400);

  let input: GroupInfoAssetInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const row = await env.DB.prepare("SELECT * FROM group_info_assets WHERE type = ?").bind(type).first<GroupInfoAssetRow>();
  if (!row) return errorJson("记录不存在", 404);

  if (input.imageKey) {
    await env.DB.prepare(
      `UPDATE group_info_assets
       SET image_key = ?, image_width = ?, image_height = ?,
           object_position_x = ?, object_position_y = ?, updated_at = datetime('now')
       WHERE type = ?`,
    )
      .bind(
        input.imageKey,
        input.imageWidth ?? null,
        input.imageHeight ?? null,
        clampPosition(input.objectPositionX, row.object_position_x ?? 50),
        clampPosition(input.objectPositionY, row.object_position_y ?? 0),
        type,
      )
      .run();
  } else if (input.objectPositionX !== undefined || input.objectPositionY !== undefined) {
    await env.DB.prepare(
      `UPDATE group_info_assets
       SET object_position_x = ?, object_position_y = ?, updated_at = datetime('now')
       WHERE type = ?`,
    )
      .bind(
        clampPosition(input.objectPositionX, row.object_position_x ?? 50),
        clampPosition(input.objectPositionY, row.object_position_y ?? 0),
        type,
      )
      .run();
  } else {
    return errorJson("请提供 imageKey 或 objectPosition", 400);
  }

  const updated = await env.DB.prepare("SELECT * FROM group_info_assets WHERE type = ?").bind(type).first<GroupInfoAssetRow>();

  await triggerRevalidate(env, { kind: "group-companies" });
  return json(toGroupInfoAssetApiShape(updated!, new URL(request.url).origin));
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const type = params.type;
  if (!isGroupInfoAssetType(type)) return errorJson("无效的 type", 400);

  await env.DB.prepare(
    `UPDATE group_info_assets
     SET image_key = NULL, image_width = NULL, image_height = NULL,
         object_position_x = 50, object_position_y = 0, updated_at = datetime('now')
     WHERE type = ?`,
  )
    .bind(type)
    .run();

  const row = await env.DB.prepare("SELECT * FROM group_info_assets WHERE type = ?").bind(type).first<GroupInfoAssetRow>();

  await triggerRevalidate(env, { kind: "group-companies" });
  return json(toGroupInfoAssetApiShape(row!, new URL(request.url).origin));
};
