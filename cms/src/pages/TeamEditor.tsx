import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mediaApi, teamApi, type TeamMemberInput } from "../lib/api";
import { useToast } from "../lib/ToastContext";

const EMPTY_FORM: TeamMemberInput = {
  locale: "ja",
  lastName: "",
  firstName: "",
  lastNameKana: "",
  firstNameKana: "",
  department: "",
  position: "",
  description: "",
  tags: [],
  languages: [],
  imageKey: null,
  imageWidth: null,
  imageHeight: null,
  isPresident: false,
  published: true,
};

function splitList(text: string): string[] {
  return text
    .split(/[、,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TeamEditor({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, showSuccessDialog } = useToast();
  const [form, setForm] = useState<TeamMemberInput>(EMPTY_FORM);
  const [tagsText, setTagsText] = useState("");
  const [languagesText, setLanguagesText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      teamApi
        .get(Number(id))
        .then((member) => {
          setForm(member);
          setTagsText(member.tags.join("、"));
          setLanguagesText(member.languages.join("、"));
          setImageUrl(member.imageUrl);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id]);

  function update<K extends keyof TeamMemberInput>(key: K, value: TeamMemberInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, "team");
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
    const payload: TeamMemberInput = {
      ...form,
      tags: splitList(tagsText),
      languages: splitList(languagesText),
    };
    try {
      const goToList = () => navigate("/team");
      if (mode === "create") {
        await teamApi.create(payload);
        showSuccessDialog("创建成功", goToList);
      } else {
        await teamApi.update(Number(id), payload);
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
        <h1>{mode === "create" ? "新建社员" : "编辑社员"}</h1>
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
              checked={form.isPresident ?? false}
              onChange={(e) => update("isPresident", e.target.checked)}
            />
            设为社长（首页轮播中间首位固定展示，每个语言只能有一位）
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            显示（首页可见）
          </label>
        </div>

        <div className="form-row">
          <label>
            姓（漢字）
            <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
          </label>
          <label>
            名（漢字）
            <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
          </label>
        </div>

        <div className="form-row">
          <label>
            姓（フリガナ）
            <input
              value={form.lastNameKana}
              onChange={(e) => update("lastNameKana", e.target.value)}
              placeholder="サトウ"
            />
          </label>
          <label>
            名（フリガナ）
            <input
              value={form.firstNameKana}
              onChange={(e) => update("firstNameKana", e.target.value)}
              placeholder="タロウ"
            />
          </label>
        </div>

        <label>
          部门 / 职位（如「営業部 チームリーダー」）
          <input value={form.department} onChange={(e) => update("department", e.target.value)} required />
        </label>

        <label>
          资格（自由文本，多个资格用 | 分隔，如「宅地建物取引士 | FP2級」）
          <input value={form.position} onChange={(e) => update("position", e.target.value)} placeholder="宅地建物取引士" />
        </label>

        <label>
          标签（用、或 , 分隔，如「売買仲介、投資物件」）
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
        </label>

        <label>
          对应语言（用、或 , 分隔，如「日语、中文」）
          <input value={languagesText} onChange={(e) => setLanguagesText(e.target.value)} />
        </label>

        <label>
          简介
          <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
        </label>

        <label>
          头像
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
