/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";

interface NewsPostRow {
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
  created_at: string;
  updated_at: string;
}

function toApiShape(row: NewsPostRow, origin: string) {
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface NewsPostInput {
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
}

function validate(input: NewsPostInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) return "slug 必须为小写字母/数字/连字符";
  if (!input.title) return "标题不能为空";
  if (!input.date || !/^\d{4}\.\d{2}\.\d{2}$/.test(input.date)) return "日期格式应为 YYYY.MM.DD";
  if (!input.tag) return "标签不能为空";
  if (!input.excerpt) return "摘要不能为空";
  return null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const row = await env.DB.prepare("SELECT * FROM news_posts WHERE id = ?").bind(id).first<NewsPostRow>();
  if (!row) return errorJson("未找到该新闻", 404);

  return json(toApiShape(row, new URL(request.url).origin));
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  let input: NewsPostInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const validationError = validate(input);
  if (validationError) return errorJson(validationError, 400);

  try {
    await env.DB.prepare(
      `UPDATE news_posts SET locale = ?, slug = ?, title = ?, date = ?, tag = ?, excerpt = ?, content = ?,
         image_key = ?, image_width = ?, image_height = ?, published = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(
        input.locale,
        input.slug,
        input.title,
        input.date,
        input.tag,
        input.excerpt,
        input.content ?? "",
        input.imageKey ?? null,
        input.imageWidth ?? null,
        input.imageHeight ?? null,
        input.published === false ? 0 : 1,
        id,
      )
      .run();

    const row = await env.DB.prepare("SELECT * FROM news_posts WHERE id = ?").bind(id).first<NewsPostRow>();
    if (!row) return errorJson("未找到该新闻", 404);
    return json(toApiShape(row, new URL(request.url).origin));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("UNIQUE")) return errorJson("该语言下 slug 已存在", 409);
    return errorJson("更新失败: " + message, 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  await env.DB.prepare("DELETE FROM news_posts WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
