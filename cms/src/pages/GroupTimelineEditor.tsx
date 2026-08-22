import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { groupInfoApi, type GroupTimelineInput } from "../lib/api";
import { useToast } from "../lib/ToastContext";

function emptyForm(locale: "ja" | "zh"): GroupTimelineInput {
  return {
    locale,
    date: "",
    event: "",
    published: true,
  };
}

export default function GroupTimelineEditor({ mode }: { mode: "create" | "edit" }) {
  const { locale, id } = useParams<{ locale: "ja" | "zh"; id: string }>();
  const navigate = useNavigate();
  const { showToast, showSuccessDialog } = useToast();
  const [form, setForm] = useState<GroupTimelineInput>(emptyForm(locale ?? "ja"));
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      groupInfoApi
        .getTimelineEntry(Number(id))
        .then((item) => setForm(item))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id]);

  function update<K extends keyof GroupTimelineInput>(key: K, value: GroupTimelineInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await groupInfoApi.createTimelineEntry(form);
        showSuccessDialog("创建成功");
        navigate(`/group-timeline`);
      } else if (id) {
        await groupInfoApi.updateTimelineEntry(Number(id), form);
        showSuccessDialog("保存成功");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!locale) return <p className="form-error">缺少页面参数</p>;
  if (loading) return <p>加载中…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>
          {mode === "create" ? "新建" : "编辑"} · グループ沿革 · {form.locale === "zh" ? "中文" : "日语"}
        </h1>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <label>
          日期（如 2025.06）
          <input value={form.date} onChange={(e) => update("date", e.target.value)} required />
        </label>

        <label>
          事件内容
          <input value={form.event} onChange={(e) => update("event", e.target.value)} required />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.published !== false}
            onChange={(e) => update("published", e.target.checked)}
          />
          显示（前台「グループ沿革」可见）
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
