/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { hashPassword, verifyPassword } from "../../../_lib/password";
import { buildClearSessionCookie, requireSession } from "../../../_lib/session";
import { errorJson, json } from "../../../_lib/response";

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

interface AdminUserRow {
  password_hash: string;
}

/** Changes the current admin's own password. Bumps `token_version`, which
 * invalidates this (and every other) outstanding session, so the client
 * must log in again with the new password afterwards. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireSession(request, env);
  if (!session) return errorJson("未登录或登录已过期", 401);

  let body: ChangePasswordBody;
  try {
    body = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) return errorJson("请填写当前密码和新密码", 400);
  if (newPassword.length < 8) return errorJson("新密码至少需要 8 位", 400);

  const row = await env.DB.prepare("SELECT password_hash FROM admin_users WHERE username = ?")
    .bind(session.username)
    .first<AdminUserRow>();
  if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
    return errorJson("当前密码不正确", 401);
  }

  const newHash = await hashPassword(newPassword);
  await env.DB.prepare(
    "UPDATE admin_users SET password_hash = ?, token_version = token_version + 1, updated_at = datetime('now') WHERE username = ?",
  )
    .bind(newHash, session.username)
    .run();

  return json({ ok: true }, {}, { "Set-Cookie": buildClearSessionCookie() });
};
