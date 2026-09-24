/// <reference types="@cloudflare/workers-types" />
import {
  ANALYTICS_RANGE_DAYS,
  AnalyticsError,
  fetchTrafficReport,
  type AnalyticsRangeDays,
} from "../../../_lib/analytics";
import type { Env } from "../../../_lib/env";
import { errorJson, json } from "../../../_lib/response";

/** Queried live on every dashboard open (no caching) so the numbers always
 * reflect the latest Web Analytics data. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.CF_ANALYTICS_API_TOKEN) {
    return errorJson("尚未配置 CF_ANALYTICS_API_TOKEN，无法读取访问统计", 500);
  }

  const days = Number(new URL(request.url).searchParams.get("days") ?? 7);
  if (!ANALYTICS_RANGE_DAYS.includes(days as AnalyticsRangeDays)) {
    return errorJson("不支持的时间范围");
  }

  try {
    return json(await fetchTrafficReport(env.CF_ANALYTICS_API_TOKEN, days as AnalyticsRangeDays));
  } catch (err) {
    if (err instanceof AnalyticsError) return errorJson(err.message, 502);
    throw err;
  }
};
