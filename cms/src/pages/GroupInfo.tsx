import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  groupInfoApi,
  mediaApi,
  type GroupInfoAsset,
  type GroupInfoAssetType,
  type GroupInfoContent,
  type GroupInfoContentInput,
  type GroupInfoLocale,
} from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonBlock } from "../components/Skeleton";

const LOCALES: { locale: GroupInfoLocale; label: string }[] = [
  { locale: "ja", label: "日语页面" },
  { locale: "zh", label: "中文页面" },
];

const ASSET_CARDS: { type: GroupInfoAssetType; label: string; hint: string }[] = [
  { type: "hero", label: "页面顶部banner图", hint: "グループ情報页面最上方的通栏背景图，ja/zh 两个语言页面共用同一张。" },
  { type: "badge", label: "グループ情報水印logo", hint: "「グループ情報」板块标题旁的水印装饰图，ja/zh 两个语言页面共用同一张。" },
];

function toFormInput(content: GroupInfoContent): GroupInfoContentInput {
  return {
    heroTitle: content.heroTitle,
    introTitle: content.introTitle,
    intro: content.intro,
    timelineTitle: content.timelineTitle,
    companiesTitle: content.companiesTitle,
    domesticTitle: content.domesticTitle,
    overseasTitle: content.overseasTitle,
  };
}

function ContentForm({
  locale,
  label,
  content,
  onSaved,
}: {
  locale: GroupInfoLocale;
  label: string;
  content: GroupInfoContent;
  onSaved: (content: GroupInfoContent) => void;
}) {
  const { showToast, showSuccessDialog } = useToast();
  const [form, setForm] = useState<GroupInfoContentInput>(toFormInput(content));
  const [introText, setIntroText] = useState(content.intro.join("\n\n"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(toFormInput(content));
    setIntroText(content.intro.join("\n\n"));
  }, [content]);

  function update<K extends keyof GroupInfoContentInput>(key: K, value: GroupInfoContentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const dirty = JSON.stringify({ ...form, intro: introText }) !== JSON.stringify({ ...toFormInput(content), intro: content.intro.join("\n\n") });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const intro = introText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (intro.length === 0) {
      showToast("简介段落不能为空", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await groupInfoApi.updateContent(locale, { ...form, intro });
      onSaved(updated);
      showSuccessDialog("保存成功");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel" style={{ flex: 1, minWidth: 320 }}>
      <h2>{label}</h2>
      <form className="editor-form" onSubmit={handleSubmit}>
        <label>
          页面大标题（PageHero）
          <input value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
        </label>
        <label>
          グループ情報 标题
          <input value={form.introTitle} onChange={(e) => update("introTitle", e.target.value)} />
        </label>
        <label>
          简介正文（多段落用空行分隔）
          <textarea rows={8} value={introText} onChange={(e) => setIntroText(e.target.value)} />
        </label>
        <label>
          グループ沿革 标题
          <input value={form.timelineTitle} onChange={(e) => update("timelineTitle", e.target.value)} />
        </label>
        <label>
          グループ企業紹介 标题
          <input value={form.companiesTitle} onChange={(e) => update("companiesTitle", e.target.value)} />
        </label>
        <label>
          日本国内企業 分组标题
          <input value={form.domesticTitle} onChange={(e) => update("domesticTitle", e.target.value)} />
        </label>
        <label>
          海外企業 分组标题
          <input value={form.overseasTitle} onChange={(e) => update("overseasTitle", e.target.value)} />
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

function AssetCard({
  type,
  label,
  hint,
  item,
  onChange,
}: {
  type: GroupInfoAssetType;
  label: string;
  hint: string;
  item: GroupInfoAsset | undefined;
  onChange: () => void;
}) {
  const { showToast, showSuccessDialog } = useToast();
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, "group-info");
      await groupInfoApi.updateAsset(type, res.key, res.width, res.height);
      showSuccessDialog("上传成功");
      onChange();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "上传失败", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemove() {
    if (!confirm(`确认删除「${label}」？此操作不可撤销。`)) return;
    try {
      await groupInfoApi.removeAsset(type);
      showSuccessDialog("删除成功");
      onChange();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  return (
    <div className="panel" style={{ flex: 1, minWidth: 280 }}>
      <h2>{label}</h2>
      <p className="hint">{hint}</p>
      {item?.imageUrl ? (
        <div className="gallery-preview-item" style={{ width: "100%", height: 140, marginBottom: 16 }}>
          <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          <button type="button" className="gallery-remove-btn" onClick={handleRemove}>
            删除
          </button>
        </div>
      ) : (
        <p
          className="empty-row"
          style={{
            width: "100%",
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed #d6dae2",
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          尚未上传
        </p>
      )}
      <label className="upload-label">
        {item?.imageUrl ? "重新上传" : "上传图片"}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleUpload} disabled={uploading} />
      </label>
      {uploading && <p>上传中…</p>}
    </div>
  );
}

export default function GroupInfo() {
  const [contents, setContents] = useState<GroupInfoContent[]>([]);
  const [contentsLoading, setContentsLoading] = useState(true);
  const [assets, setAssets] = useState<GroupInfoAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refreshContents() {
    setContentsLoading(true);
    groupInfoApi
      .listContent()
      .then(setContents)
      .catch((err) => setError(err.message))
      .finally(() => setContentsLoading(false));
  }

  function refreshAssets() {
    setAssetsLoading(true);
    groupInfoApi
      .listAssets()
      .then(setAssets)
      .catch((err) => setError(err.message))
      .finally(() => setAssetsLoading(false));
  }

  useEffect(() => {
    refreshContents();
    refreshAssets();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>グループ情報 页面管理</h1>
      </div>

      <p className="hint">
        管理「グループ情報」（enterprise-intelligence）页面的顶部大标题、简介文字与共用图片。ja/zh 文字内容各自独立填写，图片两个语言页面共用同一张。「グループ沿革」的具体条目请前往「グループ沿革管理」页面维护。
      </p>

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        {contentsLoading
          ? LOCALES.map(({ locale, label }) => (
              <div key={locale} className="panel" style={{ flex: 1, minWidth: 320 }}>
                <h2>{label}</h2>
                <SkeletonBlock width="100%" height={280} radius={6} />
              </div>
            ))
          : LOCALES.map(({ locale, label }) => {
              const content = contents.find((c) => c.locale === locale);
              if (!content) return null;
              return (
                <ContentForm
                  key={locale}
                  locale={locale}
                  label={label}
                  content={content}
                  onSaved={(updated) => setContents((prev) => prev.map((c) => (c.locale === locale ? updated : c)))}
                />
              );
            })}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {assetsLoading
          ? ASSET_CARDS.map((card) => (
              <div key={card.type} className="panel" style={{ flex: 1, minWidth: 280 }}>
                <h2>{card.label}</h2>
                <SkeletonBlock width="100%" height={140} radius={6} />
              </div>
            ))
          : ASSET_CARDS.map((card) => (
              <AssetCard
                key={card.type}
                type={card.type}
                label={card.label}
                hint={card.hint}
                item={assets.find((a) => a.type === card.type)}
                onChange={refreshAssets}
              />
            ))}
      </div>
    </div>
  );
}
