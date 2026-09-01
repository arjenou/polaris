import { useEffect, useState, type ChangeEvent } from "react";
import { contactQrApi, mediaApi, type ContactQr, type ContactQrType } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonBlock } from "../components/Skeleton";

const CARDS: { type: ContactQrType; label: string }[] = [
  { type: "wechat", label: "WeChat 二维码" },
  { type: "line", label: "Line 二维码" },
];

function QrCard({ type, label, item, onChange }: {
  type: ContactQrType;
  label: string;
  item: ContactQr | undefined;
  onChange: () => void;
}) {
  const { showToast, showSuccessDialog } = useToast();
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await mediaApi.upload(file, "contact");
      await contactQrApi.update(type, res.key, res.width, res.height);
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
      await contactQrApi.remove(type);
      showSuccessDialog("删除成功");
      onChange();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 280 }}>
      <h2>{label}</h2>
      {item?.imageUrl ? (
        <div className="gallery-preview-item" style={{ width: 160, height: 160, marginBottom: 16 }}>
          <img src={item.imageUrl} alt="" style={{ height: 160 }} />
          <button type="button" className="gallery-remove-btn" onClick={handleRemove}>
            删除
          </button>
        </div>
      ) : (
        <p className="empty-row" style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #d6dae2", borderRadius: 6, marginBottom: 16 }}>
          尚未上传
        </p>
      )}
      <label className="upload-label">
        {item?.imageUrl ? "重新上传" : "上传二维码图片"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {uploading && <p>上传中…</p>}
    </div>
  );
}

export default function ContactQrSettings() {
  const [items, setItems] = useState<ContactQr[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    contactQrApi
      .list()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  return (
    <div>
      <div className="page-header">
        <h1>联系二维码</h1>
      </div>
      <p className="hint">
        管理「お問い合わせ」页面展示的 WeChat / Line 二维码图片。ja/zh 两个语言页面共用同一组图片。
      </p>

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {loading
          ? CARDS.map((card) => (
              <div key={card.type} className="panel" style={{ maxWidth: 280 }}>
                <h2>{card.label}</h2>
                <SkeletonBlock width={160} height={160} radius={6} style={{ display: "block", marginBottom: 16 }} />
                <SkeletonBlock width={120} height={14} />
              </div>
            ))
          : CARDS.map((card) => (
              <QrCard
                key={card.type}
                type={card.type}
                label={card.label}
                item={items.find((i) => i.type === card.type)}
                onChange={refresh}
              />
            ))}
      </div>
    </div>
  );
}
