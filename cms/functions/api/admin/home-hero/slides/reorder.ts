/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";

interface ReorderInput {
  orderedIds?: number[];
}

/** Persists the new drag-and-drop display order of the homepage hero slides. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: ReorderInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  if (!Array.isArray(input.orderedIds) || input.orderedIds.some((id) => !Number.isInteger(id))) {
    return errorJson("orderedIds 必须是 id 数组", 400);
  }

  const statements = input.orderedIds.map((id, index) =>
    env.DB.prepare("UPDATE home_hero_slides SET sort_order = ? WHERE id = ?").bind(index, id),
  );
  if (statements.length > 0) await env.DB.batch(statements);

  await triggerRevalidate(env, { kind: "home-hero" });
  return json({ ok: true });
};
