import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { contactSubmissionsApi, type ContactSubmission } from "../lib/api";
import { formatDateTime } from "../lib/datetime";
import { SkeletonTableRows } from "../components/Skeleton";

function previewMessage(message: string): string {
  const text = message.trim();
  if (!text) return "—";
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

export default function ContactSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contactSubmissionsApi
      .list()
      .then(setSubmissions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>咨询记录</h1>
      </div>
      <p className="hint">
        来自 /contact 联系表单的真实提交记录。"关联社员"表示访客是通过该社员的"咨询该成员"按钮进入表单页并完成提交的——仅点击按钮但未提交不会出现在这里。点击一行可查看完整详情。
      </p>

      {error && <p className="form-error">{error}</p>}
      <table className="data-table">
        <thead>
          <tr>
            <th>提交时间</th>
            <th>语言</th>
            <th>关联社员</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>内容</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows
              columns={["text", "badge", "text", "text", "text", "text", "actions"]}
            />
          ) : (
            <>
            {submissions.map((s) => (
              <tr
                key={s.id}
                className="clickable-row"
                onClick={() => navigate(`/contact-submissions/${s.id}`)}
              >
                <td>
                  {!s.isRead && <span className="nav-dot" title="新咨询" />}
                  {formatDateTime(s.createdAt)}
                </td>
                <td>{s.locale === "ja" ? "日语" : "中文"}</td>
                <td>{s.memberName ?? "—"}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td className="submission-message">{previewMessage(s.message)}</td>
                <td className="table-actions">
                  <Link to={`/contact-submissions/${s.id}`} onClick={(e) => e.stopPropagation()}>
                    查看
                  </Link>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
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
