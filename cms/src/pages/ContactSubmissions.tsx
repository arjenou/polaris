import { useEffect, useState } from "react";
import { contactSubmissionsApi, type ContactSubmission } from "../lib/api";
import { formatDateTime } from "../lib/datetime";

export default function ContactSubmissions() {
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
        来自 /contact 联系表单的真实提交记录。"关联社员"表示访客是通过该社员的"咨询该成员"按钮进入表单页并完成提交的——仅点击按钮但未提交不会出现在这里。
      </p>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p>加载中…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>提交时间</th>
              <th>语言</th>
              <th>关联社员</th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>电话</th>
              <th>咨询类型</th>
              <th>内容</th>
              <th>联系方式</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id}>
                <td>{formatDateTime(s.createdAt)}</td>
                <td>{s.locale === "ja" ? "日语" : "中文"}</td>
                <td>{s.memberName ?? "—"}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone || "—"}</td>
                <td>{s.inquiryType || "—"}</td>
                <td className="submission-message">{s.message || "—"}</td>
                <td>{s.contactMethod || "—"}</td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={9} className="empty-row">
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
