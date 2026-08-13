/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { json } from "../../_lib/response";
import { requireSession } from "../../_lib/session";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const session = await requireSession(request, env.SESSION_SECRET);
  if (!session) return json({ authenticated: false }, { status: 401 });
  return json({ authenticated: true, username: session.username });
};
