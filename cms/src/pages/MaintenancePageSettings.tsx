import { useEffect, useState, type ChangeEvent } from "react";
import { maintenancePageApi, mediaApi, type MaintenancePage } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonBlock } from "../components/Skeleton";

export default function MaintenancePageSettings() {
  const { showToast, showSuccessDialog } = useToast();
  const [item, setItem] = useState<MaintenancePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    maintenancePageApi
      .get()
      .then(setItem)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(file, "maintenance-page");
      const updated = await maintenancePageApi.update(res.key, res.width, res.height);
      setItem(updated);
      showSuccessDialog("上传成功");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "上传失败", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemove() {
    if (!confirm("确认删除背景图？此操作不可撤销。")) return;
    try {
      const updated = await maintenancePageApi.remove();
      setItem(updated);
      showSuccessDialog("删除成功");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>メンテナンス页面管理</h1>
      </div>
      <p className="hint">
        管理「マンスリー」「創業支援」等メンテナンス中页面的大图背景。日语/中文页面共用同一张图；未上传时使用站点默认图片。
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2>背景图</h2>
        {loading ? (
          <SkeletonBlock width="100%" height={280} radius={6} style={{ display: "block", marginBottom: 16 }} />
        ) : item?.imageUrl ? (
          <div className="gallery-preview-item" style={{ width: "100%", maxWidth: 560, marginBottom: 16 }}>
            <img src={item.imageUrl} alt="" style={{ width: "100%", height: "auto", display: "block" }} />
            <button type="button" className="gallery-remove-btn" onClick={handleRemove}>
              删除
            </button>
          </div>
        ) : (
          <p
            className="empty-row"
            style={{
              width: "100%",
              maxWidth: 560,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #d6dae2",
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            尚未上传（使用默认背景图）
          </p>
        )}
        <label className="upload-label">
          {item?.imageUrl ? "重新上传" : "上传背景图"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading || loading}
          />
        </label>
        {uploading && <p>上传中…</p>}
      </div>
    </div>
  );
}
