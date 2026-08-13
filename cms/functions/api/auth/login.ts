/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { verifyPassword } from "../../_lib/password";
import { errorJson, json } from "../../_lib/response";
import { buildSessionCookie, createSessionToken } from "../../_lib/session";

interface LoginBody {
  username?: string;
  password?: string;
}

interface AdminUserRow {
  username: string;
  password_hash: string;
  token_version: number;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return errorJson("请求格式错误", 400);
  }

  const { username, password } = body;
  if (!username || !password) {
    return errorJson("请输入用户名和密码", 400);
  }

  const row = await env.DB.prepare("SELECT username, password_hash, token_version FROM admin_users WHERE username = ?")
    .bind(username)
    .first<AdminUserRow>();

  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return errorJson("用户名或密码错误", 401);
  }

  const token = await createSessionToken({ username: row.username, tokenVersion: row.token_version }, env.SESSION_SECRET);
  return json({ ok: true, username: row.username }, {}, { "Set-Cookie": buildSessionCookie(token) });
};
