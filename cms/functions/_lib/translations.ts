/// <reference types="@cloudflare/workers-types" />
import type { Env } from "./env";
import { triggerRevalidate, type RevalidateKind } from "./revalidate";

/**
 * Links a ja row with its zh counterpart (news_posts / recommended_posts /
 * events). Two rows are counterparts when they share the same non-null
 * `translation_key` and have different locales. `table` is always one of
 * those three fixed table names (never user input).
 */

interface LinkRow {
  id: number;
  locale: string;
  slug: string;
  translation_key: string | null;
}

export interface CounterpartRef {
  id: number;
  locale: string;
  slug: string;
}

/** The row linked to `id` (same key, other locale), or null when unlinked. */
export async function findCounterpart(env: Env, table: string, id: number): Promise<CounterpartRef | null> {
  const row = await env.DB.prepare(
    `SELECT b.id AS id, b.locale AS locale, b.slug AS slug
       FROM ${table} a
       JOIN ${table} b ON b.translation_key = a.translation_key AND b.locale != a.locale
      WHERE a.id = ? AND a.translation_key IS NOT NULL
      LIMIT 1`,
  )
    .bind(id)
    .first<CounterpartRef>();
  return row ?? null;
}

/** Pre-write check so a save never half-succeeds on a bad counterpart. */
export async function validateCounterpart(
  env: Env,
  table: string,
  locale: string | undefined,
  counterpartId: number | null | undefined,
): Promise<string | null> {
  if (counterpartId === undefined || counterpartId === null) return null;
  if (!Number.isInteger(counterpartId)) return "对应内容无效";
  const target = await env.DB.prepare(`SELECT locale FROM ${table} WHERE id = ?`)
    .bind(counterpartId)
    .first<{ locale: string }>();
  if (!target) return "未找到所选的对应内容";
  if (target.locale === locale) return "对应内容必须是另一种语言";
  return null;
}

/**
 * Makes `counterpartId` (or nothing, for null) the counterpart of row `id`.
 * Any previous link of either row is dropped first so a row never ends up
 * with two counterparts. Returns an error message, or null on success.
 */
export async function setCounterpart(
  env: Env,
  table: string,
  kind: RevalidateKind,
  id: number,
  counterpartId: number | null,
): Promise<string | null> {
  const self = await env.DB.prepare(`SELECT id, locale, slug, translation_key FROM ${table} WHERE id = ?`)
    .bind(id)
    .first<LinkRow>();
  if (!self) return "未找到该内容";

  const current = await findCounterpart(env, table, id);
  if ((current?.id ?? null) === counterpartId) return null;

  let target: LinkRow | null = null;
  if (counterpartId !== null) {
    if (!Number.isInteger(counterpartId) || counterpartId === id) return "对应内容无效";
    target = await env.DB.prepare(`SELECT id, locale, slug, translation_key FROM ${table} WHERE id = ?`)
      .bind(counterpartId)
      .first<LinkRow>();
    if (!target) return "未找到所选的对应内容";
    if (target.locale === self.locale) return "对应内容必须是另一种语言";
  }

  const targetOldPartner = target ? await findCounterpart(env, table, target.id) : null;

  // Drop every existing link involved (self, its old partner, the target and
  // the target's old partner), then link self <-> target under a fresh key.
  const toUnlink = [id, current?.id, target?.id, targetOldPartner?.id].filter(
    (v): v is number => typeof v === "number",
  );
  const statements = [
    env.DB.prepare(
      `UPDATE ${table} SET translation_key = NULL WHERE id IN (${toUnlink.map(() => "?").join(", ")})`,
    ).bind(...toUnlink),
  ];
  if (target) {
    statements.push(
      env.DB.prepare(`UPDATE ${table} SET translation_key = ? WHERE id IN (?, ?)`).bind(
        crypto.randomUUID(),
        id,
        target.id,
      ),
    );
  }
  await env.DB.batch(statements);

  // Detail pages of every affected row embed the language-switch target, so
  // refresh them (best-effort) instead of waiting for the timed revalidation.
  const affected = [current, target, targetOldPartner].filter((v): v is CounterpartRef => v !== null);
  for (const ref of affected) {
    await triggerRevalidate(env, { kind, locale: ref.locale, slug: ref.slug });
  }

  return null;
}

/**
 * Slug of the published counterpart of (locale, slug), for the public API.
 * `effectivelyPublished` is the SQL condition used by the public endpoints so
 * the language switch never points at a draft/unpublished article.
 */
export async function findPublishedCounterpartSlug(
  env: Env,
  table: string,
  locale: string,
  slug: string,
  effectivelyPublished: string,
): Promise<string | null> {
  const row = await env.DB.prepare(
    `SELECT slug FROM ${table}
      WHERE locale != ?
        AND translation_key IS NOT NULL
        AND translation_key = (SELECT translation_key FROM ${table} WHERE locale = ? AND slug = ?)
        AND ${effectivelyPublished}
      LIMIT 1`,
  )
    .bind(locale, locale, slug)
    .first<{ slug: string }>();
  return row?.slug ?? null;
}
