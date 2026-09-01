/// <reference types="@cloudflare/workers-types" />
import { isSuperAdmin, SUPER_ADMIN_USERNAME } from "../../../_lib/adminRoles";
import type { Env } from "../../../_lib/env";
import { hashPassword } from "../../../_lib/password";
import { errorJson, json } from "../../../_lib/response";
import { requireSession } from "../../../_lib/session";

interface AdminUserRow {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

interface CreateUserBody {
  username?: string;
  password?: string;
}

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireSession(request, env);
  if (!session || !isSuperAdmin(session.username)) return errorJson("无权限访问该功能", 403);
  const { results } = await env.DB.prepare(
    "SELECT id, username, created_at, updated_at FROM admin_users ORDER BY created_at ASC",
  ).all<AdminUserRow>();

  return json(
    (results ?? []).map((row) => ({
      id: row.id,
      username: row.username,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  );
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireSession(request, env);
  if (!session || !isSuperAdmin(session.username)) return errorJson("无权限访问该功能", 403);

  let body: CreateUserBody;
  try {
    body = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const { username, password } = body;
  if (!username || !USERNAME_PATTERN.test(username)) {
    return errorJson("用户名需为 3-32 位英文字母/数字/下划线/连字符", 400);
  }
  if (username === SUPER_ADMIN_USERNAME) {
    return errorJson("admin 为主账号，不可重复创建", 400);
  }
  if (!password || password.length < 8) {
    return errorJson("密码至少需要 8 位", 400);
  }

  const passwordHash = await hashPassword(password);

  try {
    const result = await env.DB.prepare(
      "INSERT INTO admin_users (username, password_hash, token_version) VALUES (?, ?, 1)",
    )
      .bind(username, passwordHash)
      .run();

    return json(
      { id: result.meta.last_row_id, username },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("UNIQUE")) return errorJson("该用户名已存在", 409);
    return errorJson("创建失败: " + message, 500);
  }
};
