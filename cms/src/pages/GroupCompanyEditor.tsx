import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { groupCompaniesApi, mediaApi, type GroupCompanyInput, type GroupCompanyRegion } from "../lib/api";
import { useToast } from "../lib/ToastContext";

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
    imageKey: null,
    imageWidth: null,
    imageHeight: null,
    href: null,
    comingSoon: false,
  };
}

export default function GroupCompanyEditor({ mode }: { mode: "create" | "edit" }) {
  const { locale, region, id } = useParams<{ locale: "ja" | "zh"; region: GroupCompanyRegion; id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<GroupCompanyInput>(emptyForm(locale ?? "ja", region ?? "domestic"));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, "group-companies");
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
        const created = await groupCompaniesApi.create(form);
        showToast("创建成功");
        navigate(`/group-companies/${form.locale}/${form.region}/${created.id}/edit`, { replace: true });
      } else if (id) {
        await groupCompaniesApi.update(Number(id), form);
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
          业务内容
          <input value={form.business} onChange={(e) => update("business", e.target.value)} />
        </label>

        <label>
          所在地
          <input value={form.address} onChange={(e) => update("address", e.target.value)} />
        </label>

        <label>
          链接（可选，点击卡片跳转到的页面路径，如 /business-headquarters）
          <input value={form.href ?? ""} onChange={(e) => update("href", e.target.value || null)} />
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
