/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";

interface ReorderInput {
  locale?: string;
  orderedIds?: number[];
}

/** Persists the new drag-and-drop display order for one locale's events.
 * Expects the full ordered list of ids for that locale. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: ReorderInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  if (input.locale !== "ja" && input.locale !== "zh") return errorJson("locale 必须是 ja 或 zh", 400);
  if (!Array.isArray(input.orderedIds) || input.orderedIds.some((id) => !Number.isInteger(id))) {
    return errorJson("orderedIds 必须是 id 数组", 400);
  }

  const statements = input.orderedIds.map((id, index) =>
    env.DB.prepare("UPDATE events SET sort_order = ? WHERE id = ? AND locale = ?").bind(index, id, input.locale),
  );
  if (statements.length > 0) await env.DB.batch(statements);

  await triggerRevalidate(env, { kind: "events", locale: input.locale });
  return json({ ok: true });
};
