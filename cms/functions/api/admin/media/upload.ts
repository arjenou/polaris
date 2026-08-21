/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { readImageDimensions } from "../../../_lib/imageSize";
import { errorJson, json } from "../../../_lib/response";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

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

  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) return errorJson("仅支持 jpg/png/webp/gif 图片或 mp4/webm/ogg 视频", 400);
  if (isImage && file.size > MAX_IMAGE_BYTES) return errorJson("图片不能超过 10MB", 400);
  if (isVideo && file.size > MAX_VIDEO_BYTES) return errorJson("视频不能超过 100MB", 400);

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const dimensions = isImage ? readImageDimensions(bytes) : null;

  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${sanitizeFilename(file.name)}`;
  await env.MEDIA.put(key, buffer, { httpMetadata: { contentType: file.type } });

  return json({
    key,
    url: `${url.origin}/media/${key}`,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  });
};
