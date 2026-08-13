/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { readImageDimensions } from "../../../_lib/imageSize";
import { errorJson, json } from "../../../_lib/response";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") ?? "news";
  if (!/^[a-z0-9-]+$/.test(folder)) return errorJson("非法的 folder 参数", 400);

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return errorJson("请上传文件（字段名 file）", 400);

  if (!ALLOWED_TYPES.has(file.type)) return errorJson("仅支持 jpg/png/webp/gif 图片", 400);
  if (file.size > MAX_BYTES) return errorJson("文件不能超过 10MB", 400);

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const dimensions = readImageDimensions(bytes);

  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${sanitizeFilename(file.name)}`;
  await env.MEDIA.put(key, buffer, { httpMetadata: { contentType: file.type } });

  return json({
    key,
    url: `${url.origin}/media/${key}`,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  });
};
