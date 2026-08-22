import { useEffect, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { pageAdvantagesApi, type PageAdvantage, type PageGalleryKey } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonTableRows } from "../components/Skeleton";

const PAGE_TABS: { key: PageGalleryKey; label: string }[] = [
  { key: "real-estate", label: "不動産取引" },
  { key: "renovation", label: "リノベーション" },
  { key: "asset-management", label: "不動産管理" },
];

export default function PageAdvantagesList() {
  const { showToast } = useToast();
  const [pageKey, setPageKey] = useState<PageGalleryKey>("real-estate");
  const [locale, setLocale] = useState<"ja" | "zh">("ja");
  const [items, setItems] = useState<PageAdvantage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function refresh() {
    setLoading(true);
    pageAdvantagesApi
      .list(pageKey, locale)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [pageKey, locale]);

  async function handleDelete(item: PageAdvantage) {
    if (!confirm(`确认删除「${item.heading}」？此操作不可撤销。`)) return;
    try {
      await pageAdvantagesApi.remove(pageKey, item.id);
      showToast("删除成功");
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  async function handleVisibilityChange(item: PageAdvantage, published: boolean) {
    setUpdatingId(item.id);
    try {
      const updated = await pageAdvantagesApi.update(pageKey, item.id, {
        locale: item.locale,
        badge: item.badge,
        heading: item.heading,
        body: item.body,
        imageKey: item.imageKey,
        imageWidth: item.imageWidth,
        imageHeight: item.imageHeight,
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
      await pageAdvantagesApi.reorder(pageKey, locale, items.map((item) => item.id));
      showToast("排序已保存");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "排序保存失败", "error");
      refresh();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>私たちが選ばれる理由</h1>
      </div>

      <p className="hint">
        管理「不動産取引」「リノベーション」「不動産管理」三个页面中「私たちが選ばれる理由」板块的内容。ja/zh
        内容各自独立填写。拖动可调整顺序（拖动后自动保存）。
      </p>

      <div className="tabs">
        {PAGE_TABS.map((tab) => (
          <button key={tab.key} className={pageKey === tab.key ? "active" : ""} onClick={() => setPageKey(tab.key)}>
            {tab.label}
          </button>
        ))}
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
        <Link to={`/page-advantages/${pageKey}/${locale}/new`} className="btn-primary">
          + 新建
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}
      <table className="data-table team-table">
        <colgroup>
          <col className="col-drag" />
          <col className="col-avatar" />
          <col />
          <col className="col-status" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th />
            <th>图片</th>
            <th>标签 / 标题 / 内容</th>
            <th>显示</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows columns={["drag", "thumb", "text-block", "badge", "actions"]} />
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
                <td>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="avatar-thumb" />
                  ) : (
                    <span className="avatar-placeholder" />
                  )}
                </td>
                <td>
                  {item.badge && <div className="tag-chip">{item.badge}</div>}
                  <div className="member-name">{item.heading}</div>
                  <div className="member-kana">{item.body.slice(0, 60)}{item.body.length > 60 ? "…" : ""}</div>
                </td>
                <td>
                  <select
                    className={`visibility-select ${item.published ? "is-visible" : "is-hidden"}`}
                    value={item.published ? "visible" : "hidden"}
                    disabled={updatingId === item.id}
                    aria-label={`设置「${item.heading}」的显示状态`}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleVisibilityChange(item, e.target.value === "visible")}
                  >
                    <option value="visible">显示</option>
                    <option value="hidden">不显示</option>
                  </select>
                </td>
                <td className="table-actions">
                  <Link to={`/page-advantages/${pageKey}/${locale}/${item.id}/edit`}>编辑</Link>
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
