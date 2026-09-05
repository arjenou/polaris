/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import {
  isGroupInfoLocale,
  toGroupInfoContentApiShape,
  toGroupInfoAssetApiShape,
  toGroupTimelineApiShape,
  type GroupInfoContentRow,
  type GroupInfoAssetRow,
  type GroupTimelineRow,
} from "../../_lib/groupInfo";

/** Public read-only endpoint consumed by the グループ情報 (enterprise-intelligence)
 * page's hero / intro / グループ沿革 sections.
 * GET ?locale=ja -> { heroTitle, heroImage, badge, introTitle, intro,
 * timelineTitle, timeline, companiesTitle, domesticTitle, overseasTitle }. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale");

  if (!isGroupInfoLocale(locale)) {
    return errorJson("locale 参数不正确", 400, PUBLIC_CORS_HEADERS);
  }

  const [contentRow, assetsResult, timelineResult] = await Promise.all([
    env.DB.prepare("SELECT * FROM group_info_content WHERE locale = ?").bind(locale).first<GroupInfoContentRow>(),
    env.DB.prepare("SELECT * FROM group_info_assets").all<GroupInfoAssetRow>(),
    env.DB.prepare("SELECT * FROM group_timeline WHERE locale = ? AND published = 1 ORDER BY sort_order ASC")
      .bind(locale)
      .all<GroupTimelineRow>(),
  ]);

  const assets = (assetsResult.results ?? []).map((row) => toGroupInfoAssetApiShape(row, url.origin));
  const hero = assets.find((a) => a.type === "hero");
  const badge = assets.find((a) => a.type === "badge");
  const content = contentRow ? toGroupInfoContentApiShape(contentRow) : null;
  const timeline = (timelineResult.results ?? []).map(toGroupTimelineApiShape);

  return json(
    {
      heroTitle: content?.heroTitle ?? "",
      heroImage: hero?.imageUrl ?? null,
      heroObjectPosition:
        hero?.imageUrl != null
          ? { x: hero.objectPositionX ?? 50, y: hero.objectPositionY ?? 0 }
          : null,
      badge: badge?.imageUrl ?? null,
      introTitle: content?.introTitle ?? "",
      intro: content?.intro ?? [],
      timelineTitle: content?.timelineTitle ?? "",
      timeline: timeline.map((item) => ({ date: item.date, event: item.event })),
      companiesTitle: content?.companiesTitle ?? "",
      domesticTitle: content?.domesticTitle ?? "",
      overseasTitle: content?.overseasTitle ?? "",
    },
    {},
    PUBLIC_CORS_HEADERS,
  );
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
