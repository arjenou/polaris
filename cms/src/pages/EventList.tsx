import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi, type EventItem } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { formatDateTime } from "../lib/datetime";

function statusLabel(event: EventItem): string {
  if (event.published) return "已发布";
  if (event.scheduledAt) {
    if (new Date(event.scheduledAt) <= new Date()) return "已发布";
    return `定时发布：${formatDateTime(event.scheduledAt)}`;
  }
  return "草稿";
}

export default function EventList() {
  const { showToast } = useToast();
  const [locale, setLocale] = useState<"ja" | "zh">("ja");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    eventsApi
      .list(locale)
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [locale]);

  async function handleDelete(event: EventItem) {
    if (!confirm(`确认删除「${event.title}」？此操作不可撤销。`)) return;
    try {
      await eventsApi.remove(event.id);
      showToast("删除成功");
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>社内イベント</h1>
        <Link to="/events/new" className="btn-primary">
          + 新建
        </Link>
      </div>

      <div className="tabs">
        <button className={locale === "ja" ? "active" : ""} onClick={() => setLocale("ja")}>
          日语
        </button>
        <button className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")}>
          中文
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p>加载中…</p>
      ) : (
        <table className="data-table events-table">
          <colgroup>
            <col className="col-cover" />
            <col />
            <col className="col-badge" />
            <col className="col-status" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>封面</th>
              <th>活动</th>
              <th>标签</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  {event.coverImageUrl ? (
                    <img src={event.coverImageUrl} alt="" className="cover-thumb" />
                  ) : (
                    <span className="cover-placeholder" />
                  )}
                </td>
                <td>
                  <div className="event-title">{event.title}</div>
                  <div className="event-date">{event.dateRange || event.date}</div>
                </td>
                <td>
                  <span className="tag-chip" style={{ background: event.badgeColor, color: "#fff" }}>
                    {event.badge}
                  </span>
                </td>
                <td>{statusLabel(event)}</td>
                <td className="table-actions">
                  <Link to={`/events/${event.id}/edit`}>编辑</Link>
                  <button className="btn-link danger" onClick={() => handleDelete(event)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-row">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
