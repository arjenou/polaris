/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { json, PUBLIC_CORS_HEADERS } from "../../_lib/response";
import { toMaintenancePagePublicShape, type MaintenancePageRow } from "../../_lib/maintenancePage";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const row = await env.DB.prepare("SELECT * FROM maintenance_page WHERE id = 1").first<MaintenancePageRow>();
  if (!row) return json(null, {}, PUBLIC_CORS_HEADERS);

  const shape = toMaintenancePagePublicShape(row, new URL(request.url).origin);
  return json(shape, {}, PUBLIC_CORS_HEADERS);
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
};
