import { useEffect, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { groupInfoApi, type GroupTimelineEntry } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonTableRows } from "../components/Skeleton";

export default function GroupTimeline() {
  const { showToast, showSuccessDialog } = useToast();
  const [locale, setLocale] = useState<"ja" | "zh">("ja");
  const [items, setItems] = useState<GroupTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function refresh() {
    setLoading(true);
    groupInfoApi
      .listTimeline(locale)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [locale]);

  async function handleDelete(item: GroupTimelineEntry) {
    if (!confirm(`确认删除「${item.date} ${item.event}」？此操作不可撤销。`)) return;
    try {
      await groupInfoApi.removeTimelineEntry(item.id);
      showSuccessDialog("删除成功");
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  async function handleVisibilityChange(item: GroupTimelineEntry, published: boolean) {
    setUpdatingId(item.id);
    try {
      const updated = await groupInfoApi.updateTimelineEntry(item.id, {
        locale: item.locale,
        date: item.date,
        event: item.event,
        published,
      });
      setItems((current) => current.map((row) => (row.id === item.id ? updated : row)));
      showToast(published ? "已设为显示" : "已设为不显示");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "状态更新失败", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  async function handleDragEnd() {
    if (dragIndex === null) return;
    setDragIndex(null);
    try {
      await groupInfoApi.reorderTimeline(locale, items.map((item) => item.id));
      showToast("排序已保存");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "排序保存失败", "error");
      refresh();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>グループ沿革管理</h1>
      </div>

      <p className="hint">
        管理「グループ情報」页面的「グループ沿革」时间轴条目，可自由增删条目、修改日期与内容。ja/zh 内容各自独立维护。拖动可调整顺序（拖动后自动保存）。
      </p>

      <div className="tabs-bar">
        <div className="tabs">
          <button className={locale === "ja" ? "active" : ""} onClick={() => setLocale("ja")}>
            日语
          </button>
          <button className={locale === "zh" ? "active" : ""} onClick={() => setLocale("zh")}>
            中文
          </button>
        </div>
        <Link to={`/group-timeline/${locale}/new`} className="btn-primary">
          + 新建
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}
      <table className="data-table">
        <colgroup>
          <col className="col-drag" />
          <col style={{ width: 140 }} />
          <col />
          <col className="col-status" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th />
            <th>日期</th>
            <th>事件内容</th>
            <th>显示</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows columns={["drag", "text", "text-block", "badge", "actions"]} />
          ) : (
            <>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={dragIndex === index ? "dragging-row" : ""}
                >
                  <td className="drag-handle" title="拖动排序">
                    ⠿
                  </td>
                  <td>{item.date}</td>
                  <td>{item.event}</td>
                  <td>
                    <select
                      className={`visibility-select ${item.published ? "is-visible" : "is-hidden"}`}
                      value={item.published ? "visible" : "hidden"}
                      disabled={updatingId === item.id}
                      aria-label={`设置「${item.date} ${item.event}」的显示状态`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleVisibilityChange(item, e.target.value === "visible")}
                    >
                      <option value="visible">显示</option>
                      <option value="hidden">不显示</option>
                    </select>
                  </td>
                  <td className="table-actions">
                    <Link to={`/group-timeline/${locale}/${item.id}/edit`}>编辑</Link>
                    <button className="btn-link danger" onClick={() => handleDelete(item)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
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
