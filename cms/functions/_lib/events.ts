/// <reference types="@cloudflare/workers-types" />
import { fromSqliteDatetime, toSqliteDatetime } from "./newsValidation";

export interface EventRow {
  id: number;
  locale: string;
  slug: string;
  title: string;
  date: string;
  date_range: string;
  badge: string;
  badge_color: string;
  summary: string;
  cover_image_key: string | null;
  cover_image_width: number | null;
  cover_image_height: number | null;
  hero_image_key: string | null;
  hero_image_width: number | null;
  hero_image_height: number | null;
  video_url: string;
  video_poster_key: string | null;
  video_poster_width: number | null;
  video_poster_height: number | null;
  overview_event_name: string;
  overview_datetime: string;
  overview_venue: string;
  overview_participants: string;
  overview_content: string;
  overview_organizer: string;
  gallery: string;
  published: number;
  scheduled_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventOverviewInput {
  eventName?: string;
  datetime?: string;
  venue?: string;
  participants?: string;
  content?: string;
  organizer?: string;
}

export interface EventInput {
  locale?: string;
  slug?: string;
  title?: string;
  date?: string;
  dateRange?: string;
  badge?: string;
  badgeColor?: string;
  summary?: string;
  coverImageKey?: string | null;
  coverImageWidth?: number | null;
  coverImageHeight?: number | null;
  heroImageKey?: string | null;
  heroImageWidth?: number | null;
  heroImageHeight?: number | null;
  videoUrl?: string;
  videoPosterKey?: string | null;
  videoPosterWidth?: number | null;
  videoPosterHeight?: number | null;
  overview?: EventOverviewInput;
  gallery?: string[];
  published?: boolean;
  scheduledAt?: string | null;
}

function parseGallery(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function toGalleryJson(values: string[] | undefined): string {
  return JSON.stringify((values ?? []).filter(Boolean));
}

function toMediaUrl(origin: string, key: string | null): string | null {
  return key ? `${origin}/media/${key}` : null;
}

export function toEventApiShape(row: EventRow, origin: string) {
  return {
    id: row.id,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    date: row.date,
    dateRange: row.date_range,
    badge: row.badge,
    badgeColor: row.badge_color,
    summary: row.summary,
    coverImageKey: row.cover_image_key,
    coverImageUrl: toMediaUrl(origin, row.cover_image_key),
    coverImageWidth: row.cover_image_width,
    coverImageHeight: row.cover_image_height,
    heroImageKey: row.hero_image_key,
    heroImageUrl: toMediaUrl(origin, row.hero_image_key),
    heroImageWidth: row.hero_image_width,
    heroImageHeight: row.hero_image_height,
    videoUrl: row.video_url,
    videoPosterKey: row.video_poster_key,
    videoPosterUrl: toMediaUrl(origin, row.video_poster_key),
    videoPosterWidth: row.video_poster_width,
    videoPosterHeight: row.video_poster_height,
    overview: {
      eventName: row.overview_event_name,
      datetime: row.overview_datetime,
      venue: row.overview_venue,
      participants: row.overview_participants,
      content: row.overview_content,
      organizer: row.overview_organizer,
    },
    gallery: parseGallery(row.gallery).map((key) => ({ key, url: toMediaUrl(origin, key) })),
    published: Boolean(row.published),
    scheduledAt: fromSqliteDatetime(row.scheduled_at),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SLUG_RE = /^[a-z0-9-]+$/;
const DATE_RE = /^\d{4}\.\d{2}\.\d{2}$/;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export function validateEvent(input: EventInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!input.slug || !SLUG_RE.test(input.slug)) return "slug 必须为小写字母/数字/连字符";
  if (!input.title) return "标题不能为空";
  if (!input.date || !DATE_RE.test(input.date)) return "日期格式应为 YYYY.MM.DD";
  if (!input.badge) return "标签不能为空";
  if (!input.coverImageKey) return "请上传封面图";
  if (input.badgeColor && !HEX_COLOR_RE.test(input.badgeColor)) return "标签颜色必须是 #RRGGBB 格式";
  if (input.gallery && !Array.isArray(input.gallery)) return "gallery 必须是数组";
  if (input.videoUrl && !/^https?:\/\//.test(input.videoUrl)) return "视频链接必须以 http(s):// 开头";
  if (input.scheduledAt && Number.isNaN(new Date(input.scheduledAt).getTime())) {
    return "预约发布时间格式不正确";
  }
  return null;
}

/** An event is either published now, or a draft optionally scheduled to
 * auto-publish later — never both at once (same rule as news/recommended). */
export function resolveEventScheduledAt(input: EventInput): string | null {
  if (input.published === false && input.scheduledAt) return toSqliteDatetime(input.scheduledAt);
  return null;
}
