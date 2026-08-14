/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import { isPageGalleryKey } from "../../../../_lib/pageGalleries";

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const pageKey = params.pageKey;
  if (!isPageGalleryKey(pageKey)) return errorJson("无效的 pageKey", 400);

  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  await env.DB.prepare("DELETE FROM page_gallery_images WHERE id = ? AND page_key = ?").bind(id, pageKey).run();

  await triggerRevalidate(env, { kind: "gallery", pageKey });
  return json({ ok: true });
};
