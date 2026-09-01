import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mediaApi, type ContentPostInput } from "../lib/api";
import RichTextEditor from "../components/RichTextEditor";
import ImageCropper from "../components/ImageCropper";
import { COVER_ASPECT_RATIO } from "../lib/coverImage";
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
  const { showToast, showSuccessDialog } = useToast();
  const [form, setForm] = useState<ContentPostInput>(EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setCropSource(file);
  }

  async function handleCropConfirm(croppedFile: File) {
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(croppedFile, config.mediaFolder);
      update("imageKey", res.key);
      update("imageWidth", res.width);
      update("imageHeight", res.height);
      setImageUrl(res.url);
      setCropSource(null);
      showToast("封面图上传成功");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  function handleImageRemove() {
    update("imageKey", null);
    update("imageWidth", null);
    update("imageHeight", null);
    setImageUrl(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.imageKey) {
      const message = "请上传封面图后再保存";
      setError(message);
      showToast(message, "error");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const goToList = () => navigate(config.basePath);
      if (mode === "create") {
        const slug = generateSlug(form.title, form.date);
        await config.api.create({ ...form, slug });
        showSuccessDialog("创建成功", goToList);
      } else {
        await config.api.update(Number(id), form);
        showSuccessDialog("保存成功", goToList);
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
          卡片封面图（必填）
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageChange} />
          <span className="field-hint">
            仅用于列表页与首页的卡片封面，不会显示在文章正文中；正文里的图片请在下方正文编辑器中插入。选择图片后会弹出
            16:10 的裁剪框，与前台封面显示比例一致。
          </span>
        </label>
        {uploading && <p>上传中…</p>}
        {imageUrl && (
          <div className="cover-preview-wrap">
            <div className="cover-preview" style={{ aspectRatio: `${COVER_ASPECT_RATIO}` }}>
              <img src={imageUrl} alt="" />
            </div>
            <button type="button" className="btn-link danger" onClick={handleImageRemove} disabled={uploading}>
              移除封面图
            </button>
          </div>
        )}

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

      {cropSource && (
        <ImageCropper
          file={cropSource}
          aspectRatio={COVER_ASPECT_RATIO}
          busy={uploading}
          hint="前台卡片封面按 16:10 显示，请拖动选框选择要作为封面的区域，可拖动四角调整大小。"
          onCancel={() => setCropSource(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
