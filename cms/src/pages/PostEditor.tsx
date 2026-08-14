import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mediaApi, type ContentPostInput } from "../lib/api";
import RichTextEditor from "../components/RichTextEditor";
import { useToast } from "../lib/ToastContext";
import { generateSlug } from "../lib/slug";
import { datetimeLocalToIso, isoToDatetimeLocal } from "../lib/datetime";
import { CONTENT_TYPES, type ContentTypeKey } from "../lib/contentTypes";

const EXCERPT_MAX_LENGTH = 120;

const EMPTY_FORM: ContentPostInput = {
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
  scheduledAt: null,
};

export default function PostEditor({ resource, mode }: { resource: ContentTypeKey; mode: "create" | "edit" }) {
  const config = CONTENT_TYPES[resource];
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<ContentPostInput>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      config.api
        .get(Number(id))
        .then((post) => {
          setForm(post);
          setImageUrl(post.imageUrl);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id]);

  function update<K extends keyof ContentPostInput>(key: K, value: ContentPostInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, config.mediaFolder);
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
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        const slug = generateSlug(form.title, form.date);
        const created = await config.api.create({ ...form, slug });
        showToast("创建成功");
        navigate(`${config.basePath}/${created.id}/edit`, { replace: true });
      } else {
        await config.api.update(Number(id), form);
        showToast("保存成功");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>加载中…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{mode === "create" ? config.labels.createTitle : config.labels.editTitle}</h1>
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
            Slug（系统自动生成）
            <input value={mode === "create" ? "保存后自动生成" : form.slug} disabled />
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
              onChange={(e) => {
                const published = e.target.checked;
                update("published", published);
                if (published) update("scheduledAt", null);
              }}
            />
            已发布（前台可见）
          </label>
        </div>

        {!form.published && (
          <label>
            预约发布时间（可选，到点后自动发布，最多延迟约 5 分钟生效）
            <input
              type="datetime-local"
              value={isoToDatetimeLocal(form.scheduledAt)}
              onChange={(e) => update("scheduledAt", datetimeLocalToIso(e.target.value))}
            />
          </label>
        )}

        <label>
          标题
          <input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </label>

        <label>
          摘要（卡片文字，最多 {EXCERPT_MAX_LENGTH} 字）
          <textarea
            rows={2}
            value={form.excerpt}
            maxLength={EXCERPT_MAX_LENGTH}
            onChange={(e) => update("excerpt", e.target.value)}
            required
          />
          <span className="char-counter">
            {form.excerpt.length} / {EXCERPT_MAX_LENGTH}
          </span>
        </label>

        <label>
          配图
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageChange} />
        </label>
        {uploading && <p>上传中…</p>}
        {imageUrl && <img src={imageUrl} alt="" className="image-preview" />}

        <label>
          正文
          <RichTextEditor initialContent={form.content} onChange={(html) => update("content", html)} />
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
