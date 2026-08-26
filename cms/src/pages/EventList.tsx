import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi, type EventInput, type EventItem } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { formatDateTime } from "../lib/datetime";
import { SkeletonTableRows } from "../components/Skeleton";

function isVisible(event: EventItem): boolean {
  return event.published || Boolean(event.scheduledAt && new Date(event.scheduledAt) <= new Date());
}

function statusLabel(event: EventItem): string {
  if (isVisible(event)) return "已发布";
  if (event.scheduledAt) {
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
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  async function handleVisibilityChange(event: EventItem, published: boolean) {
    const input: EventInput = {
      locale: event.locale,
      slug: event.slug,
      title: event.title,
      date: event.date,
      dateRange: event.dateRange,
      badge: event.badge,
      badgeColor: event.badgeColor,
      summary: event.summary,
      coverImageKey: event.coverImageKey,
      coverImageWidth: event.coverImageWidth,
      coverImageHeight: event.coverImageHeight,
      heroImageKey: event.heroImageKey,
      heroImageWidth: event.heroImageWidth,
      heroImageHeight: event.heroImageHeight,
      videoUrl: event.videoUrl,
      videoPosterKey: event.videoPosterKey,
      videoPosterWidth: event.videoPosterWidth,
      videoPosterHeight: event.videoPosterHeight,
      overview: event.overview,
      gallery: event.gallery.map((image) => image.key),
      published,
      scheduledAt:
        !published && event.scheduledAt && new Date(event.scheduledAt) > new Date()
          ? event.scheduledAt
          : null,
    };

    setUpdatingId(event.id);
    try {
      const updated = await eventsApi.update(event.id, input);
      setEvents((current) => current.map((item) => (item.id === event.id ? updated : item)));
      showToast(published ? "已设为显示" : "已设为不显示");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "状态更新失败", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>社内イベント</h1>
      </div>

      <div className="tabs-bar">
        <div className="tabs">
          <button className={locale === "ja" ? "active" : ""} onClick={() => setLocale("ja")}>
            日语
          </button>
          <button className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")}>
            中文
          </button>
        </div>
        <Link to="/events/new" className="btn-primary">
          + 新建
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}
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
          {loading ? (
            <SkeletonTableRows columns={["cover", "text-block", "badge", "badge", "actions"]} />
          ) : (
            <>
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
                <td>
                  <select
                    className={`visibility-select ${isVisible(event) ? "is-visible" : "is-hidden"}`}
                    value={isVisible(event) ? "visible" : "hidden"}
                    disabled={updatingId === event.id}
                    aria-label={`设置「${event.title}」的显示状态`}
                    onChange={(e) => handleVisibilityChange(event, e.target.value === "visible")}
                  >
                    <option value="visible">显示</option>
                    <option value="hidden">不显示</option>
                  </select>
                  {!event.published && event.scheduledAt && (
                    <div className="visibility-schedule">{statusLabel(event)}</div>
                  )}
                </td>
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
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
