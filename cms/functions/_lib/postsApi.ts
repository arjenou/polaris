/// <reference types="@cloudflare/workers-types" />
import type { Env } from "./env";
import { errorJson, json, PUBLIC_CORS_HEADERS } from "./response";
import { sanitizeNewsContent } from "./sanitizeHtml";
import { EXCERPT_MAX_LENGTH, fromSqliteDatetime, toSqliteDatetime } from "./newsValidation";
import { triggerRevalidate, type RevalidateKind } from "./revalidate";

/**
 * "news_posts" and "recommended_posts" are two independent content types
 * with the exact same shape (own slug/tag/excerpt/image/rich content, with
 * an optional scheduled auto-publish time). These factories build the CRUD
 * and public read handlers once and parameterize only the table name, so
 * fixes/features (e.g. scheduled publishing) apply to both automatically.
 */

export interface PostRow {
  id: number;
  locale: string;
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  published: number;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostInput {
  locale?: string;
  slug?: string;
  title?: string;
  date?: string;
  tag?: string;
  excerpt?: string;
  content?: string;
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  published?: boolean;
  scheduledAt?: string | null;
}

function toApiShape(row: PostRow, origin: string) {
  return {
    id: row.id,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    date: row.date,
    tag: row.tag,
    excerpt: row.excerpt,
    content: row.content,
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    published: Boolean(row.published),
    scheduledAt: fromSqliteDatetime(row.scheduled_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validate(input: PostInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) return "slug 必须为小写字母/数字/连字符";
  if (!input.title) return "标题不能为空";
  if (!input.date || !/^\d{4}\.\d{2}\.\d{2}$/.test(input.date)) return "日期格式应为 YYYY.MM.DD";
  if (!input.tag) return "标签不能为空";
  if (!input.excerpt) return "摘要不能为空";
  if (input.excerpt.length > EXCERPT_MAX_LENGTH) return `摘要不能超过 ${EXCERPT_MAX_LENGTH} 字`;
  if (input.scheduledAt && Number.isNaN(new Date(input.scheduledAt).getTime())) {
    return "预约发布时间格式不正确";
  }
  return null;
}

/** A post is either published now, or a draft optionally scheduled to
 * auto-publish later — never both at once. */
function resolveScheduledAt(input: PostInput): string | null {
  if (input.published === false && input.scheduledAt) return toSqliteDatetime(input.scheduledAt);
  return null;
}

export function createPostsListHandlers(table: string, kind: RevalidateKind) {
  const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale");

    const stmt = locale
      ? env.DB.prepare(`SELECT * FROM ${table} WHERE locale = ? ORDER BY date DESC`).bind(locale)
      : env.DB.prepare(`SELECT * FROM ${table} ORDER BY date DESC`);

    const { results } = await stmt.all<PostRow>();
    return json((results ?? []).map((row) => toApiShape(row, url.origin)));
  };

  const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    let input: PostInput;
    try {
      input = await request.json();
    } catch {
      return errorJson("请求格式错误", 400);
    }

    const validationError = validate(input);
    if (validationError) return errorJson(validationError, 400);

    try {
      const result = await env.DB.prepare(
        `INSERT INTO ${table} (locale, slug, title, date, tag, excerpt, content, image_key, image_width, image_height, published, scheduled_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
        .bind(
          input.locale,
          input.slug,
          input.title,
          input.date,
          input.tag,
          input.excerpt,
          sanitizeNewsContent(input.content ?? ""),
          input.imageKey ?? null,
          input.imageWidth ?? null,
          input.imageHeight ?? null,
          input.published === false ? 0 : 1,
          resolveScheduledAt(input),
        )
        .run();

      const id = result.meta.last_row_id;
      const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<PostRow>();
      await triggerRevalidate(env, { kind, locale: input.locale!, slug: input.slug! });
      return json(toApiShape(row!, new URL(request.url).origin), { status: 201 });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("UNIQUE")) return errorJson("该语言下 slug 已存在", 409);
      return errorJson(`创建失败: ${message}`, 500);
    }
  };

  return { onRequestGet, onRequestPost };
}

export function createPostAdminHandlers(table: string, kind: RevalidateKind, notFoundLabel: string) {
  const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

    const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<PostRow>();
    if (!row) return errorJson(`未找到该${notFoundLabel}`, 404);

    return json(toApiShape(row, new URL(request.url).origin));
  };

  const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

    let input: PostInput;
    try {
      input = await request.json();
    } catch {
      return errorJson("请求格式错误", 400);
    }

    const validationError = validate(input);
    if (validationError) return errorJson(validationError, 400);

    const previous = await env.DB.prepare(`SELECT locale, slug FROM ${table} WHERE id = ?`)
      .bind(id)
      .first<{ locale: string; slug: string }>();

    try {
      await env.DB.prepare(
        `UPDATE ${table} SET locale = ?, slug = ?, title = ?, date = ?, tag = ?, excerpt = ?, content = ?,
           image_key = ?, image_width = ?, image_height = ?, published = ?, scheduled_at = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
        .bind(
          input.locale,
          input.slug,
          input.title,
          input.date,
          input.tag,
          input.excerpt,
          sanitizeNewsContent(input.content ?? ""),
          input.imageKey ?? null,
          input.imageWidth ?? null,
          input.imageHeight ?? null,
          input.published === false ? 0 : 1,
          resolveScheduledAt(input),
          id,
        )
        .run();

      const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<PostRow>();
      if (!row) return errorJson(`未找到该${notFoundLabel}`, 404);

      await triggerRevalidate(env, { kind, locale: input.locale!, slug: input.slug! });
      if (previous && (previous.locale !== input.locale || previous.slug !== input.slug)) {
        await triggerRevalidate(env, { kind, locale: previous.locale, slug: previous.slug });
      }

      return json(toApiShape(row, new URL(request.url).origin));
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.includes("UNIQUE")) return errorJson("该语言下 slug 已存在", 409);
      return errorJson(`更新失败: ${message}`, 500);
    }
  };

  const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

    const row = await env.DB.prepare(`SELECT locale, slug FROM ${table} WHERE id = ?`)
      .bind(id)
      .first<{ locale: string; slug: string }>();

    await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();

    if (row) await triggerRevalidate(env, { kind, locale: row.locale, slug: row.slug });

    return json({ ok: true });
  };

  return { onRequestGet, onRequestPut, onRequestDelete };
}

interface PublicPostRow {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
}

const EFFECTIVELY_PUBLISHED = "(published = 1 OR (scheduled_at IS NOT NULL AND scheduled_at <= datetime('now')))";

function toImageUrl(origin: string, imageKey: string | null): string | null {
  return imageKey ? `${origin}/media/${imageKey}` : null;
}

/** Public read-only endpoint consumed by the Vercel-hosted front-end.
 * GET ?locale=ja            -> published post summaries, newest first
 * GET ?locale=ja&slug=xxx   -> single published post with full content
 */
export function createPublicPostsHandlers(table: string) {
  const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale");
    const slug = url.searchParams.get("slug");

    if (locale !== "ja" && locale !== "zh") {
      return errorJson("locale 参数必须是 ja 或 zh", 400, PUBLIC_CORS_HEADERS);
    }

    if (slug) {
      const row = await env.DB.prepare(
        `SELECT * FROM ${table} WHERE locale = ? AND slug = ? AND ${EFFECTIVELY_PUBLISHED}`,
      )
        .bind(locale, slug)
        .first<PublicPostRow>();

      if (!row) return errorJson("未找到该内容", 404, PUBLIC_CORS_HEADERS);

      return json(
        {
          slug: row.slug,
          title: row.title,
          date: row.date,
          tag: row.tag,
          excerpt: row.excerpt,
          content: row.content,
          image: toImageUrl(url.origin, row.image_key),
          imageWidth: row.image_width ?? 1200,
          imageHeight: row.image_height ?? 800,
        },
        {},
        PUBLIC_CORS_HEADERS,
      );
    }

    const { results } = await env.DB.prepare(
      `SELECT * FROM ${table} WHERE locale = ? AND ${EFFECTIVELY_PUBLISHED} ORDER BY date DESC`,
    )
      .bind(locale)
      .all<PublicPostRow>();

    return json(
      (results ?? []).map((row) => ({
        slug: row.slug,
        title: row.title,
        date: row.date,
        tag: row.tag,
        excerpt: row.excerpt,
        image: toImageUrl(url.origin, row.image_key),
      })),
      {},
      PUBLIC_CORS_HEADERS,
    );
  };

  const onRequestOptions: PagesFunction<Env> = async () => {
    return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
  };

  return { onRequestGet, onRequestOptions };
}
