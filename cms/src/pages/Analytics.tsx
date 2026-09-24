import { useEffect, useRef, useState } from "react";
import { analyticsApi, type AnalyticsRangeDays, type TrafficReport } from "../lib/api";
import { SkeletonBlock } from "../components/Skeleton";

const RANGE_OPTIONS: { days: AnalyticsRangeDays; label: string }[] = [
  { days: 7, label: "最近 7 天" },
  { days: 30, label: "最近 30 天" },
];

const SERIES = [
  { key: "visits", label: "访问次数", color: "var(--series-1)" },
  { key: "pageviews", label: "页面浏览量", color: "var(--series-2)" },
] as const;

const DEVICE_LABELS: Record<string, string> = {
  desktop: "电脑",
  mobile: "手机",
  tablet: "平板",
};

const regionNames = new Intl.DisplayNames(["zh-CN"], { type: "region" });
const numberFormat = new Intl.NumberFormat("zh-CN");

function formatNumber(n: number): string {
  return numberFormat.format(n);
}

/** Cloudflare reports ISO 3166 alpha-2 codes; "XX"/"T1" mean unknown / Tor. */
function countryLabel(code: string): string {
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return "未知地区";
  const flag = String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
  let name = code;
  try {
    name = regionNames.of(code) ?? code;
  } catch {
    // Unrecognised code — fall back to showing it as-is.
  }
  return `${flag} ${name}`;
}

function StatTile({
  label,
  value,
  previous,
  note,
}: {
  label: string;
  value: number;
  previous?: number;
  note?: string;
}) {
  let delta: React.ReactNode = null;
  if (previous !== undefined) {
    if (previous === 0) {
      delta = <span className="stat-delta">上一周期无数据</span>;
    } else {
      const pct = ((value - previous) / previous) * 100;
      const up = pct >= 0;
      delta = (
        <span className={`stat-delta ${up ? "stat-delta-up" : "stat-delta-down"}`}>
          {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
          <span className="stat-delta-base"> 较上一周期</span>
        </span>
      );
    }
  }
  return (
    <div className="stat-tile">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{formatNumber(value)}</div>
      {delta}
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value)! * magnitude;
  return step * 4;
}

function TrendChart({ daily }: { daily: TrafficReport["daily"] }) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const height = 260;
  const margin = { top: 16, right: 16, bottom: 28, left: 44 };
  const plotW = Math.max(width - margin.left - margin.right, 0);
  const plotH = height - margin.top - margin.bottom;
  const yMax = niceMax(Math.max(...daily.map((d) => Math.max(d.visits, d.pageviews)), 0));
  const x = (i: number) => margin.left + (daily.length <= 1 ? plotW / 2 : (i / (daily.length - 1)) * plotW);
  const y = (v: number) => margin.top + plotH - (v / yMax) * plotH;
  const ticks = [0, 1, 2, 3, 4].map((i) => (yMax / 4) * i);
  const labelEvery = Math.ceil(daily.length / 8);

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHoverIndex(Math.min(daily.length - 1, Math.max(0, Math.round(ratio * (daily.length - 1)))));
  }

  const hovered = hoverIndex !== null ? daily[hoverIndex] : null;

  return (
    <div className="trend-chart" ref={containerRef}>
      <div className="chart-legend">
        {SERIES.map((s) => (
          <span key={s.key} className="chart-legend-item">
            <span className="chart-legend-line" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="每日访问趋势">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={margin.left} x2={width - margin.right} y1={y(t)} y2={y(t)} className="chart-grid" />
              <text x={margin.left - 8} y={y(t)} className="chart-axis-label" textAnchor="end" dominantBaseline="middle">
                {formatNumber(t)}
              </text>
            </g>
          ))}
          {daily.map((d, i) =>
            i % labelEvery === 0 || i === daily.length - 1 ? (
              <text key={d.date} x={x(i)} y={height - 8} className="chart-axis-label" textAnchor="middle">
                {d.date.slice(5).replace("-", "/")}
              </text>
            ) : null,
          )}
          {SERIES.map((s) => (
            <polyline
              key={s.key}
              points={daily.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {hovered && hoverIndex !== null && (
            <g>
              <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={margin.top} y2={margin.top + plotH} className="chart-crosshair" />
              {SERIES.map((s) => (
                <circle
                  key={s.key}
                  cx={x(hoverIndex)}
                  cy={y(hovered[s.key])}
                  r={4}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
          />
        </svg>
      )}
      {hovered && hoverIndex !== null && (
        <div
          className="chart-tooltip"
          style={{
            left: Math.min(x(hoverIndex) + 12, width - 150),
            top: margin.top,
          }}
        >
          <div className="chart-tooltip-title">{hovered.date}</div>
          {SERIES.map((s) => (
            <div key={s.key} className="chart-tooltip-row">
              <span className="chart-legend-line" style={{ background: s.color }} />
              <strong>{formatNumber(hovered[s.key])}</strong>
              <span className="chart-tooltip-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}
      <details className="chart-table-toggle">
        <summary>查看每日数据</summary>
        <table className="data-table analytics-table">
          <thead>
            <tr>
              <th>日期</th>
              <th className="num">访问次数</th>
              <th className="num">页面浏览量</th>
            </tr>
          </thead>
          <tbody>
            {[...daily].reverse().map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td className="num">{formatNumber(d.visits)}</td>
                <td className="num">{formatNumber(d.pageviews)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function BarList({
  rows,
  valueLabel,
  emptyText = "暂无数据",
}: {
  rows: { key: string; label: React.ReactNode; value: number; title?: string }[];
  valueLabel: string;
  emptyText?: string;
}) {
  if (rows.length === 0) return <p className="empty-row analytics-empty">{emptyText}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="bar-list">
      {rows.map((r) => (
        <li key={r.key} title={`${r.title ?? r.key}：${formatNumber(r.value)} ${valueLabel}`}>
          <div className="bar-list-text">
            <span className="bar-list-label">{r.label}</span>
            <span className="bar-list-value">{formatNumber(r.value)}</span>
          </div>
          <div className="bar-list-track">
            <div className="bar-list-fill" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <div className="stat-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="stat-tile">
            <SkeletonBlock width={80} height={12} />
            <SkeletonBlock width={120} height={28} style={{ marginTop: 12 }} />
          </div>
        ))}
      </div>
      <div className="analytics-card">
        <SkeletonBlock height={260} />
      </div>
    </>
  );
}

export default function Analytics() {
  const [days, setDays] = useState<AnalyticsRangeDays>(7);
  const [report, setReport] = useState<TrafficReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    analyticsApi
      .traffic(days)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const searchShare =
    report && report.totals.visits > 0 ? ((report.searchVisits / report.totals.visits) * 100).toFixed(1) : null;

  return (
    <div className="analytics-root">
      <div className="page-header">
        <h1>访问统计</h1>
      </div>

      <div className="tabs">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.days}
            className={days === opt.days ? "active" : ""}
            onClick={() => setDays(opt.days)}
            disabled={loading}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading && !report ? (
        <AnalyticsSkeleton />
      ) : report ? (
        <div className={loading ? "analytics-refreshing" : undefined}>
          <div className="stat-grid">
            <StatTile label="访问次数" value={report.totals.visits} previous={report.previous.visits} />
            <StatTile label="页面浏览量" value={report.totals.pageviews} previous={report.previous.pageviews} />
            <StatTile
              label="搜索引擎来访"
              value={report.searchVisits}
              note={searchShare !== null ? `占访问次数 ${searchShare}%` : undefined}
            />
            <StatTile label="访客国家 / 地区" value={report.countries.length} />
          </div>

          <section className="analytics-card">
            <h2>每日趋势</h2>
            <TrendChart daily={report.daily} />
          </section>

          <div className="analytics-grid">
            <section className="analytics-card">
              <h2>访客国家 / 地区</h2>
              <BarList
                valueLabel="次访问"
                rows={report.countries.slice(0, 15).map((c) => ({
                  key: c.code,
                  label: countryLabel(c.code),
                  value: c.visits,
                }))}
              />
            </section>

            <section className="analytics-card">
              <h2>来源网站</h2>
              <p className="analytics-card-note">直接访问（无来源）：{formatNumber(report.directVisits)} 次</p>
              <BarList
                valueLabel="次访问"
                emptyText="暂无来自其他网站的访问"
                rows={report.referrers.map((r) => ({
                  key: r.host,
                  label: (
                    <>
                      {r.host}
                      {r.kind === "search" && <span className="tag-chip analytics-chip">搜索引擎</span>}
                    </>
                  ),
                  value: r.visits,
                }))}
              />
            </section>

            <section className="analytics-card">
              <h2>热门页面</h2>
              <BarList
                valueLabel="次浏览"
                rows={report.pages.map((p) => ({ key: p.path, label: p.path, value: p.pageviews }))}
              />
            </section>

            <section className="analytics-card">
              <h2>设备类型</h2>
              <BarList
                valueLabel="次访问"
                rows={report.devices.map((d) => ({
                  key: d.type,
                  label: DEVICE_LABELS[d.type.toLowerCase()] ?? d.type,
                  value: d.visits,
                }))}
              />
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
