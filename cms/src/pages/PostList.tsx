import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ContentPost } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { formatDateTime } from "../lib/datetime";
import { CONTENT_TYPES, type ContentTypeKey } from "../lib/contentTypes";
import { SkeletonTableRows } from "../components/Skeleton";

function statusLabel(post: ContentPost): string {
  if (post.published) return "已发布";
  if (post.scheduledAt) {
    if (new Date(post.scheduledAt) <= new Date()) return "已发布";
    return `定时发布：${formatDateTime(post.scheduledAt)}`;
  }
  return "草稿";
}

export default function PostList({ resource }: { resource: ContentTypeKey }) {
  const config = CONTENT_TYPES[resource];
  const { showToast } = useToast();
  const [locale, setLocale] = useState<"ja" | "zh">("ja");
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    config.api
      .list(locale)
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [locale, resource]);

  async function handleDelete(post: ContentPost) {
    if (!confirm(`确认删除「${post.title}」？此操作不可撤销。`)) return;
    try {
      await config.api.remove(post.id);
      showToast("删除成功");
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{config.labels.listTitle}</h1>
        <Link to={`${config.basePath}/new`} className="btn-primary">
          {config.labels.newButtonLabel}
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
      <table className="data-table posts-table">
        <colgroup>
          <col className="col-date" />
          <col className="col-badge" />
          <col />
          <col className="col-status" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>日期</th>
            <th>标签</th>
            <th>标题</th>
            <th>状态</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows columns={["text", "badge", "text", "badge", "actions"]} />
          ) : (
            <>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.date}</td>
                <td>{post.tag}</td>
                <td>{post.title}</td>
                <td>{statusLabel(post)}</td>
                <td className="table-actions">
                  <Link to={`${config.basePath}/${post.id}/edit`}>编辑</Link>
                  <button className="btn-link danger" onClick={() => handleDelete(post)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
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
