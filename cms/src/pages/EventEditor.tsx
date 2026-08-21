import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi, mediaApi, type EventGalleryImage, type EventInput } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { generateSlug } from "../lib/slug";
import { datetimeLocalToIso, isoToDatetimeLocal } from "../lib/datetime";

const EMPTY_FORM: EventInput = {
  locale: "ja",
  slug: "",
  title: "",
  date: "",
  dateRange: "",
  badge: "",
  badgeColor: "#1e6fd9",
  summary: "",
  coverImageKey: null,
  coverImageWidth: null,
  coverImageHeight: null,
  heroImageKey: null,
  heroImageWidth: null,
  heroImageHeight: null,
  videoUrl: "",
  overview: { eventName: "", datetime: "", venue: "", participants: "", content: "", organizer: "" },
  published: true,
  scheduledAt: null,
  gallery: [],
};

export default function EventEditor({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, showSuccessDialog } = useToast();
  const [form, setForm] = useState<EventInput>(EMPTY_FORM);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<EventGalleryImage[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      eventsApi
        .get(Number(id))
        .then((event) => {
          setForm({ ...event, gallery: event.gallery.map((g) => g.key) });
          setCoverUrl(event.coverImageUrl);
          setHeroUrl(event.heroImageUrl);
          setGalleryItems(event.gallery);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id]);

  function update<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateOverview<K extends keyof EventInput["overview"]>(key: K, value: string) {
    setForm((f) => ({ ...f, overview: { ...f.overview, [key]: value } }));
  }

  async function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, "events");
      update("coverImageKey", res.key);
      update("coverImageWidth", res.width);
      update("coverImageHeight", res.height);
      setCoverUrl(res.url);
      showToast("封面上传成功");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  }

  async function handleHeroChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      setUploadingVideo(true);
      setError(null);
      try {
        const res = await mediaApi.upload(file, "event-videos");
        update("videoUrl", res.url);
        showToast("详情视频上传成功");
      } catch (err) {
        setError(err instanceof Error ? err.message : "视频上传失败");
      } finally {
        setUploadingVideo(false);
        e.target.value = "";
      }
      return;
    }

    setUploadingHero(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, "events");
      update("videoUrl", "");
      update("heroImageKey", res.key);
      update("heroImageWidth", res.width);
      update("heroImageHeight", res.height);
      setHeroUrl(res.url);
      showToast("详情图片上传成功");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  }

  async function handleGalleryChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    setError(null);
    try {
      const uploaded: EventGalleryImage[] = [];
      for (const file of files) {
        const res = await mediaApi.upload(file, "events");
        uploaded.push({ key: res.key, url: res.url });
      }
      setGalleryItems((items) => [...items, ...uploaded]);
      showToast(`已上传 ${uploaded.length} 张图库照片`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  }

  function removeGalleryImage(key: string) {
    setGalleryItems((items) => items.filter((item) => item.key !== key));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: EventInput = { ...form, gallery: galleryItems.map((item) => item.key) };
    try {
      if (mode === "create") {
        const slug = generateSlug(form.title, form.date);
        const created = await eventsApi.create({ ...payload, slug });
        showSuccessDialog("创建成功");
        navigate(`/events/${created.id}/edit`, { replace: true });
      } else {
        await eventsApi.update(Number(id), payload);
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

  if (loading) return <p>加载中…</p>;

  const uploading = uploadingCover || uploadingVideo || uploadingHero || uploadingGallery;

  return (
    <div>
      <div className="page-header">
        <h1>{mode === "create" ? "新建活动" : "编辑活动"}</h1>
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

        <div className="form-row">
          <label>
            日期（YYYY.MM.DD，卡片显示用）
            <input
              value={form.date}
              placeholder="2026.07.19"
              onChange={(e) => update("date", e.target.value)}
              required
            />
          </label>
          <label>
            日期范围（可选，详情页显示，如「2026.07.19 - 2026.07.20」）
            <input
              value={form.dateRange}
              placeholder="2026.07.19 - 2026.07.20"
              onChange={(e) => update("dateRange", e.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            标签文字（如「忘年会」）
            <input value={form.badge} onChange={(e) => update("badge", e.target.value)} required />
          </label>
          <label>
            标签颜色
            <input type="color" value={form.badgeColor} onChange={(e) => update("badgeColor", e.target.value)} />
          </label>
        </div>

        <label>
          简介（详情页标题下方的引导文字）
          <textarea rows={3} value={form.summary} onChange={(e) => update("summary", e.target.value)} />
        </label>

        <label>
          封面图（首页轮播卡片 / 列表页使用）
          <span className="field-hint">仅支持图片（jpg / png / webp / gif）。</span>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleCoverChange} />
        </label>
        {uploadingCover && <p>封面上传中…</p>}
        {coverUrl && <img src={coverUrl} alt="" className="image-preview" />}

        <label>
          详情图 / 视频（可选，详情页顶部展示）
          <span className="field-hint">
            可上传图片或视频。上传视频后详情页会直接播放（MP4 / WebM / OGG，最大 100MB）；上传图片则显示该图。都不上传时使用封面图。
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/ogg"
            onChange={handleHeroChange}
          />
        </label>
        {(uploadingHero || uploadingVideo) && <p>{uploadingVideo ? "视频上传中…" : "图片上传中…"}</p>}
        {heroUrl && !form.videoUrl && <img src={heroUrl} alt="" className="image-preview" />}
        {form.videoUrl && (
          <div className="video-preview-wrap">
            {/\.(mp4|webm|ogg)(\?.*)?$/i.test(form.videoUrl) ? (
              <video src={form.videoUrl} controls preload="metadata" className="video-preview" />
            ) : (
              <p className="hint">当前为旧的外部视频链接；上传视频文件后会自动替换。</p>
            )}
            <button type="button" className="btn-link danger" onClick={() => update("videoUrl", "")}>
              移除视频
            </button>
          </div>
        )}

        <fieldset className="overview-fieldset">
          <legend>开催概要（选填，用于详情页右侧信息表）</legend>
          <div className="form-row">
            <label>
              イベント名
              <input
                value={form.overview.eventName}
                onChange={(e) => updateOverview("eventName", e.target.value)}
              />
            </label>
            <label>
              開催日時
              <input
                value={form.overview.datetime}
                onChange={(e) => updateOverview("datetime", e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              会場
              <input value={form.overview.venue} onChange={(e) => updateOverview("venue", e.target.value)} />
            </label>
            <label>
              参加者
              <input
                value={form.overview.participants}
                onChange={(e) => updateOverview("participants", e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              内容
              <input value={form.overview.content} onChange={(e) => updateOverview("content", e.target.value)} />
            </label>
            <label>
              主催
              <input
                value={form.overview.organizer}
                onChange={(e) => updateOverview("organizer", e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <label>
          图库（可选，多选上传，详情页以照片墙+灯箱展示）
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleGalleryChange}
          />
        </label>
        {uploadingGallery && <p>上传中…</p>}
        {galleryItems.length > 0 && (
          <div className="gallery-preview-grid">
            {galleryItems.map((item) => (
              <div key={item.key} className="gallery-preview-item">
                {item.url && <img src={item.url} alt="" />}
                <button type="button" className="gallery-remove-btn" onClick={() => removeGalleryImage(item.key)}>
                  删除
                </button>
              </div>
            ))}
          </div>
        )}

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
