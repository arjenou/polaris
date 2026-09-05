import { useEffect, useState, type ChangeEvent } from "react";
import BannerFocalPicker from "../components/BannerFocalPicker";
import BannerUploadDialog from "../components/BannerUploadDialog";
import UploadSizeHint from "../components/UploadSizeHint";
import { BANNER_ASPECT_COMING_SOON } from "../lib/bannerAspectRatios";
import { DEFAULT_OBJECT_POSITION, type ObjectPosition } from "../lib/objectPosition";
import { maintenancePageApi, mediaApi, type MaintenancePage } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonBlock } from "../components/Skeleton";

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("无法读取图片尺寸"));
    };
    img.src = url;
  });
}

export default function MaintenancePageSettings() {
  const { showToast, showSuccessDialog } = useToast();
  const [item, setItem] = useState<MaintenancePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingPosition, setSavingPosition] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingSize, setPendingSize] = useState<{ width: number; height: number } | null>(null);
  const [draftPosition, setDraftPosition] = useState<ObjectPosition>(DEFAULT_OBJECT_POSITION);

  function refresh() {
    setLoading(true);
    maintenancePageApi
      .get()
      .then((data) => {
        setItem(data);
        setDraftPosition({
          x: data.objectPositionX ?? DEFAULT_OBJECT_POSITION.x,
          y: data.objectPositionY ?? DEFAULT_OBJECT_POSITION.y,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const size = await readImageSize(file);
      setPendingSize(size);
      setPendingFile(file);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "无法读取图片", "error");
    }
  }

  async function handleUploadConfirm(position: ObjectPosition) {
    if (!pendingFile) return;
    setUploading(true);
    setError(null);
    try {
      const res = await mediaApi.upload(pendingFile, "maintenance-page");
      const updated = await maintenancePageApi.update(
        res.key,
        res.width,
        res.height,
        position.x,
        position.y,
      );
      setItem(updated);
      setDraftPosition({ x: updated.objectPositionX, y: updated.objectPositionY });
      setPendingFile(null);
      setPendingSize(null);
      showSuccessDialog("上传成功");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "上传失败", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSavePosition() {
    setSavingPosition(true);
    try {
      const updated = await maintenancePageApi.updatePosition(draftPosition.x, draftPosition.y);
      setItem(updated);
      showSuccessDialog("显示位置已保存");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "保存失败", "error");
    } finally {
      setSavingPosition(false);
    }
  }

  async function handleRemove() {
    if (!confirm("确认删除背景图？此操作不可撤销。")) return;
    try {
      const updated = await maintenancePageApi.remove();
      setItem(updated);
      setDraftPosition(DEFAULT_OBJECT_POSITION);
      showSuccessDialog("删除成功");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  const positionDirty =
    item?.imageUrl &&
    (draftPosition.x !== item.objectPositionX || draftPosition.y !== item.objectPositionY);

  return (
    <div>
      <div className="page-header">
        <h1>メンテナンス页面管理</h1>
      </div>
      <p className="hint">
        管理「マンスリー」「創業支援」等メンテナンス中页面的大图背景。日语/中文页面共用同一张图；未上传时使用站点默认图片。
        上传后可在虚线框内拖动图片，选择前台实际展示区域。
      </p>

      {error && <p className="form-error">{error}</p>}

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2>背景图</h2>
        <UploadSizeHint spec="maintenanceBanner" />
        {loading ? (
          <SkeletonBlock width="100%" height={280} radius={6} style={{ display: "block", marginBottom: 16 }} />
        ) : item?.imageUrl ? (
          <>
            <BannerFocalPicker
              imageUrl={item.imageUrl}
              imageWidth={item.imageWidth}
              imageHeight={item.imageHeight}
              aspectRatio={BANNER_ASPECT_COMING_SOON}
              position={draftPosition}
              onChange={setDraftPosition}
            />
            <div className="form-actions" style={{ marginTop: 16, marginBottom: 16 }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSavePosition}
                disabled={savingPosition || !positionDirty}
              >
                {savingPosition ? "保存中…" : "保存显示位置"}
              </button>
              <button type="button" className="btn-link danger" onClick={handleRemove}>
                删除图片
              </button>
            </div>
          </>
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

      {pendingFile && (
        <BannerUploadDialog
          file={pendingFile}
          aspectRatio={BANNER_ASPECT_COMING_SOON}
          imageWidth={pendingSize?.width ?? null}
          imageHeight={pendingSize?.height ?? null}
          busy={uploading}
          onCancel={() => {
            setPendingFile(null);
            setPendingSize(null);
          }}
          onConfirm={handleUploadConfirm}
        />
      )}
    </div>
  );
}
