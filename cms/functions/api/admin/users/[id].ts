/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";
import { requireSession } from "../../../_lib/session";

interface AdminUserRow {
  id: number;
  username: string;
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return errorJson("无效的 id", 400);

  const session = await requireSession(request, env);
  if (!session) return errorJson("未登录或登录已过期", 401);

  const target = await env.DB.prepare("SELECT id, username FROM admin_users WHERE id = ?")
    .bind(id)
    .first<AdminUserRow>();
  if (!target) return errorJson("未找到该用户", 404);

  if (target.username === session.username) {
    return errorJson("不能删除当前登录的账号", 400);
  }

  const { count } = (await env.DB.prepare("SELECT COUNT(*) as count FROM admin_users").first<{ count: number }>()) ?? {
    count: 0,
  };
  if (count <= 1) {
    return errorJson("至少需要保留一个管理员账号", 400);
  }

  await env.DB.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
  return json({ ok: true });
};
