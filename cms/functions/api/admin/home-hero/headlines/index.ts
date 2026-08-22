/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../../_lib/env";
import { json } from "../../../../_lib/response";
import { toHomeHeroHeadlineApiShape, type HomeHeroHeadlineRow } from "../../../../_lib/homeHero";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM home_hero_headlines ORDER BY locale ASC").all<HomeHeroHeadlineRow>();

  return json((results ?? []).map(toHomeHeroHeadlineApiShape));
};
