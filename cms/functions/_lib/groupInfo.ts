/// <reference types="@cloudflare/workers-types" />

export type GroupInfoLocale = "ja" | "zh";

export function isGroupInfoLocale(value: unknown): value is GroupInfoLocale {
  return value === "ja" || value === "zh";
}

export interface GroupInfoContentRow {
  locale: string;
  hero_title: string;
  intro_title: string;
  intro: string;
  timeline_title: string;
  companies_title: string;
  domestic_title: string;
  overseas_title: string;
  updated_at: string;
}

export interface GroupInfoContentInput {
  heroTitle?: string;
  introTitle?: string;
  intro?: string[];
  timelineTitle?: string;
  companiesTitle?: string;
  domesticTitle?: string;
  overseasTitle?: string;
}

function parseIntro(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
}

export function toGroupInfoContentApiShape(row: GroupInfoContentRow) {
  return {
    locale: row.locale,
    heroTitle: row.hero_title,
    introTitle: row.intro_title,
    intro: parseIntro(row.intro),
    timelineTitle: row.timeline_title,
    companiesTitle: row.companies_title,
    domesticTitle: row.domestic_title,
    overseasTitle: row.overseas_title,
    updatedAt: row.updated_at,
  };
}

export function validateGroupInfoContent(input: GroupInfoContentInput): string | null {
  if (!input.heroTitle || !input.heroTitle.trim()) return "页面大标题不能为空";
  if (!input.introTitle || !input.introTitle.trim()) return "グループ情報标题不能为空";
  if (!Array.isArray(input.intro) || input.intro.length === 0) return "简介段落不能为空";
  if (!input.timelineTitle || !input.timelineTitle.trim()) return "グループ沿革标题不能为空";
  return null;
}

export type GroupInfoAssetType = "hero" | "badge";

export function isGroupInfoAssetType(value: unknown): value is GroupInfoAssetType {
  return value === "hero" || value === "badge";
}

export interface GroupInfoAssetRow {
  id: number;
  type: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  updated_at: string;
}

export function toGroupInfoAssetApiShape(row: GroupInfoAssetRow, origin: string) {
  return {
    type: row.type,
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    updatedAt: row.updated_at,
  };
}

export interface GroupTimelineRow {
  id: number;
  locale: string;
  date: string;
  event: string;
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GroupTimelineInput {
  locale?: string;
  date?: string;
  event?: string;
  published?: boolean;
}

export function toGroupTimelineApiShape(row: GroupTimelineRow) {
  return {
    id: row.id,
    locale: row.locale,
    date: row.date,
    event: row.event,
    published: row.published !== 0,
    sortOrder: row.sort_order,
  };
}

export function validateGroupTimeline(input: GroupTimelineInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!input.date || !input.date.trim()) return "日期不能为空";
  if (!input.event || !input.event.trim()) return "事件内容不能为空";
  return null;
}
