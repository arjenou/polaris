import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";
import { mediaApi, pageGalleriesApi, type PageGalleryImage, type PageGalleryKey } from "../lib/api";
import { useToast } from "../lib/ToastContext";
import { SkeletonGrid } from "../components/Skeleton";

const TABS: { key: PageGalleryKey; label: string }[] = [
  { key: "real-estate", label: "不動産取引" },
  { key: "renovation", label: "リノベーション" },
  { key: "asset-management", label: "不動産管理" },
];

export default function PageGalleries() {
  const { showToast } = useToast();
  const [pageKey, setPageKey] = useState<PageGalleryKey>("real-estate");
  const [images, setImages] = useState<PageGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function refresh() {
    setLoading(true);
    pageGalleriesApi
      .list(pageKey)
      .then(setImages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [pageKey]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const res = await mediaApi.upload(file, "page-galleries");
        await pageGalleriesApi.add(pageKey, res.key, res.width, res.height);
      }
      showToast(`已上传 ${files.length} 张图片`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(image: PageGalleryImage) {
    if (!confirm("确认删除这张图片？此操作不可撤销。")) return;
    try {
      await pageGalleriesApi.remove(pageKey, image.id);
      showToast("删除成功");
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "删除失败", "error");
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setImages((prev) => {
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
      await pageGalleriesApi.reorder(pageKey, images.map((img) => img.id));
      showToast("排序已保存");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "排序保存失败", "error");
      refresh();
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>页面图片管理</h1>
      </div>

      <p className="hint">
        管理「不動産取引」「リノベーション」「不動産管理」三个页面最下方的图片轮播。图片在日语/中文页面共用同一组。拖动图片可调整顺序（拖动后自动保存）。
      </p>

      <div className="tabs">
        {TABS.map((tab) => (
          <button key={tab.key} className={pageKey === tab.key ? "active" : ""} onClick={() => setPageKey(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel">
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
        {error && <p className="form-error">{error}</p>}

        {loading ? (
          <SkeletonGrid count={6} />
        ) : images.length === 0 ? (
          <p className="empty-row">暂无图片</p>
        ) : (
          <div className="gallery-preview-grid gallery-preview-grid-draggable">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`gallery-preview-item ${dragIndex === index ? "dragging-item" : ""}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <img src={image.imageUrl} alt="" />
                <button type="button" className="gallery-remove-btn" onClick={() => handleDelete(image)}>
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
