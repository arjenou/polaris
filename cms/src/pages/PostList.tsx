import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ContentPost, ContentPostInput } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { formatDateTime } from "../lib/datetime";
import { CONTENT_TYPES, type ContentTypeKey } from "../lib/contentTypes";
import { SkeletonTableRows } from "../components/Skeleton";

function isVisible(post: ContentPost): boolean {
  return post.published || Boolean(post.scheduledAt && new Date(post.scheduledAt) <= new Date());
}

function statusLabel(post: ContentPost): string {
  if (isVisible(post)) return "已发布";
  if (post.scheduledAt) {
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
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  async function handleVisibilityChange(post: ContentPost, published: boolean) {
    const input: ContentPostInput = {
      locale: post.locale,
      slug: post.slug,
      title: post.title,
      date: post.date,
      tag: post.tag,
      excerpt: post.excerpt,
      content: post.content,
      imageKey: post.imageKey,
      imageWidth: post.imageWidth,
      imageHeight: post.imageHeight,
      published,
      // Choosing "显示" must publish immediately. When hiding, retain an
      // existing future schedule. An elapsed schedule must be cleared when
      // hiding, otherwise the public API would still treat the item as live.
      scheduledAt:
        !published && post.scheduledAt && new Date(post.scheduledAt) > new Date()
          ? post.scheduledAt
          : null,
    };

    setUpdatingId(post.id);
    try {
      const updated = await config.api.update(post.id, input);
      setPosts((current) => current.map((item) => (item.id === post.id ? updated : item)));
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
        <h1>{config.labels.listTitle}</h1>
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
        <Link to={`${config.basePath}/new`} className="btn-primary">
          {config.labels.newButtonLabel}
        </Link>
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
                <td>
                  <select
                    className={`visibility-select ${isVisible(post) ? "is-visible" : "is-hidden"}`}
                    value={isVisible(post) ? "visible" : "hidden"}
                    disabled={updatingId === post.id}
                    aria-label={`设置「${post.title}」的显示状态`}
                    onChange={(e) => handleVisibilityChange(post, e.target.value === "visible")}
                  >
                    <option value="visible">显示</option>
                    <option value="hidden">不显示</option>
                  </select>
                  {!post.published && post.scheduledAt && (
                    <div className="visibility-schedule">{statusLabel(post)}</div>
                  )}
                </td>
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
