import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mediaApi, pageAdvantagesApi, type PageAdvantageInput, type PageGalleryKey } from "../lib/api";
import { useToast } from "../lib/ToastContext";

const PAGE_LABELS: Record<PageGalleryKey, string> = {
  "real-estate": "不動産取引",
  renovation: "リノベーション",
  "asset-management": "不動産管理",
};

const EMPTY_FORM: PageAdvantageInput = {
  locale: "ja",
  badge: "",
  heading: "",
  body: "",
  imageKey: null,
  imageWidth: null,
  imageHeight: null,
  published: true,
};

export default function PageAdvantageEditor({ mode }: { mode: "create" | "edit" }) {
  const { pageKey, locale, id } = useParams<{ pageKey: PageGalleryKey; locale: "ja" | "zh"; id: string }>();
  const navigate = useNavigate();
  const { showToast, showSuccessDialog } = useToast();
  const [form, setForm] = useState<PageAdvantageInput>({ ...EMPTY_FORM, locale: locale ?? "ja" });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && pageKey && id) {
      pageAdvantagesApi
        .get(pageKey, Number(id))
        .then((item) => {
          setForm(item);
          setImageUrl(item.imageUrl);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pageKey, id]);

  function update<K extends keyof PageAdvantageInput>(key: K, value: PageAdvantageInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, "page-advantages");
      update("imageKey", res.key);
      update("imageWidth", res.width);
      update("imageHeight", res.height);
      setImageUrl(res.url);
      showToast("图片上传成功");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pageKey) return;
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        const created = await pageAdvantagesApi.create(pageKey, form);
        showSuccessDialog("创建成功");
        navigate(`/page-advantages/${pageKey}/${form.locale}/${created.id}/edit`, { replace: true });
      } else if (id) {
        await pageAdvantagesApi.update(pageKey, Number(id), form);
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

  if (!pageKey || !locale) return <p className="form-error">缺少页面参数</p>;
  if (loading) return <p>加载中…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>
          {mode === "create" ? "新建" : "编辑"} · {PAGE_LABELS[pageKey]} ·{" "}
          {form.locale === "zh" ? "中文" : "日语"}
        </h1>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.published !== false}
            onChange={(e) => update("published", e.target.checked)}
          />
          显示（前台「私たちが選ばれる理由」可见）
        </label>

        <div className="form-row">
          <label>
            标签（如「ADVANTAGE 1」，可选）
            <input value={form.badge} onChange={(e) => update("badge", e.target.value)} />
          </label>
        </div>

        <label>
          标题
          <input value={form.heading} onChange={(e) => update("heading", e.target.value)} required />
        </label>

        <label>
          内容
          <textarea rows={6} value={form.body} onChange={(e) => update("body", e.target.value)} required />
        </label>

        <label>
          图片
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageChange} />
        </label>
        {uploading && <p>上传中…</p>}
        {imageUrl && <img src={imageUrl} alt="" className="image-preview" />}

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving || uploading}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
