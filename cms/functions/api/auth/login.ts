/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json } from "../../_lib/response";
import { buildSessionCookie, createSessionToken } from "../../_lib/session";

interface LoginBody {
  username?: string;
  password?: string;
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

  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
    return errorJson("用户名或密码错误", 401);
  }

  const token = await createSessionToken(username, env.SESSION_SECRET);
  return json({ ok: true, username }, {}, { "Set-Cookie": buildSessionCookie(token) });
};
