/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { triggerRevalidate } from "../../../_lib/revalidate";
import { applyTeamPresident } from "../../../_lib/team";

interface PresidentInput {
  locale?: string;
  memberId?: number | null;
}

/** Sets the one president for a locale's team carousel (or clears if memberId is null). */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: PresidentInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  if (input.locale !== "ja" && input.locale !== "zh") return errorJson("locale 必须是 ja 或 zh", 400);
  if (input.memberId !== null && input.memberId !== undefined && !Number.isInteger(input.memberId)) {
    return errorJson("memberId 必须是整数或 null", 400);
  }

  const memberId = input.memberId ?? null;
  if (memberId !== null) {
    const row = await env.DB.prepare("SELECT id FROM team_members WHERE id = ? AND locale = ?")
      .bind(memberId, input.locale)
      .first<{ id: number }>();
    if (!row) return errorJson("未找到该社员", 404);
  }

  await applyTeamPresident(env, input.locale!, memberId);
  await triggerRevalidate(env, { kind: "team", locale: input.locale });
  return json({ ok: true });
};
