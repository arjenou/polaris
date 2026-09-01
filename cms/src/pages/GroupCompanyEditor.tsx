import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { groupCompaniesApi, mediaApi, type GroupCompanyInput, type GroupCompanyRegion } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import ImageCropper from "../components/ImageCropper";
import { LOGO_ASPECT_RATIO } from "../lib/coverImage";

const REGION_LABELS: Record<GroupCompanyRegion, string> = {
  domestic: "日本国内企業",
  overseas: "海外企業",
};

function emptyForm(locale: "ja" | "zh", region: GroupCompanyRegion): GroupCompanyInput {
  return {
    locale,
    region,
    name: "",
    business: "",
    address: "",
    phone: null,
    established: null,
    capital: null,
    representative: null,
    imageKey: null,
    imageWidth: null,
    imageHeight: null,
    href: null,
    comingSoon: false,
    published: true,
  };
}

export default function GroupCompanyEditor({ mode }: { mode: "create" | "edit" }) {
  const { locale, region, id } = useParams<{ locale: "ja" | "zh"; region: GroupCompanyRegion; id: string }>();
  const navigate = useNavigate();
  const { showToast, showSuccessDialog } = useToast();
  const [form, setForm] = useState<GroupCompanyInput>(emptyForm(locale ?? "ja", region ?? "domestic"));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      groupCompaniesApi
        .get(Number(id))
        .then((item) => {
          setForm(item);
          setImageUrl(item.imageUrl);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id]);

  function update<K extends keyof GroupCompanyInput>(key: K, value: GroupCompanyInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
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
      const res = await mediaApi.upload(croppedFile, "group-companies");
      update("imageKey", res.key);
      update("imageWidth", res.width);
      update("imageHeight", res.height);
      setImageUrl(res.url);
      setCropSource(null);
      showToast("图片上传成功");
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
    setSaving(true);
    setError(null);
    try {
      const goToList = () => navigate("/group-companies");
      if (mode === "create") {
        await groupCompaniesApi.create(form);
        showSuccessDialog("创建成功", goToList);
      } else if (id) {
        await groupCompaniesApi.update(Number(id), form);
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

  if (!locale || !region) return <p className="form-error">缺少页面参数</p>;
  if (loading) return <p>加载中…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>
          {mode === "create" ? "新建" : "编辑"} · {REGION_LABELS[region]} · {form.locale === "zh" ? "中文" : "日语"}
        </h1>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <label>
          企业名称
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </label>

        <label>
          事業内容
          <input value={form.business} onChange={(e) => update("business", e.target.value)} />
        </label>

        <label>
          所在地
          <input value={form.address} onChange={(e) => update("address", e.target.value)} />
        </label>

        <label>
          電話番号（可选，前台留空则不显示该行）
          <input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value || null)} />
        </label>

        <label>
          設立（可选，如 2018年4月）
          <input value={form.established ?? ""} onChange={(e) => update("established", e.target.value || null)} />
        </label>

        <label>
          資本金（可选）
          <input value={form.capital ?? ""} onChange={(e) => update("capital", e.target.value || null)} />
        </label>

        <label>
          代表取締役（可选）
          <input value={form.representative ?? ""} onChange={(e) => update("representative", e.target.value || null)} />
        </label>

        <label>
          链接（可选，点击卡片跳转到的页面路径，如 /business-headquarters）
          <input value={form.href ?? ""} onChange={(e) => update("href", e.target.value || null)} />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.published !== false}
            onChange={(e) => update("published", e.target.checked)}
          />
          显示（前台「グループ企業紹介」可见）
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.comingSoon}
            onChange={(e) => update("comingSoon", e.target.checked)}
          />
          显示「サイト準備中」标记（暂无独立页面）
        </label>

        <label>
          企业 Logo
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageChange} />
          <span className="field-hint">
            前台 logo 展示框比例约为 2.54:1，选择图片后会自动整体缩放进取景框，不会被截断，可再手动调整位置与大小。
          </span>
        </label>
        {uploading && <p>上传中…</p>}
        {imageUrl && (
          <div className="cover-preview-wrap">
            <div className="cover-preview" style={{ aspectRatio: `${LOGO_ASPECT_RATIO}` }}>
              <img src={imageUrl} alt="" />
            </div>
            <button type="button" className="btn-link danger" onClick={handleImageRemove} disabled={uploading}>
              移除 Logo
            </button>
          </div>
        )}

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
          aspectRatio={LOGO_ASPECT_RATIO}
          busy={uploading}
          mode="fit"
          title="调整 Logo 显示效果"
          hint="前台 logo 按约 2.54:1 显示。图片已自动缩放到取景框内（不会被截断），可拖动调整位置或用滑块放大。"
          onCancel={() => setCropSource(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
