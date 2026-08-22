/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  await env.DB.prepare("DELETE FROM home_hero_slides WHERE id = ?").bind(id).run();

  await triggerRevalidate(env, { kind: "home-hero" });
  return json({ ok: true });
};
