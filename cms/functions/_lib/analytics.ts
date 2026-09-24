/// <reference types="@cloudflare/workers-types" />

/** Cloudflare account that owns the polarisgroupjp.com Web Analytics site.
 * Not a secret — it is the same ID the deploy scripts in package.json use. */
const CF_ACCOUNT_ID = "bcee1dedc81484370bd9f868a4561e22";
const SITE_HOSTS = ["polarisgroupjp.com", "www.polarisgroupjp.com"];
const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

/** The site's audience is in Japan, so days are bucketed in JST rather than
 * the UTC dates Cloudflare reports. */
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const ANALYTICS_RANGE_DAYS = [7, 30] as const;
export type AnalyticsRangeDays = (typeof ANALYTICS_RANGE_DAYS)[number];

const SEARCH_ENGINE_PATTERNS = [
  /(^|\.)google\./,
  /(^|\.)bing\.com$/,
  /(^|\.)yahoo\./,
  /(^|\.)baidu\.com$/,
  /(^|\.)duckduckgo\.com$/,
  /(^|\.)yandex\./,
  /(^|\.)naver\.com$/,
  /(^|\.)sogou\.com$/,
  /(^|\.)so\.com$/,
];

export type ReferrerKind = "search" | "other";

export interface TrafficReport {
  range: { days: AnalyticsRangeDays; start: string; end: string };
  totals: { visits: number; pageviews: number };
  previous: { visits: number; pageviews: number };
  daily: { date: string; visits: number; pageviews: number }[];
  countries: { code: string; visits: number; pageviews: number }[];
  pages: { path: string; visits: number; pageviews: number }[];
  referrers: { host: string; kind: ReferrerKind; visits: number }[];
  directVisits: number;
  searchVisits: number;
  devices: { type: string; visits: number }[];
}

interface Group<D = Record<string, string>> {
  count: number;
  sum: { visits: number };
  dimensions?: D;
}

interface GraphqlResponse {
  data?: {
    viewer: {
      accounts: {
        totals: Group[];
        prevTotals: Group[];
        hourly: Group<{ datetimeHour: string }>[];
        countries: Group<{ countryName: string }>[];
        pages: Group<{ requestPath: string }>[];
        referrers: Group<{ refererHost: string }>[];
        devices: Group<{ deviceType: string }>[];
      }[];
    } | null;
  } | null;
  errors?: { message: string }[] | null;
}

export class AnalyticsError extends Error {}

function jstDateString(ms: number): string {
  return new Date(ms + JST_OFFSET_MS).toISOString().slice(0, 10);
}

function startOfJstDay(ms: number): number {
  return Math.floor((ms + JST_OFFSET_MS) / DAY_MS) * DAY_MS - JST_OFFSET_MS;
}

function rumFilter(start: Date, end: Date): string {
  // Timestamps are generated server-side from Date objects, so inlining them
  // is safe; it also avoids depending on Cloudflare's generated input type names.
  const hosts = SITE_HOSTS.map((host) => `{ requestHost: "${host}" }`).join(", ");
  return `{ AND: [{ datetime_geq: "${start.toISOString()}", datetime_lt: "${end.toISOString()}" }, { OR: [${hosts}] }] }`;
}

function classifyReferrer(host: string): ReferrerKind {
  return SEARCH_ENGINE_PATTERNS.some((pattern) => pattern.test(host)) ? "search" : "other";
}

export async function fetchTrafficReport(token: string, days: AnalyticsRangeDays): Promise<TrafficReport> {
  const now = Date.now();
  const startMs = startOfJstDay(now) - (days - 1) * DAY_MS;
  const start = new Date(startMs);
  const end = new Date(now);
  const prevStart = new Date(startMs - days * DAY_MS);

  const filter = rumFilter(start, end);
  const query = `{
    viewer {
      accounts(filter: { accountTag: "${CF_ACCOUNT_ID}" }) {
        totals: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 1) { count sum { visits } }
        prevTotals: rumPageloadEventsAdaptiveGroups(filter: ${rumFilter(prevStart, start)}, limit: 1) { count sum { visits } }
        hourly: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 1000, orderBy: [datetimeHour_ASC]) {
          count sum { visits } dimensions { datetimeHour }
        }
        countries: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 50, orderBy: [sum_visits_DESC]) {
          count sum { visits } dimensions { countryName }
        }
        pages: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 20, orderBy: [count_DESC]) {
          count sum { visits } dimensions { requestPath }
        }
        referrers: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 100, orderBy: [sum_visits_DESC]) {
          count sum { visits } dimensions { refererHost }
        }
        devices: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 10, orderBy: [sum_visits_DESC]) {
          count sum { visits } dimensions { deviceType }
        }
      }
    }
  }`;

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new AnalyticsError(`Cloudflare API 请求失败（HTTP ${res.status}）`);
  }

  const body = (await res.json()) as GraphqlResponse;
  if (body.errors?.length) {
    throw new AnalyticsError(`Cloudflare API 返回错误：${body.errors[0].message}`);
  }
  const account = body.data?.viewer?.accounts[0];
  if (!account) {
    throw new AnalyticsError("找不到 Cloudflare 账户，请检查 API Token 的账户权限");
  }

  const dailyMap = new Map<string, { visits: number; pageviews: number }>();
  for (let ms = startMs; ms < now; ms += DAY_MS) {
    dailyMap.set(jstDateString(ms), { visits: 0, pageviews: 0 });
  }
  for (const row of account.hourly) {
    const date = jstDateString(Date.parse(row.dimensions!.datetimeHour));
    const bucket = dailyMap.get(date);
    if (!bucket) continue;
    bucket.visits += row.sum.visits;
    bucket.pageviews += row.count;
  }

  // Page loads referred by our own hosts are internal navigation, not traffic sources.
  let directVisits = 0;
  let searchVisits = 0;
  const referrers: TrafficReport["referrers"] = [];
  for (const row of account.referrers) {
    const host = row.dimensions!.refererHost.toLowerCase();
    if (SITE_HOSTS.includes(host)) continue;
    if (!host) {
      directVisits += row.sum.visits;
      continue;
    }
    const kind = classifyReferrer(host);
    if (kind === "search") searchVisits += row.sum.visits;
    referrers.push({ host, kind, visits: row.sum.visits });
  }

  return {
    range: { days, start: start.toISOString(), end: end.toISOString() },
    totals: { visits: account.totals[0]?.sum.visits ?? 0, pageviews: account.totals[0]?.count ?? 0 },
    previous: { visits: account.prevTotals[0]?.sum.visits ?? 0, pageviews: account.prevTotals[0]?.count ?? 0 },
    daily: [...dailyMap].map(([date, v]) => ({ date, ...v })),
    countries: account.countries.map((row) => ({
      code: row.dimensions!.countryName,
      visits: row.sum.visits,
      pageviews: row.count,
    })),
    pages: account.pages.map((row) => ({
      path: row.dimensions!.requestPath,
      visits: row.sum.visits,
      pageviews: row.count,
    })),
    referrers: referrers.slice(0, 20),
    directVisits,
    searchVisits,
    devices: account.devices.map((row) => ({ type: row.dimensions!.deviceType, visits: row.sum.visits })),
  };
}
