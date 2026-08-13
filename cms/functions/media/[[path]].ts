/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../_lib/env";

/** Public passthrough that streams objects from the R2 bucket, e.g. GET /media/news/123-abc-photo.jpg */
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const segments = params.path;
  const key = Array.isArray(segments) ? segments.join("/") : String(segments ?? "");
  if (!key) return new Response("Not found", { status: 404 });

  const object = await env.MEDIA.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(object.body, { headers });
};
