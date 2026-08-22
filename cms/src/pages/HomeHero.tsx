import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { homeHeroApi, mediaApi, type HomeHeroHeadline, type HomeHeroLocale, type HomeHeroSlide } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonBlock, SkeletonGrid } from "../components/Skeleton";

const LOCALES: { locale: HomeHeroLocale; label: string }[] = [
  { locale: "ja", label: "日语首页" },
  { locale: "zh", label: "中文首页" },
];

function HeadlineForm({ locale, label, value, onSaved }: {
  locale: HomeHeroLocale;
  label: string;
  value: string;
  onSaved: (headline: string) => void;
}) {
  const { showToast } = useToast();
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => setText(value), [value]);

  const dirty = text !== value;

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      showToast("标题文字不能为空", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await homeHeroApi.updateHeadline(locale, text);
      onSaved(updated.headline);
      showToast("保存成功");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel" style={{ flex: 1, minWidth: 280 }}>
      <h2>{label}</h2>
      <form className="editor-form" onSubmit={handleSave}>
        <label>
          大标题文字
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="请输入首页大标题文字" />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving || !dirty}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function HomeHero() {
  const { showToast } = useToast();
  const [headlines, setHeadlines] = useState<HomeHeroHeadline[]>([]);
  const [headlinesLoading, setHeadlinesLoading] = useState(true);

  const [slides, setSlides] = useState<HomeHeroSlide[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function refreshHeadlines() {
    setHeadlinesLoading(true);
    homeHeroApi
      .listHeadlines()
      .then(setHeadlines)
      .catch((err) => setError(err.message))
      .finally(() => setHeadlinesLoading(false));
  }

  function refreshSlides() {
    setSlidesLoading(true);
    homeHeroApi
      .listSlides()
      .then(setSlides)
      .catch((err) => setError(err.message))
      .finally(() => setSlidesLoading(false));
  }

  useEffect(() => {
    refreshHeadlines();
    refreshSlides();
  }, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const res = await mediaApi.upload(file, "home-hero");
        await homeHeroApi.addSlide(res.key, res.width, res.height);
      }
      showToast(`已上传 ${files.length} 张图片`);
      refreshSlides();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(slide: HomeHeroSlide) {
    if (!confirm("确认删除这张图片？此操作不可撤销。")) return;
    try {
      await homeHeroApi.removeSlide(slide.id);
      showToast("删除成功");
      refreshSlides();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }

  async function handleDragEnd() {
    if (dragIndex === null) return;
    setDragIndex(null);
    try {
      await homeHeroApi.reorderSlides(slides.map((s) => s.id));
      showToast("排序已保存");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "排序保存失败", "error");
      refreshSlides();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>首页页面管理</h1>
      </div>

      <p className="hint">管理首页最上方的大标题文字（日语 / 中文可分别设置）与背景图片轮播。背景图片在两个语言页面共用同一组，拖动图片可调整顺序（拖动后自动保存）。</p>

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        {headlinesLoading
          ? LOCALES.map(({ locale, label }) => (
              <div key={locale} className="panel" style={{ flex: 1, minWidth: 280 }}>
                <h2>{label}</h2>
                <SkeletonBlock width="100%" height={56} radius={6} />
              </div>
            ))
          : LOCALES.map(({ locale, label }) => (
              <HeadlineForm
                key={locale}
                locale={locale}
                label={label}
                value={headlines.find((h) => h.locale === locale)?.headline ?? ""}
                onSaved={(headline) =>
                  setHeadlines((prev) => prev.map((h) => (h.locale === locale ? { ...h, headline } : h)))
                }
              />
            ))}
      </div>

      <div className="panel">
        <h2>背景图片轮播</h2>
        <label className="upload-label">
          上传图片（可多选）
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {uploading && <p>上传中…</p>}

        {slidesLoading ? (
          <SkeletonGrid count={5} />
        ) : slides.length === 0 ? (
          <p className="empty-row">暂无图片</p>
        ) : (
          <div className="gallery-preview-grid gallery-preview-grid-draggable">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`gallery-preview-item ${dragIndex === index ? "dragging-item" : ""}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <img src={slide.imageUrl} alt="" />
                <button type="button" className="gallery-remove-btn" onClick={() => handleDelete(slide)}>
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
