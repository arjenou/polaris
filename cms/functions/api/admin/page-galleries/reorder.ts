/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import { isPageGalleryKey } from "../../../_lib/pageGalleries";

interface ReorderInput {
  pageKey?: string;
  orderedIds?: number[];
}

/** Persists the new drag-and-drop display order for one page's gallery
 * images. Expects the full ordered list of ids for that page. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: ReorderInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  if (!isPageGalleryKey(input.pageKey)) return errorJson("无效的 pageKey", 400);
  if (!Array.isArray(input.orderedIds) || input.orderedIds.some((id) => !Number.isInteger(id))) {
    return errorJson("orderedIds 必须是 id 数组", 400);
  }

  const statements = input.orderedIds.map((id, index) =>
    env.DB.prepare("UPDATE page_gallery_images SET sort_order = ? WHERE id = ? AND page_key = ?").bind(
      index,
      id,
      input.pageKey,
    ),
  );
  if (statements.length > 0) await env.DB.batch(statements);

  await triggerRevalidate(env, { kind: "gallery", pageKey: input.pageKey });
  return json({ ok: true });
};
