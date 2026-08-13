/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson } from "../../_lib/response";
import { requireSession } from "../../_lib/session";

export const onRequest: PagesFunction<Env> = async (context) => {
  const session = await requireSession(context.request, context.env);
  if (!session) return errorJson("未登录或登录已过期", 401);
  return context.next();
};
