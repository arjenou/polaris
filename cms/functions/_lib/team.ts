/// <reference types="@cloudflare/workers-types" />
import type { Env } from "./env";

export interface TeamMemberRow {
  id: number;
  locale: string;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  department: string;
  position: string;
  description: string;
  tags: string;
  languages: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  sort_order: number;
  is_president: number;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberInput {
  locale?: string;
  lastName?: string;
  firstName?: string;
  lastNameKana?: string;
  firstNameKana?: string;
  department?: string;
  position?: string;
  description?: string;
  tags?: string[];
  languages?: string[];
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  published?: boolean;
  isPresident?: boolean;
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function toTeamApiShape(row: TeamMemberRow, origin: string, submissionCount?: number) {
  return {
    id: row.id,
    locale: row.locale,
    lastName: row.last_name,
    firstName: row.first_name,
    lastNameKana: row.last_name_kana,
    firstNameKana: row.first_name_kana,
    department: row.department,
    position: row.position,
    description: row.description,
    tags: parseJsonArray(row.tags),
    languages: parseJsonArray(row.languages),
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    sortOrder: row.sort_order,
    isPresident: Boolean(row.is_president),
    published: Boolean(row.published),
    ...(submissionCount !== undefined ? { submissionCount } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function validateTeamMember(input: TeamMemberInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!input.lastName) return "姓不能为空";
  if (!input.firstName) return "名不能为空";
  if (!input.department) return "部门不能为空";
  if (input.tags && !Array.isArray(input.tags)) return "tags 必须是数组";
  if (input.languages && !Array.isArray(input.languages)) return "languages 必须是数组";
  return null;
}

export function toTagsJson(values: string[] | undefined): string {
  return JSON.stringify((values ?? []).map((v) => v.trim()).filter(Boolean));
}

/** Ensures only one published president per locale. Pass null to clear. */
export async function applyTeamPresident(env: Env, locale: string, memberId: number | null): Promise<void> {
  const statements = [env.DB.prepare("UPDATE team_members SET is_president = 0 WHERE locale = ?").bind(locale)];
  if (memberId !== null) {
    statements.push(
      env.DB.prepare("UPDATE team_members SET is_president = 1 WHERE id = ? AND locale = ?").bind(memberId, locale),
    );
  }
  await env.DB.batch(statements);
}
