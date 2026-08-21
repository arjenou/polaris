/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../_lib/env";

/** Public passthrough that streams objects from the R2 bucket, e.g. GET /media/news/123-abc-photo.jpg */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const segments = params.path;
  const key = Array.isArray(segments) ? segments.join("/") : String(segments ?? "");
  if (!key) return new Response("Not found", { status: 404 });

  const rangeRequested = request.headers.has("Range");
  const object = await env.MEDIA.get(key, rangeRequested ? { range: request.headers } : undefined);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Accept-Ranges", "bytes");

  const range = object.range;
  if (
    rangeRequested &&
    range &&
    "offset" in range &&
    typeof range.offset === "number" &&
    "length" in range &&
    typeof range.length === "number"
  ) {
    headers.set("Content-Range", `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`);
    headers.set("Content-Length", String(range.length));
    return new Response(object.body, { status: 206, headers });
  }

  return new Response(object.body, { headers });
};
