/// <reference types="@cloudflare/workers-types" />
import { isContactSubmissionsAdminPath, isSuperAdmin } from "../../_lib/adminRoles";
import type { Env } from "../../_lib/env";
import { errorJson } from "../../_lib/response";
import { requireSession } from "../../_lib/session";

export const onRequest: PagesFunction<Env> = async (context) => {
  const session = await requireSession(context.request, context.env);
  if (!session) return errorJson("未登录或登录已过期", 401);

  const pathname = new URL(context.request.url).pathname;
  if (!isSuperAdmin(session.username) && !isContactSubmissionsAdminPath(pathname)) {
    return errorJson("无权限访问该功能", 403);
  }

  return context.next();
};
