import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mediaApi, newsApi, type NewsPostInput } from "../lib/api";

const EMPTY_FORM: NewsPostInput = {
  locale: "ja",
  slug: "",
  title: "",
  date: "",
  tag: "",
  excerpt: "",
  content: "",
  imageKey: null,
  imageWidth: null,
  imageHeight: null,
  published: true,
};

export default function NewsEditor({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<NewsPostInput>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      newsApi
        .get(Number(id))
        .then((post) => {
          setForm(post);
          setImageUrl(post.imageUrl);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  function update<K extends keyof NewsPostInput>(key: K, value: NewsPostInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, "news");
      update("imageKey", res.key);
      update("imageWidth", res.width);
      update("imageHeight", res.height);
      setImageUrl(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        const created = await newsApi.create(form);
        navigate(`/news/${created.id}/edit`, { replace: true });
      } else {
        await newsApi.update(Number(id), form);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>加载中…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{mode === "create" ? "新建新闻" : "编辑新闻"}</h1>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            语言
            <select value={form.locale} onChange={(e) => update("locale", e.target.value as "ja" | "zh")}>
              <option value="ja">日语</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <label>
            Slug（英文/数字/连字符）
            <input value={form.slug} onChange={(e) => update("slug", e.target.value)} required />
          </label>
          <label>
            日期（YYYY.MM.DD）
            <input
              value={form.date}
              placeholder="2026.07.28"
              onChange={(e) => update("date", e.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            标签
            <input value={form.tag} onChange={(e) => update("tag", e.target.value)} required />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            已发布（前台可见）
          </label>
        </div>

        <label>
          标题
          <input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </label>

        <label>
          摘要
          <textarea rows={2} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} required />
        </label>

        <label>
          配图
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageChange} />
        </label>
        {uploading && <p>上传中…</p>}
        {imageUrl && <img src={imageUrl} alt="" className="image-preview" />}

        <label>
          正文（Markdown）
          <textarea rows={14} value={form.content} onChange={(e) => update("content", e.target.value)} />
        </label>

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
