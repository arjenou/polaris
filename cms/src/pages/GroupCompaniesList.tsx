import { useEffect, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { groupCompaniesApi, type GroupCompany, type GroupCompanyRegion } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonTableRows } from "../components/Skeleton";

export default function GroupCompaniesList() {
  const { showToast, showSuccessDialog } = useToast();
  const [locale, setLocale] = useState<"ja" | "zh">("ja");
  const [region, setRegion] = useState<GroupCompanyRegion>("domestic");
  const [items, setItems] = useState<GroupCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function refresh() {
    setLoading(true);
    groupCompaniesApi
      .list(locale, region)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [locale, region]);

  async function handleDelete(item: GroupCompany) {
    if (!confirm(`确认删除「${item.name}」？此操作不可撤销。`)) return;
    try {
      await groupCompaniesApi.remove(item.id);
      showSuccessDialog("删除成功");
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  async function handleVisibilityChange(item: GroupCompany, published: boolean) {
    setUpdatingId(item.id);
    try {
      const updated = await groupCompaniesApi.update(item.id, {
        locale: item.locale,
        region: item.region,
        name: item.name,
        business: item.business,
        address: item.address,
        phone: item.phone,
        established: item.established,
        capital: item.capital,
        representative: item.representative,
        imageKey: item.imageKey,
        imageWidth: item.imageWidth,
        imageHeight: item.imageHeight,
        href: item.href,
        comingSoon: item.comingSoon,
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
      await groupCompaniesApi.reorder(locale, region, items.map((item) => item.id));
      showToast("排序已保存");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "排序保存失败", "error");
      refresh();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>集团各企业概要</h1>
      </div>

      <p className="hint">
        管理「グループ情報」页面的「グループ企業紹介」板块。ja/zh 内容各自独立填写。拖动可调整顺序（拖动后自动保存）。
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
        <Link to={`/group-companies/${locale}/${region}/new`} className="btn-primary">
          + 新建
        </Link>
      </div>

      <div className="tabs">
        <button className={region === "domestic" ? "active" : ""} onClick={() => setRegion("domestic")}>
          日本国内企業
        </button>
        <button className={region === "overseas" ? "active" : ""} onClick={() => setRegion("overseas")}>
          海外企業
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      <table className="data-table company-table">
        <colgroup>
          <col className="col-drag" />
          <col className="col-logo" />
          <col />
          <col className="col-status" />
          <col className="col-status" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th />
            <th>Logo</th>
            <th>名称 / 业务内容 / 所在地</th>
            <th>显示</th>
            <th>状态</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows columns={["drag", "thumb-wide", "text-block", "badge", "badge", "actions"]} />
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
                    <img src={item.imageUrl} alt="" className="company-logo-thumb" />
                  ) : (
                    <span className="company-logo-placeholder" />
                  )}
                </td>
                <td>
                  <div className="company-info-name">{item.name}</div>
                  <div className="company-info-detail">{item.business}</div>
                  <div className="company-info-detail">{item.address}</div>
                </td>
                <td>
                  <select
                    className={`visibility-select ${item.published ? "is-visible" : "is-hidden"}`}
                    value={item.published ? "visible" : "hidden"}
                    disabled={updatingId === item.id}
                    aria-label={`设置「${item.name}」的显示状态`}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleVisibilityChange(item, e.target.value === "visible")}
                  >
                    <option value="visible">显示</option>
                    <option value="hidden">不显示</option>
                  </select>
                </td>
                <td>
                  {item.comingSoon ? (
                    <span className="status-badge status-draft">
                      <span className="status-dot" />
                      サイト準備中
                    </span>
                  ) : (
                    <span className="status-badge status-published">
                      <span className="status-dot" />
                      已上线
                    </span>
                  )}
                </td>
                <td className="table-actions">
                  <Link to={`/group-companies/${locale}/${region}/${item.id}/edit`}>编辑</Link>
                  <button className="btn-link danger" onClick={() => handleDelete(item)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
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
