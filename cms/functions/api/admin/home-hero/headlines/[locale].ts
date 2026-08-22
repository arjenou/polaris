/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { errorJson, json } from "../../../../_lib/response";
import { triggerRevalidate } from "../../../../_lib/revalidate";
import { isHomeHeroLocale, toHomeHeroHeadlineApiShape, type HomeHeroHeadlineRow } from "../../../../_lib/homeHero";

interface HomeHeroHeadlineInput {
  headline?: string;
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const locale = params.locale;
  if (!isHomeHeroLocale(locale)) return errorJson("无效的 locale", 400);

  let input: HomeHeroHeadlineInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }
  if (!input.headline || !input.headline.trim()) return errorJson("标题文字不能为空", 400);

  await env.DB.prepare(`UPDATE home_hero_headlines SET headline = ?, updated_at = datetime('now') WHERE locale = ?`)
    .bind(input.headline, locale)
    .run();

  const row = await env.DB.prepare("SELECT * FROM home_hero_headlines WHERE locale = ?")
    .bind(locale)
    .first<HomeHeroHeadlineRow>();

  await triggerRevalidate(env, { kind: "home-hero", locale });
  return json(toHomeHeroHeadlineApiShape(row!));
};
