import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsApi, type NewsPost } from "../lib/api";

export default function NewsList() {
  const [locale, setLocale] = useState<"ja" | "zh">("ja");
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    newsApi
      .list(locale)
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [locale]);

  async function handleDelete(post: NewsPost) {
    if (!confirm(`确认删除「${post.title}」？此操作不可撤销。`)) return;
    await newsApi.remove(post.id);
    refresh();
  }

  return (
    <div>
      <div className="page-header">
        <h1>新闻公告</h1>
        <Link to="/news/new" className="btn-primary">
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
        <table className="data-table">
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
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.date}</td>
                <td>{post.tag}</td>
                <td>{post.title}</td>
                <td>{post.published ? "已发布" : "草稿"}</td>
                <td className="table-actions">
                  <Link to={`/news/${post.id}/edit`}>编辑</Link>
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
          </tbody>
        </table>
      )}
    </div>
  );
}
