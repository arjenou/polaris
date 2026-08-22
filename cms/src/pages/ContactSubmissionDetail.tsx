import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { contactSubmissionsApi, type ContactSubmission } from "../lib/api";
import { formatDateTime } from "../lib/datetime";
import { useToast } from "../lib/ToastContext";
import { useContactUnread } from "../lib/ContactUnreadContext";
import { SkeletonBlock } from "../components/Skeleton";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function ContactSubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refresh: refreshUnreadCount } = useContactUnread();
  const [item, setItem] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    contactSubmissionsApi
      .get(Number(id))
      .then((res) => {
        setItem(res);
        // The GET above marks the submission as read on the server; sync
        // the sidebar dot right away instead of waiting for navigation.
        refreshUnreadCount();
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, refreshUnreadCount]);

  async function handleDelete() {
    if (!item) return;
    if (!confirm(`确认删除「${item.name}」的这条咨询记录？此操作不可撤销。`)) return;
    setDeleting(true);
    try {
      await contactSubmissionsApi.remove(item.id);
      showToast("删除成功");
      navigate("/contact-submissions", { replace: true });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>咨询详情</h1>
        <Link to="/contact-submissions" className="back-link">
          ← 返回列表
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <div className="detail-card">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="detail-field">
              <SkeletonBlock width={72} height={13} />
              <SkeletonBlock width="60%" height={16} />
            </div>
          ))}
        </div>
      ) : item ? (
        <dl className="detail-card">
          <Field label="提交时间" value={formatDateTime(item.createdAt)} />
          <Field label="语言" value={item.locale === "ja" ? "日语" : "中文"} />
          <Field label="关联社员" value={item.memberName ?? "—"} />
          <Field label="姓名" value={item.name} />
          <Field label="フリガナ" value={item.furigana || "—"} />
          <Field label="邮箱" value={item.email} />
          <Field label="电话" value={item.phone || "—"} />
          <Field label="咨询类型" value={item.inquiryType || "—"} />
          <Field label="联系方式" value={item.contactMethod || "—"} />
          <div className="detail-field detail-field-block">
            <dt>咨询内容</dt>
            <dd className="detail-message">{item.message || "—"}</dd>
          </div>
          <div className="form-actions detail-actions">
            <button type="button" className="btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "删除中…" : "删除"}
            </button>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
